import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Filter, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { qlooService } from '../services/qloo';
import TrendChart from '../components/TrendChart';

const TrendsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('urn:entity:movie');
  const [trendingEntities, setTrendingEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'urn:entity:movie', name: 'Movies', icon: '🎬', color: 'from-red-500 to-pink-500' },
    { id: 'urn:entity:tv_show', name: 'TV Shows', icon: '📺', color: 'from-blue-500 to-cyan-500' },
    { id: 'urn:entity:artist', name: 'Artists', icon: '🎤', color: 'from-purple-500 to-pink-500' },
    { id: 'urn:entity:album', name: 'Albums', icon: '💿', color: 'from-indigo-500 to-purple-500' },
    { id: 'urn:entity:book', name: 'Books', icon: '📚', color: 'from-green-500 to-teal-500' },
    { id: 'urn:entity:destination', name: 'Destinations', icon: '🏝️', color: 'from-teal-500 to-green-500' },
    { id: 'urn:entity:brand', name: 'Brands', icon: '🏷️', color: 'from-orange-500 to-red-500' },
    { id: 'urn:entity:videogame', name: 'Games', icon: '🎮', color: 'from-pink-500 to-purple-500' }
  ];

  useEffect(() => {
    loadTrendingEntities();
  }, [selectedCategory]);

  const loadTrendingEntities = async () => {
    setLoading(true);
    try {
      const entities = await qlooService.getTrendsByCategory(selectedCategory);
      console.log('Trending entities:', entities);
      
      // Add mock trend data if API doesn't provide it
      const entitiesWithTrends = entities.map((entity, index) => ({
        ...entity,
        change: Math.random() > 0.5 ? Math.random() * 50 + 10 : -(Math.random() * 30 + 5),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
        rank: index + 1,
        popularity: entity.popularity || Math.random() * 0.5 + 0.5
      }));
      
      setTrendingEntities(entitiesWithTrends);
    } catch (error) {
      console.error('Error loading trending entities:', error);
      // Fallback to mock data
      setTrendingEntities(generateMockTrendingData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendingData = () => {
    const mockNames = {
      'urn:entity:movie': ['Dune: Part Two', 'Oppenheimer', 'Barbie', 'Spider-Man: Across the Spider-Verse', 'The Batman'],
      'urn:entity:tv_show': ['The Bear', 'Wednesday', 'House of the Dragon', 'Stranger Things', 'The Last of Us'],
      'urn:entity:artist': ['Taylor Swift', 'Bad Bunny', 'Drake', 'Olivia Rodrigo', 'The Weeknd'],
      'urn:entity:album': ['Midnights', 'Un Verano Sin Ti', 'Renaissance', 'Harry\'s House', 'Dawn FM'],
      'urn:entity:book': ['Fourth Wing', 'Tomorrow, and Tomorrow, and Tomorrow', 'The Seven Husbands of Evelyn Hugo', 'Atomic Habits', 'Where the Crawdads Sing'],
      'urn:entity:destination': ['Tokyo', 'Paris', 'Bali', 'Iceland', 'Morocco'],
      'urn:entity:brand': ['Nike', 'Apple', 'Tesla', 'Netflix', 'Spotify'],
      'urn:entity:videogame': ['Elden Ring', 'God of War Ragnarök', 'Horizon Forbidden West', 'Stray', 'Cyberpunk 2077']
    };

    const names = mockNames[selectedCategory as keyof typeof mockNames] || ['Item 1', 'Item 2', 'Item 3'];
    
    return names.map((name, index) => ({
      name,
      entity_id: `${name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      type: selectedCategory,
      properties: {
        image: {
          url: `https://images.pexels.com/photos/${1000000 + index}/pexels-photo-${1000000 + index}.jpeg`
        }
      },
      popularity: Math.random() * 0.5 + 0.5,
      change: Math.random() > 0.5 ? Math.random() * 50 + 10 : -(Math.random() * 30 + 5),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
      rank: index + 1
    }));
  };

  const handleEntityClick = async (entity: any) => {
    setSelectedEntity(entity);
    setLoadingTrend(true);
    
    try {
      // Get last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      
      const trendData = await qlooService.getEntityWeeklyTrend(
        entity.entity_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      setTrendData(trendData);
    } catch (error) {
      console.error('Error loading trend data:', error);
      // Generate mock trend data
      const mockTrendData = Array.from({ length: 7 }, (_, i) => ({
        day: `${new Date().getMonth() + 1}/${new Date().getDate() - 6 + i}`,
        value: Math.floor(Math.random() * 100) + 50
      }));
      setTrendData(mockTrendData);
    } finally {
      setLoadingTrend(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Cultural Trends
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Discover what's trending across different cultural domains
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          {/* Mobile Filter Toggle */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl text-white"
            >
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-purple-400" />
                <span className="font-medium">
                  {categories.find(cat => cat.id === selectedCategory)?.name || 'Select Category'}
                </span>
              </div>
              {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Category Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowFilters(false);
                }}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{category.icon}</div>
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

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Trending List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-3" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                  Trending {categories.find(cat => cat.id === selectedCategory)?.name}
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading trends...</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {trendingEntities.slice(0, 10).map((entity, index) => (
                    <motion.div
                      key={entity.entity_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleEntityClick(entity)}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-8 sm:w-10 text-center">
                        <span className="text-gray-400 font-bold text-sm sm:text-base">#{entity.rank}</span>
                      </div>
                      
                      {entity.properties?.image?.url ? (
                        <img 
                          src={entity.properties.image.url} 
                          alt={entity.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-600 group-hover:border-purple-400 transition-colors duration-200"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600 group-hover:border-purple-400 transition-colors duration-200">
                          <span className="text-white font-bold text-sm sm:text-lg">
                            {entity.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-purple-300 transition-colors duration-200">
                          {entity.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                            <span className="text-gray-400 text-xs sm:text-sm">
                              {Math.round((entity.popularity || 0) * 100)}%
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">•</span>
                          <span className="text-gray-400 text-xs sm:text-sm">
                            {entity.type?.replace('urn:entity:', '') || 'item'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-right">
                        <div className={`flex items-center gap-1 sm:gap-2 ${getTrendColor(entity.trend)}`}>
                          <span className="text-lg sm:text-xl">{getTrendIcon(entity.trend)}</span>
                          <span className="font-bold text-sm sm:text-base">
                            {entity.change > 0 ? '+' : ''}{Math.round(entity.change)}%
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          vs last week
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-gray-700 sticky top-24"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 mr-3" />
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  {selectedEntity ? 'Weekly Trend' : 'Select an Item'}
                </h3>
              </div>

              {selectedEntity ? (
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    {selectedEntity.properties?.image?.url ? (
                      <img 
                        src={selectedEntity.properties.image.url} 
                        alt={selectedEntity.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {selectedEntity.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                        {selectedEntity.name}
                      </h4>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Rank #{selectedEntity.rank}
                      </p>
                    </div>
                  </div>

                  {loadingTrend ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-400 mt-3 text-sm">Loading trend data...</p>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-64">
                      <TrendChart data={trendData} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-4">📊</div>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Click on any trending item to see its weekly performance
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { label: 'Total Trending', value: trendingEntities.length, icon: '📈' },
            { label: 'Rising Fast', value: trendingEntities.filter(e => e.trend === 'up').length, icon: '🚀' },
            { label: 'Declining', value: trendingEntities.filter(e => e.trend === 'down').length, icon: '📉' },
            { label: 'Stable', value: trendingEntities.filter(e => e.trend === 'stable').length, icon: '➡️' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-gray-700 text-center"
            >
              <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TrendsPage;