export interface TourLocation {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  position: [number, number, number];
  connections: string[];
}

export const tourLocations: TourLocation[] = [
  {
    id: 'entrance',
    name: 'Main Entrance',
    description: 'Welcome to our virtual tour! Start exploring from here.',
    imageUrl: 'https://cdn.pixabay.com/photo/2022/06/15/09/25/360-7263731_1280.jpg',
    position: [0, 0, 0],
    connections: ['reception']
  },
  {
    id: 'reception',
    name: 'Reception Area',
    description: 'Our modern reception area where visitors check in.',
    imageUrl: 'https://cdn.pixabay.com/photo/2022/06/15/09/25/360-7263733_1280.jpg',
    position: [5, 0, 0],
    connections: ['entrance', 'hallway']
  }
];
