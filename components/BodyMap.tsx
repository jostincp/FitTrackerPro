'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type MeasurementZone = {
  id: string;
  name: string;
  x: number;
  y: number;
  fieldId: string;
};

type BodyMapProps = {
  onZoneClick?: (fieldId: string) => void;
  highlightedZone?: string;
  className?: string;
};

const measurementZones: MeasurementZone[] = [
  { id: 'chest', name: 'Pecho', x: 150, y: 120, fieldId: 'chest' },
  { id: 'waist', name: 'Cintura', x: 150, y: 160, fieldId: 'waist' },
  { id: 'hips', name: 'Caderas', x: 150, y: 190, fieldId: 'hips' },
  { id: 'biceps-left', name: 'Bíceps', x: 110, y: 130, fieldId: 'biceps' },
  { id: 'biceps-right', name: 'Bíceps', x: 190, y: 130, fieldId: 'biceps' },
  { id: 'thighs-left', name: 'Muslos', x: 135, y: 220, fieldId: 'thighs' },
  { id: 'thighs-right', name: 'Muslos', x: 165, y: 220, fieldId: 'thighs' },
  { id: 'neck', name: 'Cuello', x: 150, y: 85, fieldId: 'neck' },
];

export default function BodyMap({ onZoneClick, highlightedZone, className }: BodyMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneClick = (fieldId: string) => {
    onZoneClick?.(fieldId);
  };

  const isZoneActive = (zoneId: string, fieldId: string) => {
    return hoveredZone === zoneId || highlightedZone === fieldId;
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative">
        <svg
          width="300"
          height="400"
          viewBox="0 0 300 400"
          className="w-full max-w-sm mx-auto"
          style={{ maxHeight: '500px' }}
        >
          {/* Silueta del cuerpo humano */}
          <g fill="none" stroke="#e5e7eb" strokeWidth="2">
            {/* Cabeza */}
            <circle cx="150" cy="60" r="25" fill="#f9fafb" />
            
            {/* Cuello */}
            <line x1="150" y1="85" x2="150" y2="100" />
            
            {/* Torso */}
            <path
              d="M 130 100 Q 120 120 125 160 Q 130 200 140 220 L 160 220 Q 170 200 175 160 Q 180 120 170 100 Z"
              fill="#f9fafb"
            />
            
            {/* Brazos */}
            <path
              d="M 130 110 Q 110 120 100 140 Q 95 160 100 180 Q 105 190 115 185"
              fill="#f9fafb"
            />
            <path
              d="M 170 110 Q 190 120 200 140 Q 205 160 200 180 Q 195 190 185 185"
              fill="#f9fafb"
            />
            
            {/* Piernas */}
            <path
              d="M 140 220 Q 135 250 130 280 Q 125 320 130 360 Q 135 380 145 375"
              fill="#f9fafb"
            />
            <path
              d="M 160 220 Q 165 250 170 280 Q 175 320 170 360 Q 165 380 155 375"
              fill="#f9fafb"
            />
          </g>

          {/* Puntos de medición interactivos */}
          {measurementZones.map((zone) => {
            const isActive = isZoneActive(zone.id, zone.fieldId);
            return (
              <g key={zone.id}>
                {/* Círculo del punto */}
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={isActive ? "8" : "6"}
                  fill={isActive ? "#f97316" : "#fb923c"}
                  stroke={isActive ? "#ea580c" : "#f97316"}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:scale-110"
                  onClick={() => handleZoneClick(zone.fieldId)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
                
                {/* Etiqueta del punto (visible en hover) */}
                {isActive && (
                  <g>
                    <rect
                      x={zone.x - 25}
                      y={zone.y - 25}
                      width="50"
                      height="20"
                      rx="4"
                      fill="#1f2937"
                      fillOpacity="0.9"
                    />
                    <text
                      x={zone.x}
                      y={zone.y - 12}
                      textAnchor="middle"
                      className="text-xs fill-white font-medium"
                    >
                      {zone.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Leyenda */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Haz clic en los puntos naranjas para enfocar el campo correspondiente
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span>Zonas de medición</span>
        </div>
      </div>
    </div>
  );
}