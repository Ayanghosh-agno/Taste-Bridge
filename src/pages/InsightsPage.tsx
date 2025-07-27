import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, Zap, Search, Target, Filter, BarChart3, Globe, Star, ExternalLink, Brain, Navigation } from 'lucide-react';
import { qlooService } from '../services/qloo';
import { togetherService, formatMarkdown } from '../services/together';
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
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Heatmap state
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [heatmapGenerated, setHeatmapGenerated] = useState(false);
  
  // Entity demographics state
  const [entityDemographics, setEntityDemographics] = useState<any[]>([]);
  const [loadingEntityDemographics, setLoadingEntityDemographics] = useState(false);
  
  // AI insights state
  const [aiInsightsSummary, setAiInsightsSummary] = useState('');
  const [generatingAiInsights, setGeneratingAiInsights] = useState(false);
  
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
    { value: 'urn:entity:artist', label: 'Artists', icon: '🎤' },
    { value: 'urn:entity:book', label: 'Books', icon: '📚' },
    { value: 'urn:entity:brand', label: 'Brands', icon: '🏷️' },
    { value: 'urn:entity:destination', label: 'Destinations', icon: '🏝️' },
    { value: 'urn:entity:movie', label: 'Movies', icon: '🎬' },
    { value: 'urn:entity:person', label: 'People', icon: '👤' },
    { value: 'urn:entity:place', label: 'Places', icon: '📍' },
    { value: 'urn:entity:podcast', label: 'Podcasts', icon: '🎙️' },
    { value: 'urn:entity:tv_show', label: 'TV Shows', icon: '📺' },
    { value: 'urn:entity:videogame', label: 'Video Games', icon: '🎮' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male', icon: '👨' },
    { value: 'female', label: 'Female', icon: '👩' }
  ];

  const ageGroups = [
    { value: '35_and_younger', label: '35 & Younger', icon: '🧑' },
    { value: '36_to_55', label: '36-55', icon: '👨‍💼' },
    { value: '55_and_older', label: '55+', icon: '👴' }
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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        
        // Trigger the same callback as manual map clicks to show marker
        handleLocationSelect(latitude, longitude);
        
        setGettingLocation(false);
        
        // Clear any previous error
        setLocationError(null);
        console.log(`Current location set: ${latitude}, ${longitude}`);
        
        // Call handleLocationSelect to trigger marker display and state updates
        handleLocationSelect(latitude, longitude);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unable to retrieve your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        setLocationError(errorMessage);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Generate AI insights summary
  const generateAiInsightsSummary = async (heatmapData: any[], entityDemographics: any[], selectedEntity: any, selectedLocation: { lat: number; lng: number }, radius: number) => {
    setGeneratingAiInsights(true);
    try {
      // Calculate statistics for the prompt
      const avgAffinity = heatmapData.length > 0 
        ? heatmapData.reduce((sum, point) => sum + point.query.affinity, 0) / heatmapData.length 
        : 0;
      
      const highAffinityPoints = heatmapData.filter(point => point.query.affinity > 0.7);
      const mediumAffinityPoints = heatmapData.filter(point => point.query.affinity >= 0.4 && point.query.affinity <= 0.7);
      const lowAffinityPoints = heatmapData.filter(point => point.query.affinity < 0.4);
      
      // Extract demographic insights
      let demographicInsights = '';
      if (entityDemographics.length > 0) {
        const demo = entityDemographics[0];
        if (demo.query?.age) {
          const ageInsights = Object.entries(demo.query.age)
            .map(([ageGroup, value]) => `${ageGroup.replace(/_/g, ' ')}: ${((value as number) * 100).toFixed(1)}%`)
            .join(', ');
          demographicInsights += `Age demographics: ${ageInsights}. `;
        }
        if (demo.query?.gender) {
          const genderInsights = Object.entries(demo.query.gender)
            .map(([gender, value]) => `${gender}: ${((value as number) * 100).toFixed(1)}%`)
            .join(', ');
          demographicInsights += `Gender demographics: ${genderInsights}.`;
        }
      }
      
      const prompt = `You are a cultural data analyst specializing in location-based cultural insights and demographic analysis. Analyze the following cultural affinity data and provide comprehensive insights:

**Entity Analysis**: ${selectedEntity?.name || 'Selected Entity'}
**Location**: Latitude ${selectedLocation.lat.toFixed(4)}°, Longitude ${selectedLocation.lng.toFixed(4)}°
**Analysis Radius**: ${(radius / 1000).toFixed(0)}km

**Cultural Affinity Heatmap Results**:
- Total data points analyzed: ${heatmapData.length}
- Average cultural affinity: ${Math.round(avgAffinity * 100)}%
- High affinity areas (70%+): ${highAffinityPoints.length} locations
- Medium affinity areas (40-70%): ${mediumAffinityPoints.length} locations  
- Low affinity areas (<40%): ${lowAffinityPoints.length} locations
- Peak affinity score: ${heatmapData.length > 0 ? Math.round(Math.max(...heatmapData.map(p => p.query.affinity)) * 100) : 0}%

**Demographic Analysis**:
${demographicInsights || 'No demographic data available.'}

**Top Affinity Locations**:
${heatmapData.slice(0, 5).map((point, index) => 
  `${index + 1}. Location (${point.location.latitude.toFixed(4)}°, ${point.location.longitude.toFixed(4)}°): ${Math.round(point.query.affinity * 100)}% affinity`
).join('\n')}

Please provide a comprehensive analysis including:

1. **Cultural Landscape Overview**: What does this data tell us about the cultural landscape around this location?

2. **Demographic Insights**: How do the demographic patterns relate to the cultural affinity? What does this suggest about the audience?

3. **Geographic Patterns**: Are there any notable geographic clustering patterns in the high/medium/low affinity areas?

4. **Strategic Recommendations**: Based on this analysis, what practical recommendations would you give for:
   - Cultural events or activities in this area
   - Target audience engagement strategies
   - Optimal locations within the radius for maximum cultural resonance

5. **Cultural Opportunities**: What unique cultural opportunities or insights does this location offer?

Keep the analysis engaging, practical, and focused on actionable insights. Use specific data points to support your conclusions.`;

      const analysis = await togetherService.generateCulturalAnalysis(prompt);
      setAiInsightsSummary(analysis);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsightsSummary('Unable to generate AI insights at this time. The cultural data analysis shows interesting patterns in the heatmap and demographic data that warrant further exploration.');
    } finally {
      setGeneratingAiInsights(false);
    }
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
      const demographicsData = await generateEntityDemographics();
      
      // Generate AI insights summary
      await generateAiInsightsSummary(heatmapResults, demographicsData, selectedEntity, selectedLocation, radius);
    } catch (error) {
      console.error('Error generating heatmap:', error);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  // Generate entity demographics
  const generateEntityDemographics = async (): Promise<any[]> => {
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
      return demographicsData;
    } catch (error) {
      console.error('Error generating entity demographics:', error);
      setEntityDemographics([]);
      return [];
    } finally {
      setLoadingEntityDemographics(false);
    }
  };

  // Fetch subtypes for selected content type
  const fetchSubtypes = async (contentType: string) => {
    setLoadingSubtypes(true);
    try {
      const response = await qlooService.makeRequest(`/geospatial/describe?type=${contentType}`);
      
      // Parse the response structure: response.types[contentType].parameters.filter.tags
      const typeData = response.types?.[contentType];
      const filterTags = typeData?.parameters?.['filter.tags'] || [];
      
      console.log('Subtypes API response:', response);
      console.log('Parsed filter tags:', filterTags);
      
      setSubtypes(filterTags);
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
              <h4 className="text-white font-semibold mb-4">Search for an entity</h4>
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
              <div className="space-y-6">
                <h4 className="text-white font-semibold text-xl mb-4">Interactive Location Selection</h4>
                <p className="text-gray-300 mb-6">
                  Click anywhere on the map to analyze cultural preferences in that area, or use the controls below.
                </p>
                
                {/* Current Location Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed group"
                  >
                    {gettingLocation ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Getting Location...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        <span>My Current Location</span>
                      </>
                    )}
                  </button>
                  
                  {selectedLocation && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-400/30 rounded-xl">
                      <MapPin className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 text-sm font-medium">
                        {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Location Error Display */}
                {locationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-red-300 font-medium">Location Error</div>
                        <div className="text-red-200 text-sm">{locationError}</div>
                      </div>
                      <button
                        onClick={() => setLocationError(null)}
                        className="ml-auto p-1 text-red-300 hover:text-red-100 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Map */}
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

        {/* AI Cultural Insights Summary */}
        {heatmapGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <Brain className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-2xl font-semibold text-white">AI Cultural Analysis</h3>
              {generatingAiInsights && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-3"
                >
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </motion.div>
              )}
            </div>
            
            {generatingAiInsights ? (
              <div className="text-center py-8">
                <div className="text-gray-300 mb-4">Analyzing cultural patterns and demographic insights...</div>
                <div className="text-sm text-gray-400">This may take a few moments</div>
              </div>
            ) : aiInsightsSummary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed">
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(aiInsightsSummary) }}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-700/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{heatmapData.length}</div>
                    <div className="text-gray-400 text-sm">Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round((heatmapData.length > 0 ? heatmapData.reduce((sum, point) => sum + point.query.affinity, 0) / heatmapData.length : 0) * 100)}%
                    </div>
                    <div className="text-gray-400 text-sm">Avg Affinity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {heatmapData.filter(point => point.query.affinity > 0.7).length}
                    </div>
                    <div className="text-gray-400 text-sm">High Affinity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{(radius / 1000).toFixed(0)}km</div>
                    <div className="text-gray-400 text-sm">Radius</div>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-400/20 rounded-xl"
                >
                  <p className="text-purple-300 text-sm font-medium">
                    ✨ This analysis was generated using Google Gemma AI based on cultural affinity and demographic data from Qloo.
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">AI analysis will be generated after heatmap creation.</p>
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
              <div className="relative">
                <select
                  value={selectedContentType}
                  onChange={(e) => handleContentTypeSelect(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select Content Type</option>
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
              <div className="relative">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select Gender (Optional)</option>
                  {genderOptions.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.icon} {gender.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Age Group Selection */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Age Group</h4>
              <div className="relative">
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select Age Group (Optional)</option>
                  {ageGroups.map((age) => (
                    <option key={age.value} value={age.value}>
                      {age.icon} {age.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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