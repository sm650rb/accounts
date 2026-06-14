export interface BikeColor {
  id: string;
  name: string;
  swatch: string;
  image: string;
}

export const BIKE_COLORS: BikeColor[] = [
  {
    id: 'astral-black',
    name: 'Astral Black',
    swatch: '#1c1c1c',
    image: '/img/models/1_astral_black.png',
  },
  {
    id: 'astral-blue',
    name: 'Astral Blue',
    swatch: '#1e3a5f',
    image: '/img/models/2_astral_blue.png',
  },
  {
    id: 'astral-green',
    name: 'Astral Green',
    swatch: '#2d4a3e',
    image: '/img/models/3_astral_green.png',
  },
  {
    id: 'interstellar-green',
    name: 'Interstellar Green',
    swatch: '#3d5c52',
    image: '/img/models/4_interstellar_green.png',
  },
  {
    id: 'interstellar-grey',
    name: 'Interstellar Grey',
    swatch: '#6b7280',
    image: '/img/models/5_interstellar_grey.png',
  },
  {
    id: 'celestial-red',
    name: 'Celestial Red',
    swatch: '#8b2635',
    image: '/img/models/6_celestial_red.png',
  },
  {
    id: 'celestial-blue',
    name: 'Celestial Blue',
    swatch: '#4a6fa5',
    image: '/img/models/7_celestial_blue.png',
  },
];

export const BIKE_COLOR_NAMES = BIKE_COLORS.map((c) => c.name);

export function findBikeColor(name: string | null | undefined): BikeColor | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return BIKE_COLORS.find((c) => c.name.toLowerCase() === normalized);
}

export function isValidBikeColor(name: string | null | undefined): boolean {
  if (!name || name.trim() === '') return true;
  return findBikeColor(name) !== undefined;
}
