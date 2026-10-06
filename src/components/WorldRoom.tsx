'use client';

import { ArrowUpRight, BedDouble, DoorOpen, Laptop, Mic2, Smartphone, Utensils, Shirt } from 'lucide-react';

const items = [
  { id: 'bed', label: 'REST', icon: BedDouble, className: 'hot-bed' },
  { id: 'studio', label: 'STUDIO', icon: Mic2, className: 'hot-studio' },
  { id: 'phone', label: 'PHONE', icon: Smartphone, className: 'hot-phone' },
  { id: 'door', label: 'THE CITY', icon: DoorOpen, className: 'hot-door' },
  { id: 'kitchen', label: 'EAT', icon: Utensils, className: 'hot-kitchen' },
  { id: 'wardrobe', label: 'BOUTIQUE', icon: Shirt, className: 'hot-wardrobe' },
];

export default function WorldRoom({ city, onInteract }: { city: string; onInteract: (name: string) => void }) {
  return <div className="world-room" aria-label={`${city} artist apartment`}>
    <div className="avatar-figure" aria-label="Candelar in the apartment"><div className="head"/><div className="body"/><span className="avatar-caption">Candelar</span></div>
    {items.map(({ id, label, icon: Icon, className }) => <button key={id} className={`hotspot ${className}`} aria-label={label} onClick={() => onInteract(id)}><span className="hotspot-ring"/><span className="hotspot-label"><Icon size={14}/>{label}<ArrowUpRight size={10} style={{ opacity: .65 }}/></span></button>)}
    <button className="hotspot" style={{ left: '64%', top: '79%' }} aria-label="Career on computer" onClick={() => onInteract('laptop')}><span className="hotspot-ring"/><span className="hotspot-label"><Laptop size={14}/>CAREER<ArrowUpRight size={10} style={{ opacity: .65 }}/></span></button>
    <span className="room-caption eyebrow">CANDELAR’S APARTMENT <i/> {city.toUpperCase()}</span>
  </div>;
}
