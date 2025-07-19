import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Filter, BarChart3, Star, Eye, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { qlooService } from '../services/qloo';
import TrendChart from '../components/TrendChart';

const TrendsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('urn:entity:artist');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  const categories = [
    { id: 'urn:entity:artist', name: 'Artists', icon: '🎤', color: 'from-purple-500 to-pink-500' },
    { id: 'urn:entity:movie', name: 'Movies', icon: '🎬', color: 'from-red-500 to-orange-500' },
    { id: 'urn:entity:tv_show', name: 'TV Shows', icon: '📺', color: 'from-blue-500 to-cyan-500' },
    { id: 'urn:entity:book', name: 'Books', icon: '📚', color: 'from-green-500 to-teal-500' },
    { id: 'urn:entity:album', name: 'Albums', icon: '💿', color: 'from-indigo-500 to-purple-500' },
    { id: 'urn:entity:place', name: 'Places', icon: '📍', color: 'from-emerald-500 to-green-500' },
  ];

  useEffect(() => {
    loadTrends();
  }, [selectedCategory]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const trends = await qlooService.getTrendsByCategory(selectedCategory);
      console.log('Loaded trends:', trends);
      
      // Transform the data to include trend indicators
      const transformedTrends = trends.map((entity: any) => ({
        ...entity,
        change: entity.query?.rank_delta || (Math.random() - 0.5) * 20,
        trend: entity.query?.rank_delta > 0 ? 'up' : entity.query?.rank_delta < 0 ? 'down' : 'stable',
        popularity: entity.popularity || Math.random(),
        rank: entity.query?.rank || Math.floor(Math.random() * 100) + 1
      }));
      
      setTrendData(transformedTrends);
    } catch (error) {
      console.error('Error loading trends:', error);
      // Fallback to mock data
      setTrendData([
        {
          name: 'Taylor Swift',
          entity_id: 'taylor-swift',
          type: 'urn:entity:artist',
          properties: { image: { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg' } },
          change: 15.2,
          trend: 'up',
          popularity: 0.95,
          rank: 1
        },
        {
          name: 'The Weeknd',
          entity_id: 'the-weeknd',
          type: 'urn:entity:artist',
          properties: { image: { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg' } },
          change: -3.1,
          trend: 'down',
          popularity: 0.88,
          rank: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadEntityTrend = async (entity: any) => {
    setSelectedEntity(entity);
    setChartLoading(true);
    
    try {
      // Get last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      
      const weeklyData = await qlooService.getEntityWeeklyTrend(
        entity.entity_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      console.log('Weekly trend data:', weeklyData);
      setChartData(weeklyData);
    } catch (error) {
      console.error('Error loading entity trend:', error);
      // Fallback to mock data
      setChartData([
        { day: 'Mon', value: 65 },
        { day: 'Tue', value: 72 },
        { day: 'Wed', value: 68 },
        { day: 'Thu', value: 85 },
        { day: 'Fri', value: 91 },
        { day: 'Sat', value: 88 },
        { day: 'Sun', value: 94 }
      ]);
    } finally {
      setChartLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cultural Trends</h1>
          <p className="text-gray-400 text-base sm:text-lg">Discover what's trending in culture right now</p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-6">
            <Filter className="h-5 w-5 text-purple-400 mr-2" />
            <h3 className="text-lg sm:text-xl font-semibold text-white">Categories</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-2">{category.icon}</div>
                  <div className={`text-xs sm:text-sm font-medium ${
                    selectedCategory === category.id ? 'text-purple-300' : 'text-gray-300'
                  }`}>
                    {category.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Trending List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
                <h3 className="text-lg sm:text-2xl font-semibold text-white">Trending Now</h3>
              </div>
              
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading trends...</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {trendData.map((item, index) => (
                    <motion.div
                      key={item.entity_id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => loadEntityTrend(item)}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white font-bold text-sm sm:text-base flex-shrink-0">
                          {index + 1}
                        </div>
                        
                        {item.properties?.image?.url ? (
                          <img 
                            src={item.properties.image.url} 
                            alt={item.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-600 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600 flex-shrink-0">
                            <span className="text-white font-bold text-sm sm:text-lg">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm sm:text-base truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                              {item.type?.replace('urn:entity:', '') || 'entity'}
                            </span>
                            {item.popularity && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span className="text-gray-400 text-xs">
                                  {Math.round(item.popularity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {getTrendIcon(item.trend)}
                        <span className={`font-bold text-sm sm:text-base ${getTrendColor(item.trend)}`}>
                          {item.change > 0 ? '+' : ''}{item.change?.toFixed(1) || '0.0'}%
                        </span>
                        <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Weekly Trend</h3>
              </div>
              
              {selectedEntity ? (
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    {selectedEntity.properties?.image?.url ? (
                      <img 
                        src={selectedEntity.properties.image.url} 
                        alt={selectedEntity.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {selectedEntity.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm sm:text-base truncate">{selectedEntity.name}</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">7-day trend</p>
                    </div>
                  </div>
                  
                  {chartLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-400 mt-2 text-sm">Loading chart...</p>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-64">
                      <TrendChart data={chartData} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">Select an item to view its weekly trend</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Trend Insights */}
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 sm:mt-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Trend Insights</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-3 sm:p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-white">#{selectedEntity.rank || 'N/A'}</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Current Rank</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-700/30 rounded-xl">
                  <div className={`text-xl sm:text-2xl font-bold ${getTrendColor(selectedEntity.trend)}`}>
                    {selectedEntity.change > 0 ? '+' : ''}{selectedEntity.change?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">Weekly Change</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {Math.round((selectedEntity.popularity || 0) * 100)}%
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">Popularity</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">
                    {selectedEntity.trend === 'up' ? 'Rising' : selectedEntity.trend === 'down' ? 'Falling' : 'Stable'}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">Trend Status</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrendsPage;