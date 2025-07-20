import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, Zap, Search, Target, Filter, BarChart3, Globe, Star, ExternalLink } from 'lucide-react';
import { qlooService } from '../services/qloo';
import LeafletMap from '../components/LeafletMap';
import HeatmapVisualization from '../components/HeatmapVisualization';

const InsightsPage: React.FC = () => {
  // Location and map state
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [radius, setRadius] = useState(50000); // 50km in meters
  
  // Heatmap state
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [heatmapGenerated, setHeatmapGenerated] = useState(false);
  
  // Entity demographics state
  const [entityDemographics, setEntityDemographics] = useState<any[]>([]);
  const [loadingEntityDemographics, setLoadingEntityDemographics] = useState(false);
  
  // Geo insights state
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [subtypes, setSubtypes] = useState<any[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  const [geoResults, setGeoResults] = useState<any[]>([]);
  const [loadingGeoInsights, setLoadingGeoInsights] = useState(false);
  const [geoInsightsGenerated, setGeoInsightsGenerated] = useState(false);

  // Content types for geo insights
  const contentTypes = [
    { value: 'urn:entity:movie', label: 'Movies', icon: '🎬', color: 'from-red-500 to-orange-500' },
    { value: 'urn:entity:artist', label: 'Artists', icon: '🎤', color: 'from-pink-500 to-rose-500' },
    { value: 'urn:entity:book', label: 'Books', icon: '📚', color: 'from-emerald-500 to-teal-500' },
    { value: 'urn:entity:place', label: 'Places', icon: '📍', color: 'from-green-500 to-emerald-500' },
    { value: 'urn:entity:tv_show', label: 'TV Shows', icon: '📺', color: 'from-cyan-500 to-blue-500' },
    { value: 'urn:entity:brand', label: 'Brands', icon: '🏷️', color: 'from-blue-500 to-cyan-500' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male', icon: '👨', color: 'from-blue-500 to-indigo-500' },
    { value: 'female', label: 'Female', icon: '👩', color: 'from-purple-500 to-pink-500' }
  ];

  const ageGroups = [
    { value: '35_and_younger', label: '35 & Younger', icon: '🧑', color: 'from-green-500 to-teal-500' },
    { value: '36_to_55', label: '36-55', icon: '👨‍💼', color: 'from-purple-500 to-indigo-500' },
    { value: '55_and_older', label: '55+', icon: '👴', color: 'from-gray-500 to-slate-500' }
  ];

  // Search for locations
  const handleEntitySearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await qlooService.searchEntities(query, 8);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleEntitySelect = (entity: any) => {
    // Extract coordinates from the location entity
    let lat, lng;
    
    if (entity.properties?.geocode) {
      lat = entity.properties.geocode.latitude || entity.properties.geocode.lat;
      lng = entity.properties.geocode.longitude || entity.properties.geocode.lng || entity.properties.geocode.lon;
    }
    
    // Fallback coordinates for major cities if geocode is not available
    if (!lat || !lng && entity.type === 'urn:entity:place') {
      const cityCoords: Record<string, [number, number]> = {
        'new york': [40.7128, -74.0060],
        'london': [51.5074, -0.1278],
        'paris': [48.8566, 2.3522],
        'tokyo': [35.6762, 139.6503],
        'sydney': [-33.8688, 151.2093],
        'los angeles': [34.0522, -118.2437],
        'chicago': [41.8781, -87.6298],
        'toronto': [43.6532, -79.3832],
        'berlin': [52.5200, 13.4050],
        'mumbai': [19.0760, 72.8777]
      };
      
      const cityName = entity.name.toLowerCase();
      const coords = cityCoords[cityName];
      if (coords) {
        [lat, lng] = coords;
      }
    }
    
    // Set selected entity regardless of coordinates
    setSelectedEntity(entity);
    setSearchQuery(entity.name);
    setSearchResults([]);
    
    // Set location if coordinates are available
    if (lat && lng && entity.type === 'urn:entity:place') {
      setSelectedLocation({ lat, lng });
    } else if (entity.type !== 'urn:entity:place') {
      // For non-place entities, you might want to prompt user to select a location
      // or use a default location
    } else {
      console.error('Could not extract coordinates from location:', entity);
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  // Generate cultural heatmap
  const generateHeatmap = async () => {
    if (!selectedEntity || !selectedLocation) return;

    setLoadingHeatmap(true);
    try {
      const heatmapResults = await qlooService.getHeatmapInsights(
        selectedEntity.entity_id,
        selectedLocation.lng,
        selectedLocation.lat,
        radius
      );
      
      setHeatmapData(heatmapResults);
      setHeatmapGenerated(true);
      
      // Also generate entity demographics
      await generateEntityDemographics();
    } catch (error) {
      console.error('Error generating heatmap:', error);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  // Generate entity demographics
  const generateEntityDemographics = async () => {
    if (!selectedEntity || !selectedLocation) return;

    setLoadingEntityDemographics(true);
    try {
      const params = new URLSearchParams({
        'filter.type': 'urn:demographics',
        'signal.interests.entities': selectedEntity.entity_id
      });
      
      console.log('Calling demographics insights API with params:', params.toString());
      
      const response = await qlooService.makeRequest(`/v2/insights?${params.toString()}`);
      
      console.log('Demographics API response:', response);
      
      // Process the demographics response
      const demographicsData = response.results?.demographics || [];
      
      setEntityDemographics(demographicsData);
    } catch (error) {
      console.error('Error generating entity demographics:', error);
      setEntityDemographics([]);
    } finally {
      setLoadingEntityDemographics(false);
    }
  };

  // Fetch subtypes for selected content type
  const fetchSubtypes = async (contentType: string) => {
    setLoadingSubtypes(true);
    try {
      const response = await qlooService.makeRequest(`/geospatial/describe?type=${contentType}`);
      setSubtypes(response.results || []);
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      setSubtypes([]);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  // Handle content type selection
  const handleContentTypeSelect = (contentType: string) => {
    setSelectedContentType(contentType);
    setSelectedSubtypes([]);
    setSubtypes([]);
    if (contentType) {
      fetchSubtypes(contentType);
    }
  };

  // Handle subtype selection
  const handleSubtypeToggle = (subtypeId: string) => {
    setSelectedSubtypes(prev => 
      prev.includes(subtypeId) 
        ? prev.filter(id => id !== subtypeId)
        : [...prev, subtypeId]
    );
  };

  // Generate geo insights
  const generateGeoInsights = async () => {
    if (!selectedLocation || !selectedContentType) return;

    setLoadingGeoInsights(true);
    try {
      // Convert radius from meters to miles
      const radiusInMiles = Math.round(radius / 1609.34);
      
      // Build API parameters
      const params = new URLSearchParams({
        type: selectedContentType,
        target: `POINT(${selectedLocation.lng} ${selectedLocation.lat})`,
        'target.radius': radiusInMiles.toString()
      });

      // Add demographic biases if selected
      if (selectedAgeGroup) {
        params.append('bias.age', selectedAgeGroup);
      }
      if (selectedGender) {
        params.append('bias.gender', selectedGender);
      }

      // Add selected subtypes
      if (selectedSubtypes.length > 0) {
        params.append('filter.tags', selectedSubtypes.join(','));
      }

      console.log('Calling geospatial API with params:', params.toString());
      
      const response = await qlooService.makeRequest(`/geospatial?${params.toString()}`);
      
      console.log('Geospatial API response:', response);
      setGeoResults(response.results || []);
      setGeoInsightsGenerated(true);
    } catch (error) {
      console.error('Error generating geo insights:', error);
      setGeoResults([]);
    } finally {
      setLoadingGeoInsights(false);
    }
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
          <h1 className="text-4xl font-bold text-white mb-4">Cultural Insights Explorer</h1>
          <p className="text-gray-400 text-lg">Discover cultural patterns and demographic insights across locations</p>
        </motion.div>

        {/* Interactive Location Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-purple-400 mr-3" />
            <h3 className="text-2xl font-semibold text-white">Interactive Location Selection</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Location Search */}
            <div>
              <h4 className="text-white font-semibold mb-4">Search for a Location</h4>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleEntitySearch(e.target.value);
                  }}
                  placeholder="Search for artists, movies, books, places..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-gray-700 border border-gray-600 rounded-xl max-h-60 overflow-y-auto mb-4">
                  {searchResults.map((location, index) => (
                    <button
                      key={location.entity_id || index}
                      onClick={() => handleEntitySelect(location)}
                      className="w-full p-4 text-left hover:bg-gray-600 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        {location.properties?.image?.url ? (
                          <img 
                            src={location.properties.image.url} 
                            alt={location.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600">
                            <span className="text-white font-bold text-lg">
                              {location.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-white font-semibold text-lg">{location.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-400/30">
                              {location.types?.[0]?.replace('urn:entity:', '') || location.type?.replace('urn:entity:', '') || 'Entity'}
                            </span>
                            {location.popularity && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-gray-400 text-sm">
                                  {Math.round(location.popularity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                          {location.disambiguation && (
                            <p className="text-gray-400 text-sm mt-1">
                              {location.disambiguation}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Entity Selection */}
              <div className="mb-4">
                {selectedEntity && (
                  <div className="p-4 bg-purple-500/20 border border-purple-400/30 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      {selectedEntity.properties?.image?.url && (
                        <img 
                          src={selectedEntity.properties.image.url} 
                          alt={selectedEntity.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="text-white font-semibold">{selectedEntity.name}</h4>
                        <p className="text-purple-300 text-sm">{selectedEntity.type?.replace('urn:entity:', '') || 'Entity'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Radius Control */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Analysis Radius: {(radius / 1000).toFixed(0)}km</label>
                <input
                  type="range"
                  min="10000"
                  max="80000"
                  step="10000"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>10km</span>
                  <span>80km</span>
                </div>
              </div>

              {/* Generate Heatmap Button */}
              <button
                onClick={generateHeatmap}
                disabled={!selectedEntity || !selectedLocation || loadingHeatmap}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingHeatmap ? 'Generating Cultural Heatmap...' : 'Generate Cultural Heatmap'}
              </button>
            </div>

            {/* Interactive Map */}
            <div>
              <h4 className="text-white font-semibold mb-4">Interactive Map</h4>
              <LeafletMap
                center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [40.7128, -74.0060]}
                zoom={selectedLocation ? 10 : 4}
                heatmapData={heatmapData}
                onLocationSelect={handleMapLocationSelect}
                selectedEntity={selectedEntity}
              />
              <p className="text-gray-400 text-sm mt-3">
                Click on the map to select a location for cultural analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Entity Demographics */}
        {heatmapGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Entity Demographics</h3>
            </div>

            {loadingEntityDemographics ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300">Analyzing entity demographics...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {entityDemographics.map((demo, index) => (
                  <motion.div
                    key={demo.entity_id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-700/30 rounded-xl border border-gray-600 p-6"
                  >
                    <h4 className="text-white font-semibold mb-6 text-xl">Demographics Analysis</h4>
                    
                    {/* Age Demographics */}
                    {demo.query?.age && (
                      <div className="mb-8">
                        <h5 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                          <span className="text-xl">👥</span>
                          Age Demographics
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(demo.query.age).map(([ageGroup, value]) => {
                            const percentage = (value as number) * 100;
                            const isPositive = percentage > 0;
                            const absPercentage = Math.abs(percentage);
                            
                            return (
                              <div key={ageGroup} className="flex items-center gap-4">
                                <div className="w-24 text-gray-300 text-sm font-medium">
                                  {ageGroup.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                        isPositive 
                                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                                      }`}
                                      style={{ width: `${Math.min(absPercentage, 100)}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 min-w-[80px]">
                                    <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                      {isPositive ? '+' : ''}{percentage.toFixed(1)}%
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isPositive 
                                        ? 'bg-green-500/20 text-green-300' 
                                        : 'bg-red-500/20 text-red-300'
                                    }`}>
                                      {isPositive ? 'Above Avg' : 'Below Avg'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Gender Demographics */}
                    {demo.query?.gender && (
                      <div>
                        <h5 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                          <span className="text-xl">⚧️</span>
                          Gender Demographics
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(demo.query.gender).map(([gender, value]) => {
                            const percentage = (value as number) * 100;
                            const isPositive = percentage > 0;
                            const absPercentage = Math.abs(percentage);
                            
                            return (
                              <div 
                                key={gender} 
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                  isPositive 
                                    ? 'border-green-400/30 bg-green-500/10' 
                                    : 'border-red-400/30 bg-red-500/10'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-3xl mb-2">
                                    {gender === 'male' ? '👨' : '👩'}
                                  </div>
                                  <div className="text-white font-semibold mb-2 capitalize">
                                    {gender}
                                  </div>
                                  <div className={`text-2xl font-bold mb-2 ${
                                    isPositive ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {isPositive ? '+' : ''}{percentage.toFixed(1)}%
                                  </div>
                                  <div className="w-full bg-gray-600 rounded-full h-2 mb-3 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                        isPositive 
                                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                          : 'bg-gradient-to-r from-red-500 to-pink-500'
                                      }`}
                                      style={{ width: `${Math.min(absPercentage, 100)}%` }}
                                    />
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isPositive 
                                      ? 'bg-green-500/20 text-green-300' 
                                      : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    {isPositive ? 'Above Average' : 'Below Average'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {entityDemographics.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg">No demographics data available.</p>
                    <p className="text-gray-500 text-sm mt-2">Try selecting a different entity.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Cultural Affinity Heatmap Results */}
        {heatmapGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <HeatmapVisualization
              heatmapData={heatmapData}
              selectedEntity={selectedEntity}
              selectedLocation={selectedLocation}
              radius={radius}
            />
          </motion.div>
        )}

        {/* Geo Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-8">
            <Globe className="h-6 w-6 text-blue-400 mr-3" />
            <h3 className="text-2xl font-semibold text-white">Geo Insights</h3>
          </div>

          <div className="space-y-8">
            {/* Content Type Selection */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Content Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {contentTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => handleContentTypeSelect(type.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedContentType === type.value
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{type.icon}</div>
                      <div className={`font-semibold text-sm ${
                        selectedContentType === type.value ? 'text-blue-300' : 'text-gray-300'
                      }`}>
                        {type.label}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Subtype Selection */}
            {selectedContentType && (
              <div>
                <h4 className="text-white font-semibold mb-6 text-lg flex items-center gap-3">
                  Subtypes
                  {loadingSubtypes && (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {selectedSubtypes.length > 0 && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                      {selectedSubtypes.length} selected
                    </span>
                  )}
                </h4>
                
                {loadingSubtypes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading subtypes...</p>
                  </div>
                ) : subtypes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {subtypes.map((subtype) => (
                      <motion.button
                        key={subtype.id}
                        onClick={() => handleSubtypeToggle(subtype.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                          selectedSubtypes.includes(subtype.id)
                            ? 'border-green-400 bg-green-500/20 text-green-300'
                            : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedSubtypes.includes(subtype.id)
                              ? 'border-green-400 bg-green-500'
                              : 'border-gray-500'
                          }`}>
                            {selectedSubtypes.includes(subtype.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-sm">{subtype.name}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No subtypes available for this content type.</p>
                )}
              </div>
            )}

            {/* Gender Selection */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Gender</h4>
              <div className="grid grid-cols-2 gap-4">
                {genderOptions.map((gender) => (
                  <motion.button
                    key={gender.value}
                    onClick={() => setSelectedGender(selectedGender === gender.value ? '' : gender.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedGender === gender.value
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{gender.icon}</div>
                      <div className={`font-semibold ${
                        selectedGender === gender.value ? 'text-purple-300' : 'text-gray-300'
                      }`}>
                        {gender.label}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Age Group Selection */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Age Group</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ageGroups.map((age) => (
                  <motion.button
                    key={age.value}
                    onClick={() => setSelectedAgeGroup(selectedAgeGroup === age.value ? '' : age.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedAgeGroup === age.value
                        ? 'border-orange-400 bg-orange-500/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{age.icon}</div>
                      <div className={`font-semibold ${
                        selectedAgeGroup === age.value ? 'text-orange-300' : 'text-gray-300'
                      }`}>
                        {age.label}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Current Parameters Display */}
            {(selectedContentType || selectedGender || selectedAgeGroup || selectedSubtypes.length > 0) && (
              <div className="p-6 bg-gray-700/30 rounded-xl border border-gray-600">
                <h4 className="text-white font-semibold mb-4">Current Analysis Parameters</h4>
                <div className="space-y-3">
                  {selectedContentType && (
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-medium">Content Type:</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {contentTypes.find(t => t.value === selectedContentType)?.label}
                      </span>
                    </div>
                  )}
                  {selectedGender && (
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400 font-medium">Gender:</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {genderOptions.find(g => g.value === selectedGender)?.label}
                      </span>
                    </div>
                  )}
                  {selectedAgeGroup && (
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-medium">Age Group:</span>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                        {ageGroups.find(a => a.value === selectedAgeGroup)?.label}
                      </span>
                    </div>
                  )}
                  {selectedSubtypes.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="text-green-400 font-medium">Subtypes:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubtypes.map(subtypeId => {
                          const subtype = subtypes.find(s => s.id === subtypeId);
                          return (
                            <span key={subtypeId} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                              {subtype?.name || subtypeId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Insights Button */}
            <div className="text-center">
              <button
                onClick={generateGeoInsights}
                disabled={!selectedLocation || !selectedContentType || loadingGeoInsights}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingGeoInsights ? 'Generating Geo Insights...' : 'Generate Geo Insights'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Geo Analysis Results */}
        {geoInsightsGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="flex items-center mb-8">
              <BarChart3 className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">Geo Analysis Results</h3>
              <span className="ml-4 px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                {geoResults.length} results
              </span>
            </div>

            {loadingGeoInsights ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className="text-gray-300 text-lg">Analyzing geo insights...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
              </div>
            ) : geoResults.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {geoResults.map((result, index) => (
                  <motion.div
                    key={result.entity_id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-6 bg-gray-700/30 rounded-xl border border-gray-600 hover:border-green-400/50 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {result.properties?.image?.url ? (
                        <img 
                          src={result.properties.image.url} 
                          alt={result.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600 group-hover:border-green-400/50 transition-colors duration-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center border-2 border-gray-600 group-hover:border-green-400/50 transition-colors duration-200">
                          <span className="text-white font-bold text-xl">
                            {result.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1">{result.name}</h4>
                        {result.disambiguation && (
                          <p className="text-gray-400 text-sm mb-2">{result.disambiguation}</p>
                        )}
                        {result.properties?.short_description && (
                          <p className="text-gray-300 text-sm line-clamp-2">{result.properties.short_description}</p>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 mb-4">
                      {result.query?.affinity !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-sm">Affinity</span>
                            <span className="text-green-400 font-bold">
                              {Math.round(result.query.affinity * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-1000"
                              style={{ width: `${result.query.affinity * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {result.query?.rank_percent !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-sm">Rank Percentile</span>
                            <span className="text-blue-400 font-bold">
                              {Math.round(result.query.rank_percent * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                              style={{ width: `${result.query.rank_percent * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {result.popularity !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-sm">Popularity</span>
                            <span className="text-yellow-400 font-bold">
                              {Math.round(result.popularity * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                              style={{ width: `${result.popularity * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {result.tags && result.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {result.tags.slice(0, 3).map((tag: any, tagIndex: number) => (
                            <span 
                              key={tag.tag_id || tagIndex}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                              +{result.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* External Links */}
                    {result.properties?.external && (
                      <div className="flex gap-2">
                        {result.properties.external.imdb && (
                          <a
                            href={`https://www.imdb.com/title/${result.properties.external.imdb.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full hover:bg-yellow-500/30 transition-colors duration-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            IMDB
                          </a>
                        )}
                        {result.properties.external.rottentomatoes && (
                          <a
                            href={`https://www.rottentomatoes.com/m/${result.properties.external.rottentomatoes.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full hover:bg-red-500/30 transition-colors duration-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            RT
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">No geo insights found for the selected parameters.</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or location.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;