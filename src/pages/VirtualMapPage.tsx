import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const VirtualMapPage = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadH5P = async () => {
      try {
        if (!containerRef.current) {
          throw new Error('Container not found');
        }

        // Load required scripts
        await Promise.all([
          loadScript('/h5p/H5P.ThreeJS-1.0/dist/three.min.js'),
          loadScript('/h5p/H5P.ThreeSixty-0.3/scripts/three-sixty.js'),
          loadScript('/h5p/H5P.GoToScene-0.1/scripts/go-to-scene.js'),
          loadScript('/h5p/H5P.ThreeImage-0.5/dist/h5p-three-image.js')
        ]);

        // Load styles
        loadStyle('/h5p/H5P.ThreeImage-0.5/dist/h5p-three-image.css');
        loadStyle('/h5p/FontAwesome-4.5/h5p-font-awesome.min.css');

        // Initialize H5P namespace
        window.H5P = window.H5P || {};
        window.H5P.preventInit = true;
        window.H5P.ThreeJS = THREE;
        window.H5P.OrbitControls = OrbitControls;

        // Add EventDispatcher
        window.H5P.EventDispatcher = function() {
          this.on = function() {};
          this.trigger = function() {};
        };

        // Add Label class
        window.H5P.Label = function(text: string, position: string = 'top') {
          this.labelText = text;
          this.position = position;
          this.showLabel = 'inherit';
        };

        // Add GoToScene class
        window.H5P.GoToScene = function(params: any) {
          this.nextSceneId = params.nextSceneId;
        };

        // Define ThreeImage
        window.H5P.ThreeImage = function(params: any, container: HTMLElement) {
          window.H5P.EventDispatcher.call(this);

          // Store references
          const self = this;
          self.params = params;
          self.container = container;
          self.currentScene = 0;

          // Initialize Three.js scene
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          
          renderer.setSize(container.clientWidth, container.clientHeight);
          container.appendChild(renderer.domElement);

          // Initialize controls
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.screenSpacePanning = false;
          controls.minDistance = 1;
          controls.maxDistance = 500;
          controls.maxPolarAngle = Math.PI / 2;

          // Load the current scene
          const loadScene = (sceneId: number) => {
            // Clear existing scene
            while(scene.children.length > 0) { 
              scene.remove(scene.children[0]); 
            }

            self.currentScene = sceneId;
            const sceneData = params.scenes.find((s: any) => s.sceneId === sceneId);
            
            if (!sceneData) {
              console.error('Scene not found:', sceneId);
              return;
            }

            console.log('Loading scene:', sceneData);

            // Load panorama texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
              '/h5p/content/' + sceneData.scenesrc.path,
              (texture) => {
                // Create sphere geometry
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const sphere = new THREE.Mesh(geometry, material);
                scene.add(sphere);

                // Add navigation hotspots
                if (sceneData.interactions) {
                  sceneData.interactions.forEach((interaction: any) => {
                    if (interaction.action && interaction.action.params && interaction.action.params.nextSceneId !== undefined) {
                      // Parse interaction position
                      const [yaw, pitch] = interaction.interactionpos.split(',').map(Number);

                      // Create a group to hold both arrow and label
                      const navigationGroup = new THREE.Group();
                      navigationGroup.userData = {
                        type: 'navigation',
                        nextSceneId: interaction.action.params.nextSceneId,
                        label: interaction.labelText
                      };

                      // Create arrow shape
                      const arrowShape = new THREE.Shape();
                      arrowShape.moveTo(0, 1);
                      arrowShape.lineTo(0.5, -0.5);
                      arrowShape.lineTo(0.2, -0.3);
                      arrowShape.lineTo(0.2, -0.8);
                      arrowShape.lineTo(-0.2, -0.8);
                      arrowShape.lineTo(-0.2, -0.3);
                      arrowShape.lineTo(-0.5, -0.5);
                      arrowShape.lineTo(0, 1);

                      const extrudeSettings = {
                        steps: 2,
                        depth: 0.1,
                        bevelEnabled: true,
                        bevelThickness: 0.05,
                        bevelSize: 0.05,
                        bevelSegments: 3
                      };

                      const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
                      const arrowMaterial = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.9,
                        side: THREE.DoubleSide,
                        shininess: 100
                      });

                      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
                      arrow.scale.set(3, 3, 3);

                      // Convert spherical coordinates to Cartesian
                      const phi = THREE.MathUtils.degToRad(90 - pitch);
                      const theta = THREE.MathUtils.degToRad(yaw);
                      const radius = 250;

                      navigationGroup.position.setFromSphericalCoords(radius, phi, theta);
                      navigationGroup.lookAt(0, 0, 0);
                      navigationGroup.rotateX(Math.PI / 2);

                      // Add arrow to group
                      navigationGroup.add(arrow);

                      // Add point light
                      const pointLight = new THREE.PointLight(0xffffff, 1, 50);
                      pointLight.position.set(0, 5, 0);
                      navigationGroup.add(pointLight);

                      // Create label
                      if (interaction.labelText) {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (context) {
                          const padding = 20;
                          canvas.width = 256;
                          canvas.height = 64;

                          // Draw background
                          context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                          context.roundRect(0, 0, canvas.width, canvas.height, 10);
                          context.fill();

                          // Draw border
                          context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                          context.lineWidth = 2;
                          context.roundRect(padding/2, padding/2, canvas.width - padding, canvas.height - padding, 8);
                          context.stroke();

                          // Draw text
                          context.font = 'bold 24px Arial';
                          context.fillStyle = 'white';
                          context.textAlign = 'center';
                          context.textBaseline = 'middle';
                          context.fillText(interaction.labelText, canvas.width / 2, canvas.height / 2);

                          const labelTexture = new THREE.CanvasTexture(canvas);
                          labelTexture.minFilter = THREE.LinearFilter;
                          const labelMaterial = new THREE.SpriteMaterial({ 
                            map: labelTexture,
                            transparent: true,
                            opacity: 0.8
                          });
                          const labelSprite = new THREE.Sprite(labelMaterial);
                          labelSprite.scale.set(40, 10, 1);
                          labelSprite.position.set(0, 15, 0);
                          
                          // Add label to group
                          navigationGroup.add(labelSprite);
                        }
                      }

                      // Add the group to the scene
                      scene.add(navigationGroup);

                      // Handle interactions
                      const hoverState = {
                        isHovered: false,
                        originalScale: arrow.scale.clone(),
                        originalColor: arrowMaterial.color.clone(),
                        originalOpacity: arrowMaterial.opacity
                      };

                      const updateHoverState = (intersected: boolean) => {
                        if (intersected && !hoverState.isHovered) {
                          hoverState.isHovered = true;
                          arrow.scale.copy(hoverState.originalScale).multiplyScalar(1.2);
                          arrowMaterial.color.setHex(0xffd700);
                          arrowMaterial.opacity = 1;
                          document.body.style.cursor = 'pointer';
                          navigationGroup.children.forEach(child => {
                            if (child instanceof THREE.Sprite) {
                              child.material.opacity = 1;
                            }
                          });
                        } else if (!intersected && hoverState.isHovered) {
                          hoverState.isHovered = false;
                          arrow.scale.copy(hoverState.originalScale);
                          arrowMaterial.color.copy(hoverState.originalColor);
                          arrowMaterial.opacity = hoverState.originalOpacity;
                          document.body.style.cursor = 'default';
                          navigationGroup.children.forEach(child => {
                            if (child instanceof THREE.Sprite) {
                              child.material.opacity = 0.8;
                            }
                          });
                        }
                      };

                      // Update the raycaster check to include the whole group
                      const checkInteraction = (event: MouseEvent, click = false) => {
                        const rect = renderer.domElement.getBoundingClientRect();
                        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                        raycaster.setFromCamera(mouse, camera);
                        const intersects = raycaster.intersectObjects(navigationGroup.children, true);

                        if (click && intersects.length > 0) {
                          const group = intersects[0].object.parent;
                          if (group && group.userData.nextSceneId !== undefined) {
                            loadScene(group.userData.nextSceneId);
                          }
                        } else {
                          updateHoverState(intersects.length > 0);
                        }
                      };

                      renderer.domElement.addEventListener('mousemove', (e) => checkInteraction(e));
                      renderer.domElement.addEventListener('click', (e) => checkInteraction(e, true));
                    }
                  });
                }

                // Add ambient light to scene
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);

                // Set initial camera position if specified
                if (sceneData.cameraStartPosition) {
                  const [yaw, pitch] = sceneData.cameraStartPosition.split(',').map(Number);
                  camera.rotation.set(
                    THREE.MathUtils.degToRad(pitch),
                    THREE.MathUtils.degToRad(yaw),
                    0,
                    'YXZ'
                  );
                }
              },
              undefined,
              (err) => {
                console.error('Error loading texture:', err);
                if (mounted) {
                  setError('Failed to load scene texture');
                }
              }
            );
          };

          // Handle click events
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          renderer.domElement.addEventListener('click', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            for (const intersect of intersects) {
              if (intersect.object.userData && intersect.object.userData.type === 'navigation') {
                loadScene(intersect.object.userData.nextSceneId);
                break;
              }
            }
          });

          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };
          animate();

          // Load initial scene
          loadScene(0);

          // Handle window resize
          window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
          });
        };

        // Set up prototype chain
        window.H5P.ThreeImage.prototype = Object.create(window.H5P.EventDispatcher.prototype);
        window.H5P.ThreeImage.prototype.constructor = window.H5P.ThreeImage;

        // Load content
        const response = await fetch('/h5p/content/content.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch content.json: ${response.status} ${response.statusText}`);
        }
        const content = await response.json();
        console.log('Content loaded:', content);

        // Initialize H5P content with the loaded content
        new window.H5P.ThreeImage(content.threeImage, containerRef.current);

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading H5P:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load virtual tour');
          setIsLoading(false);
        }
      }
    };

    // Helper function to load scripts
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Helper function to load styles
    const loadStyle = (href: string): void => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    loadH5P();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
          <span>Back</span>
        </Link>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <Info size={24} />
        </button>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-100"
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-xl">Loading virtual tour...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      )}

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md">
          <h2 className="text-lg font-semibold mb-2">How to navigate</h2>
          <ul className="space-y-2">
            <li>• Click and drag to look around</li>
            <li>• Click on green markers to move between scenes</li>
            <li>• Use mouse wheel to zoom in/out</li>
          </ul>
        </div>
      )}
    </div>
  );
};

declare global {
  interface Window {
    H5P: any & {
      ThreeJS: typeof THREE;
      OrbitControls: typeof OrbitControls;
      EventDispatcher: any;
      Label: any;
      GoToScene: any;
      ThreeImage: any;
    };
  }
}

export default VirtualMapPage;
