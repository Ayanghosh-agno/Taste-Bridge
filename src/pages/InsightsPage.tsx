import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Zap, X, Star, Settings, Play, Map, Users, Filter, BarChart3, Info } from 'lucide-react';
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

  // Demographic insights states
  const [demographicType, setDemographicType] = useState('urn:entity:artist');
  const [demographicGender, setDemographicGender] = useState('');
  const [demographicAge, setDemographicAge] = useState('');
  const [demographicData, setDemographicData] = useState<any[]>([]);
  const [generatingDemographics, setGeneratingDemographics] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);

  // Entity demographics states
  const [entityDemographics, setEntityDemographics] = useState<any>(null);
  const [loadingEntityDemographics, setLoadingEntityDemographics] = useState(false);

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
    
    // Automatically fetch entity demographics when entity is selected
    fetchEntityDemographics(entity.entity_id);
  };

  const clearEntity = () => {
    setSelectedEntity(null);
    setSearchInput('');
    setShowHeatmap(false);
    setHeatmapData([]);
    setShowDemographics(false);
    setDemographicData([]);
    setEntityDemographics(null);
  };

  const fetchEntityDemographics = async (entityId: string) => {
    setLoadingEntityDemographics(true);
    
    try {
      const params = new URLSearchParams({
        'signal.interests.entities': entityId,
        'filter.type': 'urn:demographics'
      });
      
      console.log('Fetching entity demographics with params:', params.toString());
      
      const response = await qlooService.makeRequest(`/v2/insights?${params.toString()}`);
      
      console.log('Entity demographics API response:', response);
      setEntityDemographics(response.results?.demographics?.[0] || null);
    } catch (error) {
      console.error('Error fetching entity demographics:', error);
      // Generate mock demographic data for demonstration
      const mockDemographics = {
        entity_id: entityId,
        query: {
          age: {
            "24_and_younger": Math.random() * 1.2 - 0.6,
            "25_to_29": Math.random() * 1.2 - 0.6,
            "30_to_34": Math.random() * 1.2 - 0.6,
            "35_to_44": Math.random() * 1.2 - 0.6,
            "45_to_54": Math.random() * 1.2 - 0.6,
            "55_and_older": Math.random() * 1.2 - 0.6
          },
          gender: {
            "male": Math.random() * 1.2 - 0.6,
            "female": Math.random() * 1.2 - 0.6
          }
        }
      };
      setEntityDemographics(mockDemographics);
    } finally {
      setLoadingEntityDemographics(false);
    }
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

  const generateDemographicInsights = async () => {
    if (!selectedLocation) return;
    
    setGeneratingDemographics(true);
    
    try {
      // Build parameters for demographic insights with location filter
      const params = new URLSearchParams({
        'filter.type': demographicType,
        'filter.location': `POINT(${selectedLocation.lng} ${selectedLocation.lat})`,
        'filter.location.radius': radius.toString(),
        'take': '20'
      });
      
      // Add entity signal if selected
      if (selectedEntity) {
        params.append('signal.interests.entities', selectedEntity.entity_id);
      }
      
      // Add demographic filters if selected
      if (demographicGender) {
        params.append('signal.demographics.gender', demographicGender);
      }
      if (demographicAge) {
        params.append('signal.demographics.age', demographicAge);
      }
      
      console.log('Generating demographic insights with params:', params.toString());
      
      // Call Qloo insights API
      const response = await qlooService.makeRequest(`/v2/insights?${params.toString()}`);
      
      setDemographicData(response.results?.entities || []);
      setShowDemographics(true);
    } catch (error) {
      console.error('Error generating demographic insights:', error);
      // Generate mock demographic data for demonstration
      const mockData = generateMockDemographicData();
      setDemographicData(mockData);
      setShowDemographics(true);
    } finally {
      setGeneratingDemographics(false);
    }
  };

  const generateMockDemographicData = () => {
    const entityTypes = {
      'urn:entity:artist': ['Taylor Swift', 'Drake', 'Billie Eilish', 'The Weeknd', 'Ariana Grande'],
      'urn:entity:movie': ['Avengers: Endgame', 'Spider-Man: No Way Home', 'Top Gun: Maverick', 'Black Panther', 'Dune'],
      'urn:entity:book': ['Where the Crawdads Sing', 'The Seven Husbands of Evelyn Hugo', 'It Ends with Us', 'The Silent Patient', 'Educated'],
      'urn:entity:brand': ['Nike', 'Apple', 'Netflix', 'Spotify', 'Tesla'],
      'urn:entity:place': ['Central Park', 'Times Square', 'Brooklyn Bridge', 'High Line', 'One World Trade Center']
    };
    
    const names = entityTypes[demographicType as keyof typeof entityTypes] || entityTypes['urn:entity:artist'];
    
    return names.map((name, index) => ({
      name,
      entity_id: `mock_${index}`,
      type: demographicType,
      properties: {
        image: {
          url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
        }
      },
      query: {
        affinity: Math.random() * 0.8 + 0.2,
        measurements: {
          audience_growth: Math.random() * 100,
          engagement_rate: Math.random() * 50 + 25
        }
      },
      popularity: Math.random() * 0.8 + 0.2
    }));
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

        {/* Interactive Map Section - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
          
          {/* Entity Demographics Section */}
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-green-400 mr-3" />
                <h3 className="text-2xl font-semibold text-white">Entity Demographics</h3>
                <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                  {selectedEntity.name}
                </span>
              </div>
              
              {loadingEntityDemographics ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading demographic insights...</p>
                </div>
              ) : entityDemographics ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Age Demographics */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">📊</span>
                      </div>
                      Age Distribution
                    </h4>
                    
                    {Object.entries(entityDemographics.query.age).map(([ageGroup, value]: [string, any], index) => {
                      const percentage = Math.abs(value * 100);
                      const isPositive = value >= 0;
                      
                      return (
                        <motion.div
                          key={ageGroup}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium">
                              {ageGroup.replace('_', ' ').replace('and', '&')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : '-'}{percentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-gray-400">
                                {isPositive ? 'Above avg' : 'Below avg'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className={`h-full rounded-full ${
                                  isPositive 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}
                              />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Gender Demographics */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">👥</span>
                      </div>
                      Gender Distribution
                    </h4>
                    
                    {Object.entries(entityDemographics.query.gender).map(([gender, value]: [string, any], index) => {
                      const percentage = Math.abs(value * 100);
                      const isPositive = value >= 0;
                      
                      return (
                        <motion.div
                          key={gender}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium capitalize">
                              {gender}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : '-'}{percentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-gray-400">
                                {isPositive ? 'Above avg' : 'Below avg'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                                className={`h-full rounded-full ${
                                  gender === 'male'
                                    ? isPositive 
                                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                      : 'bg-gradient-to-r from-red-500 to-pink-500'
                                    : isPositive
                                      ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                                }`}
                              />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No demographic data available for this entity.</p>
                </div>
              )}
              
              {/* Summary */}
              {entityDemographics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-xl"
                >
                  <h4 className="text-white font-semibold mb-3">📈 Demographic Summary</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Strongest Age Group:</span>
                      <span className="text-green-400 font-bold ml-2">
                        {Object.entries(entityDemographics.query.age)
                          .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)[0][0]
                          .replace('_', ' ').replace('and', '&')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Gender Preference:</span>
                      <span className="text-blue-400 font-bold ml-2 capitalize">
                        {Object.entries(entityDemographics.query.gender)
                          .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)[0][0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Entity Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
          
          {/* Info Message */}
          {!selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-400" />
                <p className="text-blue-300 text-sm">
                  Select an entity above to unlock cultural heatmap generation and advanced demographic insights for your chosen location.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Demographic Insights Section - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-8">
            <Users className="h-6 w-6 text-blue-400 mr-3" />
            <h3 className="text-2xl font-semibold text-white">Demographic Insights</h3>
            <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
              Advanced Filtering
            </span>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Entity Type Filter */}
            <div>
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-400" />
                Content Type
              </label>
              <select
                value={demographicType}
                onChange={(e) => setDemographicType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="urn:entity:artist">urn:entity:artist</option>
                <option value="urn:entity:book">urn:entity:book</option>
                <option value="urn:entity:brand">urn:entity:brand</option>
                <option value="urn:entity:destination">urn:entity:destination</option>
                <option value="urn:entity:movie">urn:entity:movie</option>
                <option value="urn:entity:person">urn:entity:person</option>
                <option value="urn:entity:place">urn:entity:place</option>
                <option value="urn:entity:podcast">urn:entity:podcast</option>
                <option value="urn:entity:tv_show">urn:entity:tv_show</option>
                <option value="urn:entity:videogame">urn:entity:videogame</option>
              </select>
            </div>
            
            {/* Gender Filter */}
            <div>
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-400" />
                Gender
              </label>
              <select
                value={demographicGender}
                onChange={(e) => setDemographicGender(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">All Genders</option>
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </div>
            
            {/* Age Filter */}
            <div>
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                Age Group
              </label>
              <select
                value={demographicAge}
                onChange={(e) => setDemographicAge(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All Ages</option>
                <option value="35_and_younger">35_and_younger</option>
                <option value="36_to_55">36_to_55</option>
                <option value="55_and_older">55_and_older</option>
              </select>
            </div>
          </div>
          
          {/* Current Filters Display */}
          {selectedLocation && (
            <div className="mb-6 p-4 bg-gray-700/30 rounded-xl">
              <h4 className="text-white font-medium mb-3">Current Analysis Parameters:</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">
                    Location: {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">
                    Radius: {(radius / 1000).toFixed(0)}km
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">
                    Type: {demographicType.replace('urn:entity:', '')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-300">
                    Demographics: {demographicGender || 'All'}, {demographicAge ? demographicAge.replace('_', ' ') : 'All Ages'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateDemographicInsights}
              disabled={!selectedLocation || generatingDemographics}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                {generatingDemographics ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyzing Demographics...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    Generate Demographic Insights
                  </>
                )}
              </span>
            </button>
            
            {!selectedLocation && (
              <p className="text-gray-400 text-sm mt-3">
                Please select a location on the map above to generate demographic insights
              </p>
            )}
          </div>
        </motion.div>

        {/* Generate Heatmap Button - Only shows when entity is selected */}
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
                    Generate Cultural Heatmap for {selectedEntity.name}
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
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
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

        {/* Demographic Results */}
        {showDemographics && demographicData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="flex items-center mb-8">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Demographic Analysis Results</h3>
              <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                {demographicData.length} insights
              </span>
            </div>
            
            {/* Results Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demographicData.map((item, index) => (
                <motion.div
                  key={item.entity_id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-105"
                >
                  {/* Entity Image/Icon */}
                  <div className="flex items-center gap-4 mb-4">
                    {item.properties?.image?.url ? (
                      <img 
                        src={item.properties.image.url} 
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-blue-400/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-blue-400/30">
                        <span className="text-white font-bold text-xl">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">{item.name}</h4>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        {item.type?.replace('urn:entity:', '') || 'Entity'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Cultural Affinity</span>
                      <span className="text-white font-bold">
                        {Math.round((item.query?.affinity || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.query?.affinity || 0) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Popularity</span>
                      <span className="text-blue-300">
                        {Math.round((item.popularity || 0) * 100)}%
                      </span>
                    </div>
                    
                    {item.query?.measurements?.audience_growth && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Audience Growth</span>
                        <span className="text-green-400">
                          +{Math.round(item.query.measurements.audience_growth)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      #{index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 grid md:grid-cols-4 gap-4"
            >
              <div className="text-center p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {demographicData.length}
                </div>
                <div className="text-gray-400 text-sm">Total Insights</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-400/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {Math.round((demographicData.reduce((sum, item) => sum + (item.query?.affinity || 0), 0) / demographicData.length) * 100)}%
                </div>
                <div className="text-gray-400 text-sm">Avg Affinity</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 border border-green-400/20 rounded-xl">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {demographicData.filter(item => (item.query?.affinity || 0) > 0.7).length}
                </div>
                <div className="text-gray-400 text-sm">High Affinity</div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 border border-orange-400/20 rounded-xl">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {(radius / 1000).toFixed(0)}km
                </div>
                <div className="text-gray-400 text-sm">Analysis Radius</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;