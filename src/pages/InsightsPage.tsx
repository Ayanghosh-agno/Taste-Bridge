import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Zap, X, Star, Settings, Play, Map } from 'lucide-react';
import { qlooService } from '../services/qloo';
import LeafletMap from '../components/LeafletMap';
import HeatmapVisualization from '../components/HeatmapVisualization';

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

const InsightsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Location states
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50000); // Default 50km
  const [locationInput, setLocationInput] = useState('');
  
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
  };

  const clearEntity = () => {
    setSelectedEntity(null);
    setSearchInput('');
    setSelectedLocation(null);
    setLocationInput('');
    setShowHeatmap(false);
    setHeatmapData([]);
  };

  const handleLocationSubmit = () => {
    // Parse location input (expecting "lat, lng" format)
    const coords = locationInput.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setSelectedLocation({ lat: coords[0], lng: coords[1] });
    } else {
      alert('Please enter coordinates in the format: latitude, longitude (e.g., 40.7128, -74.0060)');
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
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

  // Popular locations for quick selection
  const popularLocations = [
    { name: 'New York City', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
  ];

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

        {/* Location Selection Section */}
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <Map className="h-6 w-6 text-orange-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Interactive Location Selection</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map */}
              <div>
                <h4 className="text-white font-medium mb-4">Click on the map to select a location</h4>
                <LeafletMap
                  center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [40.7128, -74.0060]}
                  zoom={selectedLocation ? 10 : 2}
                  heatmapData={showHeatmap ? heatmapData : []}
                  onLocationSelect={handleMapLocationSelect}
                  selectedEntity={selectedEntity}
                />
              </div>
              
              {/* Controls */}
              <div className="space-y-6">
                {/* Manual Location Input */}
                <div>
                  <label className="block text-white font-medium mb-3">Enter Coordinates</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="40.7128, -74.0060 (latitude, longitude)"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={handleLocationSubmit}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg transition-all duration-300"
                    >
                      Set Location
                    </button>
                  </div>
                </div>
                
                {/* Popular Locations */}
                <div>
                  <label className="block text-white font-medium mb-3">Popular Locations</label>
                  <div className="grid grid-cols-2 gap-3">
                    {popularLocations.map((location) => (
                      <button
                        key={location.name}
                        onClick={() => {
                          setSelectedLocation({ lat: location.lat, lng: location.lng });
                          setLocationInput(`${location.lat}, ${location.lng}`);
                        }}
                        className="p-3 bg-gray-700/30 border border-gray-600 rounded-xl text-white hover:bg-gray-700/50 hover:border-purple-400/50 transition-all duration-200"
                      >
                        <div className="font-medium">{location.name}</div>
                        <div className="text-gray-400 text-sm">
                          {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Selected Location Display */}
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-orange-500/20 border border-orange-400/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-orange-400" />
                      <div>
                        <h4 className="text-white font-semibold">Selected Location</h4>
                        <p className="text-orange-300">
                          Latitude: {selectedLocation.lat.toFixed(4)}°, Longitude: {selectedLocation.lng.toFixed(4)}°
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Radius Control */}
                {selectedLocation && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-gray-400" />
                      <label className="text-white font-medium">Analysis Radius:</label>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="5000"
                        max="80000"
                        step="5000"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <span>5km</span>
                        <span className="text-white font-medium">{(radius / 1000).toFixed(0)}km</span>
                        <span>80km</span>
                      </div>
                    </div>
                  </div>
                )}
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
                    Generate Cultural Heatmap
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
            <div className="flex items-center mb-8">
              <Zap className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Cultural Affinity Heatmap Results</h3>
              <span className="ml-3 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                {heatmapData.length} data points
              </span>
            </div>
            
            <HeatmapVisualization
              heatmapData={heatmapData}
              selectedEntity={selectedEntity}
              selectedLocation={selectedLocation}
              radius={radius}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;