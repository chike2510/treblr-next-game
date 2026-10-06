export type City = { name: string; code: string; region: string; scene: string; image: string };

export const TRAVEL_CASH = 420;
export const TRAVEL_ENERGY = 15;

/** One postcard per city: duotone night photography in public/art/cities. */
export const CITIES: City[] = [
  { name: 'Lagos', code: 'LOS', region: 'Nigeria', scene: 'Afrofusion · live rooms', image: '/art/cities/city-lagos.webp' },
  { name: 'London', code: 'LHR', region: 'United Kingdom', scene: 'UK garage · all-night studios', image: '/art/cities/city-london.webp' },
  { name: 'New York', code: 'JFK', region: 'United States', scene: 'Left-field pop · late nights', image: '/art/cities/city-new-york.webp' },
  { name: 'Los Angeles', code: 'LAX', region: 'United States', scene: 'Sessions · open roads', image: '/art/cities/city-los-angeles.webp' },
  { name: 'Atlanta', code: 'ATL', region: 'United States', scene: '808s · Seyi’s late session', image: '/art/cities/city-atlanta.webp' },
  { name: 'Toronto', code: 'YYZ', region: 'Canada', scene: 'After hours · R&B', image: '/art/cities/city-toronto.webp' },
  { name: 'Accra', code: 'ACC', region: 'Ghana', scene: 'Highlife · new energy', image: '/art/cities/city-accra.webp' },
  { name: 'Johannesburg', code: 'JNB', region: 'South Africa', scene: 'Amapiano · big stages', image: '/art/cities/city-johannesburg.webp' },
  { name: 'Paris', code: 'CDG', region: 'France', scene: 'Art after dark · style', image: '/art/cities/city-paris.webp' },
  { name: 'Tokyo', code: 'HND', region: 'Japan', scene: 'Neon nights · precision', image: '/art/cities/city-tokyo.webp' },
  { name: 'Seoul', code: 'ICN', region: 'South Korea', scene: 'Bright stages · sharp sounds', image: '/art/cities/city-seoul.webp' },
  { name: 'Dubai', code: 'DXB', region: 'UAE', scene: 'Big rooms · wide horizons', image: '/art/cities/city-dubai.webp' },
];

export const cityByName = (name: string) => CITIES.find((city) => city.name === name) ?? CITIES[0];
