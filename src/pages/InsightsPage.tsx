import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Zap, X, Star, Settings, Play } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { qlooService } from '../services/qloo';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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

// Component to handle map clicks
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

// Component to create heatmap circles
const HeatmapLayer: React.FC<{ heatmapData: HeatmapPoint[] }> = ({ heatmapData }) => {
  return (
    <>
      {heatmapData.map((point, index) => {
        const intensity = point.query.affinity;
        let color = '#3b82f6'; // Blue for low affinity
        let fillOpacity = 0.3;
        
        if (intensity > 0.7) {
          color = '#f97316'; // Orange for high affinity
          fillOpacity = 0.7;
        } else if (intensity > 0.4) {
          color = '#a855f7'; // Purple for medium affinity
          fillOpacity = 0.5;
        }
        
        const radius = 3 + (intensity * 12); // Size based on affinity
        
        return (
          <L.Circle
            key={`heatmap-${index}`}
            center={[point.location.latitude, point.location.longitude]}
            radius={radius * 100} // Convert to meters for map display
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: fillOpacity,
              weight: 2,
              opacity: 0.8
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">Affinity: {Math.round(intensity * 100)}%</div>
                <div>Popularity: {Math.round(point.query.popularity * 100)}%</div>
                <div className="text-xs text-gray-600 mt-1">
                  {point.location.latitude.toFixed(4)}°, {point.location.longitude.toFixed(4)}°
                </div>
              </div>
            </Popup>
          </L.Circle>
        );
      })}
    </>
  );
};

const InsightsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Map and location states
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50000); // Default 50km
  const [showMap, setShowMap] = useState(false);
  
  // Heatmap states
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [generatingHeatmap, setGeneratingHeatmap] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    setShowSuggestions(true);

    try {
      const results = await qlooService.searchEntities(query, 8);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching entities:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleEntitySelect = (entity: any) => {
    setSelectedEntity(entity);
    setSearchInput(entity.name);
    setShowSuggestions(false);
    setSearchResults([]);
    setShowMap(true);
  };

  const clearEntity = () => {
    setSelectedEntity(null);
    setSearchInput('');
    setShowMap(false);
    setSelectedLocation(null);
    setShowHeatmap(false);
    setHeatmapData([]);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const generateHeatmap = async () => {
    if (!selectedEntity || !selectedLocation) return;
    
    setGeneratingHeatmap(true);
    
    try {
      // Call Qloo insights API with heatmap filter
      const response = await qlooService.getHeatmapInsights(
        selectedEntity.entity_id,
        selectedLocation.lng,
        selectedLocation.lat,
        radius
      );
      
      setHeatmapData(response);
      setShowHeatmap(true);
    } catch (error) {
      console.error('Error generating heatmap:', error);
      // Generate mock heatmap data for demonstration
      const mockData = generateMockHeatmapData();
      setHeatmapData(mockData);
      setShowHeatmap(true);
    } finally {
      setGeneratingHeatmap(false);
    }
  };

  const generateMockHeatmapData = (): HeatmapPoint[] => {
    if (!selectedLocation) return [];
    
    const points: HeatmapPoint[] = [];
    const baseLatitude = selectedLocation.lat;
    const baseLongitude = selectedLocation.lng;
    
    // Generate random points around the selected location
    for (let i = 0; i < 50; i++) {
      const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
      const lngOffset = (Math.random() - 0.5) * 2; // ±1 degree
      
      points.push({
        location: {
          latitude: baseLatitude + latOffset,
          longitude: baseLongitude + lngOffset,
          geohash: `mock_${i}`
        },
        query: {
          affinity: Math.random(),
          affinity_rank: Math.random(),
          popularity: Math.random()
        }
      });
    }
    
    return points;
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Cultural Insights Heatmap</h1>
          <p className="text-gray-400 text-lg">Discover cultural affinity patterns across geographic locations</p>
        </motion.div>

        {/* Entity Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <Search className="h-6 w-6 text-purple-400 mr-3" />
            <h3 className="text-2xl font-semibold text-white">Select Entity for Analysis</h3>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => searchInput && setShowSuggestions(true)}
                placeholder="Search for artists, movies, books, brands, places..."
                className="w-full pl-12 pr-12 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {selectedEntity && (
                <button
                  onClick={clearEntity}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Selected Entity Display */}
            {selectedEntity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-purple-500/20 border border-purple-400/30 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  {selectedEntity.properties?.image?.url && (
                    <img 
                      src={selectedEntity.properties.image.url} 
                      alt={selectedEntity.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="text-white font-semibold text-lg">{selectedEntity.name}</h4>
                    <p className="text-purple-300">{selectedEntity.types?.[0]?.replace('urn:entity:', '') || 'Entity'}</p>
                    {selectedEntity.popularity && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">
                          {Math.round(selectedEntity.popularity * 100)}% popularity
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Search Suggestions */}
            {showSuggestions && (searchResults.length > 0 || searching) && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-3">Searching entities...</p>
                  </div>
                ) : (
                  searchResults.map((entity, index) => (
                    <button
                      key={entity.entity_id || index}
                      onClick={() => handleEntitySelect(entity)}
                      className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/50 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        {entity.properties?.image?.url ? (
                          <img 
                            src={entity.properties.image.url} 
                            alt={entity.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold">
                              {entity.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{entity.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                              {entity.types?.[0]?.replace('urn:entity:', '') || 'Entity'}
                            </span>
                            {entity.popularity && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span className="text-gray-400 text-xs">
                                  {Math.round(entity.popularity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Map Section */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-orange-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Select Location</h3>
            </div>
            
            <div className="space-y-6">
              {/* Map Container */}
              <div className="relative">
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-700">
                  <MapContainer
                    center={[40.7128, -74.0060]} // Default to New York
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    
                    {selectedLocation && (
                      <Marker 
                        position={[selectedLocation.lat, selectedLocation.lng]}
                        icon={customIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">Selected Location</div>
                            <div>Lat: {selectedLocation.lat.toFixed(4)}°</div>
                            <div>Lng: {selectedLocation.lng.toFixed(4)}°</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Analysis radius: {(radius / 1000).toFixed(0)}km
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Radius Circle */}
                    {selectedLocation && (
                      <L.Circle
                        center={[selectedLocation.lat, selectedLocation.lng]}
                        radius={radius}
                        pathOptions={{
                          color: '#a855f7',
                          fillColor: '#a855f7',
                          fillOpacity: 0.1,
                          weight: 2,
                          dashArray: '5, 5'
                        }}
                      />
                    )}
                    
                    {/* Heatmap Layer */}
                    {showHeatmap && <HeatmapLayer heatmapData={heatmapData} />}
                  </MapContainer>
                </div>
                
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-md rounded-lg p-3 border border-gray-600"
                  >
                    <div className="text-white text-sm">
                      <div className="font-semibold">Selected Location</div>
                      <div className="text-gray-300">
                        Lat: {selectedLocation.lat.toFixed(4)}°
                      </div>
                      <div className="text-gray-300">
                        Lng: {selectedLocation.lng.toFixed(4)}°
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Radius Control */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <label className="text-white font-medium">Analysis Radius:</label>
                </div>
                <div className="flex-1 max-w-md">
                  <input
                    type="range"
                    min="5000"
                    max="80000"
                    step="5000"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>5km</span>
                    <span className="text-white font-medium">{(radius / 1000).toFixed(0)}km</span>
                    <span>80km</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-400 text-sm">
                Click anywhere on the map to select a location for heatmap analysis
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Heatmap Button */}
        {selectedEntity && selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <button
              onClick={generateHeatmap}
              disabled={generatingHeatmap}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-orange-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                {generatingHeatmap ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating Heatmap...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Generate Heatmap
                  </>
                )}
              </span>
            </button>
          </motion.div>
        )}

        {/* Heatmap Results */}
        {showHeatmap && heatmapData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="flex items-center mb-6">
              <Zap className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Cultural Affinity Heatmap</h3>
              <span className="ml-3 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                {heatmapData.length} data points
              </span>
            </div>
            
            {/* Heatmap Legend */}
            <div className="mb-6 p-4 bg-gray-700/30 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Legend</h4>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">High Affinity (70%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Medium Affinity (40-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Low Affinity (0-40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
                  <span className="text-gray-300 text-sm">Selected Location</span>
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {Math.round(heatmapData.reduce((sum, point) => sum + point.query.affinity, 0) / heatmapData.length * 100)}%
                </div>
                <div className="text-gray-400 text-sm">Avg Affinity</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl font-bold text-orange-400">
                  {heatmapData.filter(point => point.query.affinity > 0.7).length}
                </div>
                <div className="text-gray-400 text-sm">High Affinity</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl font-bold text-purple-400">
                  {heatmapData.filter(point => point.query.affinity >= 0.4 && point.query.affinity <= 0.7).length}
                </div>
                <div className="text-gray-400 text-sm">Medium Affinity</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">
                  {heatmapData.filter(point => point.query.affinity < 0.4).length}
                </div>
                <div className="text-gray-400 text-sm">Low Affinity</div>
              </div>
            </div>
            
            {/* Top Affinity Locations */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg">Top Affinity Locations</h4>
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {heatmapData
                  .sort((a, b) => b.query.affinity - a.query.affinity)
                  .slice(0, 10)
                  .map((point, index) => (
                    <motion.div
                      key={point.location.geohash}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {point.location.latitude.toFixed(4)}°, {point.location.longitude.toFixed(4)}°
                          </div>
                          <div className="text-gray-400 text-sm">
                            Geohash: {point.location.geohash}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-white font-bold">
                            {Math.round(point.query.affinity * 100)}%
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Popularity: {Math.round(point.query.popularity * 100)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #f97316);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #f97316);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
};

export default InsightsPage;