import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HeatmapPoint {
  location: {
    latitude: number;
    longitude: number;
    geohash: string;
  };
  query: {
    affinity: number;
    affinity_rank: number;
    popularity: number;
  };
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  heatmapData: HeatmapPoint[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedEntity?: any;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  center, 
  zoom, 
  heatmapData, 
  onLocationSelect,
  selectedEntity 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const selectedLocationMarkerRef = useRef<L.Marker | null>(null);

  // Centralized function to update the selected location marker
  const updateSelectedLocationMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing selected location marker
    if (selectedLocationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(selectedLocationMarkerRef.current);
    }
    
    // Create new selected location marker
    const selectedMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'selected-location-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: linear-gradient(45deg, #a855f7, #f97316);
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            animation: selected-pulse 2s infinite;
            position: relative;
          "></div>
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 12px solid #a855f7;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
          <style>
            @keyframes selected-pulse {
              0%, 100% { 
                transform: scale(1); 
                box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0 rgba(168, 85, 247, 0.7); 
              }
              50% { 
                transform: scale(1.1); 
                box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 15px rgba(168, 85, 247, 0); 
              }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      })
    });
    
    selectedMarker.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 200px;">
        <div style="background: linear-gradient(45deg, #a855f7, #f97316); color: white; padding: 8px; margin: -8px -8px 8px -8px; border-radius: 4px;">
          <strong>📍 Selected Location</strong>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Coordinates:</strong><br>
          Latitude: ${lat.toFixed(6)}°<br>
          Longitude: ${lng.toFixed(6)}°
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          Click "Generate Cultural Heatmap" to analyze this location
        </div>
      </div>
    `);
    
    mapInstanceRef.current.addLayer(selectedMarker);
    selectedLocationMarkerRef.current = selectedMarker;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for location selection
    if (onLocationSelect) {
      map.on('click', (e) => {
        // Use centralized marker update function
        updateSelectedLocationMarker(e.latlng.lat, e.latlng.lng);
        
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    }

    // Create markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersRef.current = markersGroup;

    return () => {
      if (selectedLocationMarkerRef.current) {
        selectedLocationMarkerRef.current.remove();
      }
      map.remove();
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
      
      // Update selected location marker based on center prop
      if (center) {
        updateSelectedLocationMarker(center[0], center[1]);
      } else {
        // Remove marker if no center is provided
        if (selectedLocationMarkerRef.current) {
          mapInstanceRef.current.removeLayer(selectedLocationMarkerRef.current);
          selectedLocationMarkerRef.current = null;
        }
      }
    }
  }, [center, zoom]);

  // Update heatmap visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    if (heatmapData.length === 0) return;

    // Create custom icons based on affinity levels
    const createAffinityIcon = (affinity: number) => {
      const size = Math.max(8, Math.min(24, affinity * 30));
      const opacity = Math.max(0.4, affinity);
      
      let color = '#3b82f6'; // blue for low
      if (affinity > 0.7) color = '#ef4444'; // red for high
      else if (affinity > 0.4) color = '#f59e0b'; // orange for medium
      
      return L.divIcon({
        className: 'custom-affinity-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            opacity: ${opacity};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse-${affinity > 0.7 ? 'high' : affinity > 0.4 ? 'medium' : 'low'} 2s infinite;
          "></div>
          <style>
            @keyframes pulse-high {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
              50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            }
            @keyframes pulse-medium {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
            }
            @keyframes pulse-low {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          </style>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    };

    // Add heatmap points as markers
    heatmapData.forEach((point, index) => {
      const marker = L.marker(
        [point.location.latitude, point.location.longitude],
        { icon: createAffinityIcon(point.query.affinity) }
      );

      // Create popup with detailed information
      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <div style="background: linear-gradient(45deg, #a855f7, #f97316); color: white; padding: 8px; margin: -8px -8px 8px -8px; border-radius: 4px;">
            <strong>Cultural Affinity Point #${index + 1}</strong>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Location:</strong><br>
            ${point.location.latitude.toFixed(4)}°, ${point.location.longitude.toFixed(4)}°
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Affinity Score:</strong><br>
            <div style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">
              ${Math.round(point.query.affinity * 100)}%
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Popularity:</strong> ${Math.round(point.query.popularity * 100)}%
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            Geohash: ${point.location.geohash}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current?.addLayer(marker);
    });


  }, [heatmapData, selectedEntity, center]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-xl border border-gray-600 shadow-2xl"
      style={{ minHeight: '400px' }}
      role="application"
      aria-label="Interactive map for cultural location analysis. Click on any location to analyze cultural preferences in that area."
    />
  );
};

export default LeafletMap;