import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Music, Utensils, Film, Palette, MapPin, Star, ExternalLink, Calendar, Users, User, Award, BarChart3, ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react';
import { qlooService } from '../services/qloo';
import TrendChart from '../components/TrendChart';

const TrendsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('actor');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityTrendData, setEntityTrendData] = useState<any>(null);
  const [loadingEntityTrend, setLoadingEntityTrend] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  const categories = [
    { id: 'brand', label: 'Brands', icon: <Palette className="h-5 w-5" /> },
    { id: 'actor', label: 'Actors', icon: <Users className="h-5 w-5" /> },
    { id: 'person', label: 'People', icon: <User className="h-5 w-5" /> },
    { id: 'artist', label: 'Artists', icon: <Music className="h-5 w-5" /> },
    { id: 'podcast', label: 'Podcasts', icon: <MapPin className="h-5 w-5" /> },
    { id: 'movie', label: 'Movies', icon: <Film className="h-5 w-5" /> },
    { id: 'tv_show', label: 'TV Shows', icon: <Utensils className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchTrends(activeCategory);
  }, [activeCategory]);

  const fetchTrends = async (category: string) => {
    try {
      // Fetch real trends data from Qloo API
      const trendsData = await qlooService.getTrendsByCategory(category);
      const tags = await qlooService.getTags();
      
      const processedData = {
        trending: trendsData.length > 0 ? trendsData : [],
        tags: tags.length > 0 ? [...new Set(tags.map((tag: any) => tag.name || tag.id))].slice(0, 12) : [
          'experimental', 'atmospheric', 'nostalgic', 'dreamy', 'melancholic',
          'introspective', 'ethereal', 'minimalist', 'organic', 'intimate', 'contemporary', 'artisanal'
        ],
        chartData: Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 100) + 50
        }))
      };
      
      setTrendsData(processedData);
    } catch (error) {
      console.error('Error fetching trends:', error);
      const fallbackData = {
        trending: [],
        tags: [
          'experimental', 'atmospheric', 'nostalgic', 'dreamy', 'melancholic',
          'introspective', 'ethereal', 'minimalist', 'organic', 'intimate'
        ],
        chartData: Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 100) + 50
        }))
      };
      
      setTrendsData(fallbackData);
    }
  };

  const togglePlatforms = (entityId: string) => {
    setExpandedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  };

  const handleEntityClick = async (entity: any) => {
    setSelectedEntity(entity);
    setShowTrendModal(true);
    await fetchEntityTrend(entity);
  };

  const fetchEntityTrend = async (entity: any) => {
    if (!entity || !startDate || !endDate) return;
    
    setLoadingEntityTrend(true);
    try {
      const trendData = await qlooService.getEntityWeeklyTrend(
        entity.entity_id,
        startDate,
        endDate
      );
      
      // Handle the actual API response structure
      if (trendData && trendData.results && trendData.results.trends) {
        const processedData = trendData.results.trends.map((trend: any) => {
          const date = new Date(trend.date);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return {
            day: `${date.getMonth() + 1}/${date.getDate()}`,
            fullDate: trend.date,
            dayName: dayNames[date.getDay()],
            popularity: trend.popularity || 0,
            rank: trend.rank || 0,
            rankDelta: trend.rank_delta || 0,
            populationPercentDelta: trend.population_percent_delta || 0,
            value: Math.round((trend.popularity || 0) * 100) // Convert to 0-100 scale for chart
          };
        });
        setEntityTrendData(processedData);
      } else {
        // Fallback to mock data if API response is unexpected
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const fallbackData = Array.from({ length: days }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          return {
            day: `${date.getMonth() + 1}/${date.getDate()}`,
            fullDate: date.toISOString(),
            dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
            popularity: Math.random(),
            rank: Math.floor(Math.random() * 100) + 1,
            rankDelta: Math.floor(Math.random() * 21) - 10,
            populationPercentDelta: (Math.random() - 0.5) * 0.01,
            value: Math.floor(Math.random() * 100) + 50
          };
        });
        setEntityTrendData(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching entity trend:', error);
      // Return mock data as fallback
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const fallbackData = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return {
          day: `${date.getMonth() + 1}/${date.getDate()}`,
          fullDate: date.toISOString(),
          dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
          popularity: Math.random(),
          rank: Math.floor(Math.random() * 100) + 1,
          rankDelta: Math.floor(Math.random() * 21) - 10,
          populationPercentDelta: (Math.random() - 0.5) * 0.01,
          value: Math.floor(Math.random() * 100) + 50
        };
      });
      setEntityTrendData(fallbackData);
    } finally {
      setLoadingEntityTrend(false);
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
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 blur-3xl"></div>
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-4">
                Cultural Trends
              </h1>
              <p className="text-xl text-gray-300">Discover what's shaping global taste and culture</p>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-xl shadow-purple-500/30 scale-105'
                  : 'bg-gray-800/50 backdrop-blur-md text-gray-300 hover:bg-gray-700/50 hover:scale-105 border border-gray-700'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeCategory === category.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {category.icon}
              </span>
              <span className="text-lg">{category.label}</span>
            </button>
          ))}
        </motion.div>

        {trendsData && (
          <div>
            {/* Trending Entities */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 mb-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl mr-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Trending Now</h3>
                    <p className="text-gray-400">Most popular in {categories.find(c => c.id === activeCategory)?.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">{trendsData.trending?.length || 0}</div>
                  <div className="text-sm text-gray-400">entities</div>
                </div>
              </div>
              
              <div className="space-y-6">
                {trendsData.trending && trendsData.trending.length > 0 ? trendsData.trending.map((entity: any, index: number) => (
                  <motion.div
                    key={entity.entity_id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="group p-6 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-2xl hover:from-gray-700/60 hover:to-gray-600/60 transition-all duration-300 border border-gray-600/30 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
                    onClick={() => handleEntityClick(entity)}
                  >
                    {/* Header with rank, name and image */}
                    <div className="flex items-start gap-6 mb-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Image */}
                      {entity.properties?.image?.url ? (
                        <img 
                          src={entity.properties.image.url} 
                          alt={entity.name}
                          className="w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-gray-600 group-hover:border-purple-400 transition-colors duration-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center border-2 border-gray-600">
                          <Music className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Name and basic info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-white font-bold text-xl group-hover:text-purple-300 transition-colors duration-300">{entity.name}</h4>
                          {entity.entity_id && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                              ID
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {entity.type && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30 font-medium">
                            {entity.type}
                            </span>
                          )}
                          {entity.subtype && (
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-400/30 font-medium">
                            {entity.subtype}
                            </span>
                          )}
                        </div>
                        {entity.disambiguation && (
                          <p className="text-gray-400 text-sm mb-3">{entity.disambiguation}</p>
                        )}
                        
                        {/* Popularity */}
                        {entity.popularity && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-gray-300 font-medium">
                              {(entity.popularity * 100).toFixed(2)}% popular
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Quick stats */}
                      <div className="flex-shrink-0 text-right">
                        {entity.query && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-purple-400" />
                              <span className="text-white font-bold">#{entity.query.rank}</span>
                            </div>
                            <div className="text-xs text-gray-400">Rank</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Alternative Names (AKAs) */}
                    {entity.properties?.akas && entity.properties.akas.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-4 w-4 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold">Alternative Names ({entity.properties.akas.length})</span>
                        </div>
                        <div className="max-h-24 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {entity.properties.akas.map((aka: any, akaIndex: number) => (
                              <span
                                key={akaIndex}
                                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-400/30"
                                title={`Languages: ${aka.languages.join(', ')}`}
                              >
                                {aka.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Descriptions */}
                    {entity.properties?.short_descriptions && entity.properties.short_descriptions.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-semibold">Description</span>
                        </div>
                        <div className="text-gray-300 text-sm leading-relaxed">
                          {entity.properties.short_descriptions[0]?.value}
                          {entity.properties.short_descriptions.length > 1 && (
                            <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                              +{entity.properties.short_descriptions.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Birth/Origin info */}
                    {(entity.properties?.date_of_birth || entity.properties?.place_of_birth) && (
                      <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-semibold">Personal Info</span>
                        </div>
                        <div className="space-y-1">
                          {entity.properties.date_of_birth && (
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-400">Born:</span> {entity.properties.date_of_birth}
                          </p>
                          )}
                          {entity.properties.place_of_birth && (
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-400">From:</span> {entity.properties.place_of_birth}
                          </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {entity.tags && entity.tags.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Palette className="h-4 w-4 text-orange-400" />
                          <span className="text-orange-400 font-semibold">Genres ({entity.tags.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entity.tags.map((tag: any, tagIndex: number) => (
                            <span
                              key={tag.id || tagIndex}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-orange-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30 hover:from-purple-500/30 hover:to-orange-500/30 transition-all duration-200 cursor-pointer hover:scale-105"
                              title={`ID: ${tag.id} | Type: ${tag.type}`}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Query metrics */}
                    {entity.query && (
                      <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Performance Metrics</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-gray-700/30 rounded">
                            <div className="text-white font-bold text-lg">{entity.query.rank}</div>
                            <div className="text-gray-400 text-xs">Rank</div>
                          </div>
                          <div className="text-center p-3 bg-gray-700/30 rounded">
                            <div className={`font-semibold text-lg ${entity.query.rank_delta > 0 ? 'text-green-400' : entity.query.rank_delta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {entity.query.rank_delta > 0 ? '↗' : entity.query.rank_delta < 0 ? '↘' : '→'} {Math.abs(entity.query.rank_delta)}
                            </div>
                            <div className="text-gray-400 text-xs">Rank Change</div>
                          </div>
                          <div className="text-center p-3 bg-gray-700/30 rounded">
                            <div className="text-white font-bold text-lg">
                              {(entity.query.population_percentile * 100).toFixed(2)}%
                            </div>
                            <div className="text-gray-400 text-xs">Pop. Percentile</div>
                          </div>
                          <div className="text-center p-3 bg-gray-700/30 rounded">
                            <div className="text-white font-bold text-lg">#{entity.query.trending_rank}</div>
                            <div className="text-gray-400 text-xs">Trending Rank</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* External links */}
                    {entity.external && (
                      <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
                        <button
                          onClick={() => togglePlatforms(entity.entity_id || `entity-${index}`)}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-700/30 rounded-lg transition-colors duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-400 font-semibold">
                              External Platforms ({Object.values(entity.external).flat().length})
                            </span>
                          </div>
                          {expandedPlatforms.has(entity.entity_id || `entity-${index}`) ? (
                            <ChevronUp className="h-4 w-4 text-blue-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-blue-400" />
                          )}
                        </button>
                        
                        {expandedPlatforms.has(entity.entity_id || `entity-${index}`) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(entity.external).map(([platform, links]: [string, any]) => (
                                links && links.length > 0 && links.map((link: any, linkIndex: number) => (
                                  <div
                                    key={`${platform}-${linkIndex}`}
                                    className="p-3 bg-gray-700/40 rounded-lg border border-gray-600/50 hover:border-blue-400/50 transition-colors duration-200"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30 font-medium uppercase">
                                          {platform}
                                        </span>
                                        {link.verified && (
                                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                                            ✓ Verified
                                          </span>
                                        )}
                                      </div>
                                      <a
                                        href={
                                          platform === 'spotify' ? `https://open.spotify.com/artist/${link.id}` :
                                          platform === 'twitter' ? `https://twitter.com/${link.id}` :
                                          platform === 'instagram' ? `https://instagram.com/${link.id}` :
                                          platform === 'facebook' ? `https://facebook.com/${link.id}` :
                                          platform === 'lastfm' ? `https://last.fm/music/${link.id}` :
                                          platform === 'imdb' ? `https://imdb.com/name/${link.id}` :
                                          '#'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all duration-200"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                    
                                    <div className="text-gray-300 text-sm mb-3 font-medium">@{link.id}</div>
                                    
                                    {/* Platform-specific metrics */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {link.followers && (
                                        <div className="text-center p-2 bg-gray-800/60 rounded">
                                          <div className="text-white font-bold">
                                            {link.followers > 1000000 
                                              ? `${(link.followers / 1000000).toFixed(1)}M`
                                              : link.followers > 1000
                                              ? `${(link.followers / 1000).toFixed(1)}K`
                                              : link.followers}
                                          </div>
                                          <div className="text-gray-400">Followers</div>
                                        </div>
                                      )}
                                      {link.monthly_listeners && (
                                        <div className="text-center p-2 bg-gray-800/60 rounded">
                                          <div className="text-white font-bold">
                                            {link.monthly_listeners > 1000000 
                                              ? `${(link.monthly_listeners / 1000000).toFixed(1)}M`
                                              : link.monthly_listeners > 1000
                                              ? `${(link.monthly_listeners / 1000).toFixed(1)}K`
                                              : link.monthly_listeners}
                                          </div>
                                          <div className="text-gray-400">Monthly</div>
                                        </div>
                                      )}
                                      {link.listeners && (
                                        <div className="text-center p-2 bg-gray-800/60 rounded">
                                          <div className="text-white font-bold">
                                            {link.listeners > 1000000 
                                              ? `${(link.listeners / 1000000).toFixed(1)}M`
                                              : link.listeners > 1000
                                              ? `${(link.listeners / 1000).toFixed(1)}K`
                                              : link.listeners}
                                          </div>
                                          <div className="text-gray-400">Listeners</div>
                                        </div>
                                      )}
                                      {link.scrobbles && (
                                        <div className="text-center p-2 bg-gray-800/60 rounded">
                                          <div className="text-white font-bold">
                                            {link.scrobbles > 1000000000 
                                              ? `${(link.scrobbles / 1000000000).toFixed(1)}B`
                                              : link.scrobbles > 1000000 
                                              ? `${(link.scrobbles / 1000000).toFixed(1)}M`
                                              : link.scrobbles > 1000
                                              ? `${(link.scrobbles / 1000).toFixed(1)}K`
                                              : link.scrobbles}
                                          </div>
                                          <div className="text-gray-400">Scrobbles</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg">No trending data available for this category</p>
                    <p className="text-gray-500 text-sm mt-2">Try selecting a different category or check back later</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        )}

        {/* Tag Cloud */}
        {trendsData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl mr-4">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Popular Tags</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {trendsData.tags.map((tag: string, index: number) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-400/30 rounded-2xl text-purple-300 font-semibold hover:scale-105 hover:from-purple-500/30 hover:to-orange-500/30 transition-all duration-200 cursor-pointer shadow-lg"
                  style={{
                    fontSize: `${0.9 + Math.random() * 0.3}rem`
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Trend Modal */}
      {showTrendModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrendModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedEntity?.name} - Weekly Trends
                  </h3>
                  <p className="text-gray-400">Analyze popularity trends over time</p>
                </div>
              </div>
              <button
                onClick={() => setShowTrendModal(false)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Date Controls */}
            <div className="mb-8 p-6 bg-gray-700/30 rounded-2xl border border-gray-600/30">
              <h4 className="text-lg font-semibold text-white mb-4">Date Range</h4>
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <button
                  onClick={() => fetchEntityTrend(selectedEntity)}
                  disabled={loadingEntityTrend || !startDate || !endDate}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingEntityTrend ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <RefreshCw className="h-5 w-5" />
                  )}
                  Update
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="mb-8 bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Popularity Trend Over Time
              </h4>
              {loadingEntityTrend ? (
                <div className="h-64 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : entityTrendData && entityTrendData.length > 0 ? (
                <TrendChart data={entityTrendData} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg">No trend data available</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting the date range</p>
                  </div>
                </div>
              )}
            </div>
                  
            {/* Trend Summary */}
            {entityTrendData && entityTrendData.length > 0 && (
              <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Current Performance Metrics
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-600/30 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      #{entityTrendData[entityTrendData.length - 1]?.rank || 'N/A'}
                    </div>
                    <div className="text-gray-400 text-sm">Current Rank</div>
                  </div>
                  <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-600/30 text-center">
                    <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-1 ${
                      (entityTrendData[entityTrendData.length - 1]?.rankDelta || 0) > 0 
                        ? 'text-green-400' 
                        : (entityTrendData[entityTrendData.length - 1]?.rankDelta || 0) < 0 
                        ? 'text-red-400' 
                        : 'text-gray-400'
                    }`}>
                      {(entityTrendData[entityTrendData.length - 1]?.rankDelta || 0) > 0 ? (
                        <>↗ +{entityTrendData[entityTrendData.length - 1]?.rankDelta}</>
                      ) : (entityTrendData[entityTrendData.length - 1]?.rankDelta || 0) < 0 ? (
                        <>↘ {entityTrendData[entityTrendData.length - 1]?.rankDelta}</>
                      ) : (
                        <>→ 0</>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">Rank Change</div>
                  </div>
                  <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-600/30 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {((entityTrendData[entityTrendData.length - 1]?.popularity || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Popularity Score</div>
                  </div>
                  <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-600/30 text-center">
                    <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-1 ${
                      (entityTrendData[entityTrendData.length - 1]?.populationPercentDelta || 0) > 0 
                        ? 'text-green-400' 
                        : (entityTrendData[entityTrendData.length - 1]?.populationPercentDelta || 0) < 0 
                        ? 'text-red-400' 
                        : 'text-gray-400'
                    }`}>
                      {(entityTrendData[entityTrendData.length - 1]?.populationPercentDelta || 0) > 0 ? '+' : ''}
                      {((entityTrendData[entityTrendData.length - 1]?.populationPercentDelta || 0) * 100).toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">Population Change</div>
                  </div>
                </div>
                
                {/* Trend Analysis */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-xl border border-purple-400/20">
                  <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    Trend Analysis
                  </h5>
                  <p className="text-gray-300 text-sm">
                    {(() => {
                      const latestData = entityTrendData[entityTrendData.length - 1];
                      const rankDelta = latestData?.rankDelta || 0;
                      const popDelta = latestData?.populationPercentDelta || 0;
                      
                      if (rankDelta > 0 && popDelta > 0) {
                        return `📈 ${selectedEntity?.name} is trending upward with improved ranking and growing popularity.`;
                      } else if (rankDelta < 0 && popDelta < 0) {
                        return `📉 ${selectedEntity?.name} is experiencing a decline in both ranking and popularity.`;
                      } else if (rankDelta > 0) {
                        return `⬆️ ${selectedEntity?.name} has improved in ranking despite mixed popularity signals.`;
                      } else if (popDelta > 0) {
                        return `📊 ${selectedEntity?.name} is gaining popularity even with ranking fluctuations.`;
                      } else {
                        return `➡️ ${selectedEntity?.name} shows stable performance with minimal changes.`;
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TrendsPage;