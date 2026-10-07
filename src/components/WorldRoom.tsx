'use client';

import { BedDouble, DoorOpen, Laptop, Mic2, Smartphone, Utensils, Shirt, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

type Spot = { id: string; label: string; icon: LucideIcon; x: number; y: number; side?: 'left' | 'right' };

/**
 * The one hotspot coordinate set. x/y are percentages of the 16:9 apartment plate
 * (public/art/artist-apartment.webp), measured on the object each spot stands for.
 * All of them sit inside the HUD-safe zone (x 9–91%, y 14–78%).
 */
export const ROOM_SPOTS: Spot[] = [
  { id: 'wardrobe', label: 'Boutique', icon: Shirt, x: 9, y: 31 },
  { id: 'phone', label: 'Phone', icon: Smartphone, x: 23.5, y: 26 },
  { id: 'laptop', label: 'Career', icon: Laptop, x: 33, y: 20 },
  { id: 'studio', label: 'Studio', icon: Mic2, x: 42.5, y: 19 },
  { id: 'door', label: 'The city', icon: DoorOpen, x: 68, y: 24 },
  { id: 'bed', label: 'Sleep · end day', icon: BedDouble, x: 76, y: 45, side: 'left' },
  { id: 'kitchen', label: 'Eat', icon: Utensils, x: 89, y: 60, side: 'left' },
];
const LOCAL_SPOT: Spot = { id: 'local', label: 'Seyi’s session', icon: Mic2, x: 51, y: 31 };

export function roomSpots(city: string) {
  return city === 'Atlanta' ? [...ROOM_SPOTS, LOCAL_SPOT] : ROOM_SPOTS;
}

export default function WorldRoom({ city, currentLocation, onInteract }: { city: string; currentLocation: string; onInteract: (name: string) => void }) {
  return <div className="world-room" aria-label={`${currentLocation}, ${city}`}>
    <div className="world-coordinate-frame">
      <div className="avatar-figure" aria-hidden="true"><div className="head"/><div className="body"/></div>
      {roomSpots(city).map(({ id, label, icon: Icon, x, y, side }) => <button
        key={id}
        type="button"
        className={`spot${side === 'left' ? ' spot--left' : ''}`}
        style={{ '--x': `${x}%`, '--y': `${y}%` } as CSSProperties}
        aria-label={label}
        onClick={() => onInteract(id)}
      >
        <span className="spot-dot" aria-hidden="true"/>
        <span className="spot-tag"><Icon size={14} aria-hidden="true"/>{label}</span>
      </button>)}
    </div>
  </div>;
}
