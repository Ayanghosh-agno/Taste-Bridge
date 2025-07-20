import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Zap, X, Star, Settings, Play } from 'lucide-react';
import { qlooService } from '../services/qloo';

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

interface HeatmapResponse {
  success: boolean;
  duration: number;
  results: {
    heatmap: HeatmapPoint[];
  };
}

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
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = () => {
    // Create a simple interactive map using HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.width = '100%';
    canvas.style.height = '400px';
    canvas.style.border = '1px solid #374151';
    canvas.style.borderRadius = '12px';
    canvas.style.cursor = 'crosshair';
    canvas.style.backgroundColor = '#1f2937';
    
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw world map outline (simplified)
    drawWorldMap(ctx, canvas.width, canvas.height);
    
    // Add click handler
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      
      // Convert canvas coordinates to lat/lng (simplified projection)
      const lng = ((x / canvas.width) * 360) - 180;
      const lat = 90 - ((y / canvas.height) * 180);
      
      setSelectedLocation({ lat, lng });
      
      // Redraw map with selected point
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWorldMap(ctx, canvas.width, canvas.height);
      drawSelectedPoint(ctx, x, y);
    });
    
    mapInstanceRef.current = { canvas, ctx };
  };

  const drawWorldMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw simplified world map
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    
    // Draw continents (very simplified)
    // North America
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.25);
    ctx.lineTo(width * 0.25, height * 0.2);
    ctx.lineTo(width * 0.3, height * 0.35);
    ctx.lineTo(width * 0.2, height * 0.45);
    ctx.closePath();
    ctx.stroke();
    
    // Europe
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.2);
    ctx.lineTo(width * 0.55, height * 0.15);
    ctx.lineTo(width * 0.6, height * 0.3);
    ctx.lineTo(width * 0.5, height * 0.35);
    ctx.closePath();
    ctx.stroke();
    
    // Asia
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.15);
    ctx.lineTo(width * 0.85, height * 0.1);
    ctx.lineTo(width * 0.9, height * 0.4);
    ctx.lineTo(width * 0.65, height * 0.45);
    ctx.closePath();
    ctx.stroke();
    
    // Grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    // Latitude lines
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Longitude lines
    for (let i = 1; i < 6; i++) {
      const x = (width / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const drawSelectedPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw selected location marker
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw radius circle
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const radiusPixels = (radius / 100000) * 50; // Scale radius for visualization
    ctx.arc(x, y, radiusPixels, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawHeatmap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!heatmapData.length) return;
    
    // Clear and redraw base map
    ctx.clearRect(0, 0, width, height);
    drawWorldMap(ctx, width, height);
    
    // Draw heatmap points
    heatmapData.forEach(point => {
      // Convert lat/lng to canvas coordinates
      const x = ((point.location.longitude + 180) / 360) * width;
      const y = ((90 - point.location.latitude) / 180) * height;
      
      // Color based on affinity
      const intensity = point.query.affinity;
      const alpha = Math.max(0.3, intensity);
      
      // Create gradient based on affinity
      if (intensity > 0.7) {
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`; // Orange for high affinity
      } else if (intensity > 0.4) {
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`; // Purple for medium affinity
      } else {
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`; // Blue for low affinity
      }
      
      // Draw point
      ctx.beginPath();
      const pointSize = 3 + (intensity * 8); // Size based on affinity
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow effect for high affinity points
      if (intensity > 0.6) {
        ctx.shadowColor = intensity > 0.7 ? '#f97316' : '#a855f7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, pointSize * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw selected location if exists
    if (selectedLocation) {
      const x = ((selectedLocation.lng + 180) / 360) * width;
      const y = ((90 - selectedLocation.lat) / 180) * height;
      drawSelectedPoint(ctx, x, y);
    }
  };

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
      
      // Update map with heatmap
      if (mapInstanceRef.current) {
        const { canvas, ctx } = mapInstanceRef.current;
        drawHeatmap(ctx, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Error generating heatmap:', error);
      // Generate mock heatmap data for demonstration
      const mockData = generateMockHeatmapData();
      setHeatmapData(mockData);
      setShowHeatmap(true);
      
      if (mapInstanceRef.current) {
        const { canvas, ctx } = mapInstanceRef.current;
        drawHeatmap(ctx, canvas.width, canvas.height);
      }
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
                <div ref={mapRef} className="w-full h-96 bg-gray-900 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Click anywhere on the map to select a location
                  </div>
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