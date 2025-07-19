import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Brain, TrendingUp, Globe, X, MapPin, Film, Music, BookOpen, Download, Share2, RefreshCw, ChevronLeft, ChevronRight, Search, Star, Plus } from 'lucide-react';
import { qlooService } from '../services/qloo';

const PersonaPage: React.FC = () => {
  const navigate = useNavigate();
  const [userTastes, setUserTastes] = useState<string>('');
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>({});
  const [personaSummary, setPersonaSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // Target Audience Explorer state
  const [audienceTypes, setAudienceTypes] = useState<any[]>([]);
  const [selectedAudienceType, setSelectedAudienceType] = useState<string>('');
  const [availableAudiences, setAvailableAudiences] = useState<any[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<any[]>([]);
  const [loadingAudienceTypes, setLoadingAudienceTypes] = useState(false);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  
  // Entity search state
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const savedTastes = localStorage.getItem('userTastes');
    const savedEntities = localStorage.getItem('foundEntities');
    
    if (savedTastes) {
      setUserTastes(savedTastes);
    }
    
    if (savedEntities) {
      try {
        const entities = JSON.parse(savedEntities);
        setSelectedEntities(entities);
        if (entities.length > 0) {
          generatePersona(entities);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error('Error parsing stored entities:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const generatePersona = async (entities: any[]) => {
    setLoading(true);
    try {
      console.log('Starting persona generation with entities:', entities);
      
      // Step 1: Get Analysis data
      const entityIds = entities.map(e => e.entity_id).filter(Boolean);
      const analysis = await qlooService.getAnalysis(entityIds);
      setAnalysisData(analysis);
      
      // Store analysis data in localStorage
      localStorage.setItem('analysisData', JSON.stringify(analysis));
      
      // Step 2: Get Insights for different types
      await generateInsights(analysis.tags);
      
      // Step 2.5: Load audience types for Target Audience Explorer
      await loadAudienceTypes();
      
      // Step 3: Generate AI summary
      await generateAISummary(entities, analysis.tags);
      
    } catch (error) {
      console.error('Error generating persona:', error);
      // Set fallback data
      setAnalysisData({
        tags: [
          { name: 'Pop', affinity: 0.95, tag_id: 'pop' },
          { name: 'Contemporary', affinity: 0.82, tag_id: 'contemporary' },
          { name: 'Mainstream', affinity: 0.78, tag_id: 'mainstream' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAudienceTypes = async () => {
    setLoadingAudienceTypes(true);
    try {
      const types = await qlooService.getAudienceTypes();
      setAudienceTypes(types);
    } catch (error) {
      console.error('Error loading audience types:', error);
    } finally {
      setLoadingAudienceTypes(false);
    }
  };

  const handleAudienceTypeSelect = async (audienceType: string) => {
    setSelectedAudienceType(audienceType);
    setLoadingAudiences(true);
    setAvailableAudiences([]);
    
    try {
      const entityIds = selectedEntities.map(e => e.entity_id).filter(Boolean);
      const audiences = await qlooService.getAudiencesByType(audienceType, entityIds);
      setAvailableAudiences(audiences);
    } catch (error) {
      console.error('Error loading audiences:', error);
      setAvailableAudiences([]);
    } finally {
      setLoadingAudiences(false);
    }
  };

  const handleAudienceSelect = (audience: any) => {
    if (selectedAudiences.find(a => a.id === audience.id)) {
      // Remove if already selected
      const updatedAudiences = selectedAudiences.filter(a => a.id !== audience.id);
      setSelectedAudiences(updatedAudiences);
      // Store updated audiences in localStorage
      localStorage.setItem('selectedAudiences', JSON.stringify(updatedAudiences));
    } else {
      // Add to selected
      const updatedAudiences = [...selectedAudiences, audience];
      setSelectedAudiences(updatedAudiences);
      // Store updated audiences in localStorage
      localStorage.setItem('selectedAudiences', JSON.stringify(updatedAudiences));
    }
  };

  const removeSelectedAudience = (audienceId: string) => {
    const updatedAudiences = selectedAudiences.filter(a => a.id !== audienceId);
    setSelectedAudiences(updatedAudiences);
    // Store updated audiences in localStorage
    localStorage.setItem('selectedAudiences', JSON.stringify(updatedAudiences));
  };

  const isAudienceSelected = (audienceId: string) => {
    return selectedAudiences.some(a => a.id === audienceId);
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 0.8) return 'from-green-500 to-emerald-500';
    if (popularity >= 0.6) return 'from-yellow-500 to-orange-500';
    if (popularity >= 0.4) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getPopularityLabel = (popularity: number) => {
    if (popularity >= 0.8) return 'High';
    if (popularity >= 0.6) return 'Medium';
    if (popularity >= 0.4) return 'Low';
    return 'Very Low';
  };

  const generateInsights = async (tags: any[]) => {
    setLoadingInsights(true);
    try {
      const tagIds = tags.slice(0, 5).map(tag => tag.tag_id || tag.name);
      
      const [places, movies, artists, books] = await Promise.all([
        qlooService.getInsightsByType('urn:entity:place', tagIds, 8),
        qlooService.getInsightsByType('urn:entity:movie', tagIds, 8),
        qlooService.getInsightsByType('urn:entity:artist', tagIds, 8),
        qlooService.getInsightsByType('urn:entity:book', tagIds, 8)
      ]);
      
      setInsightsData({
        places,
        movies,
        artists,
        books
      });
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const generateAISummary = async (entities: any[], tags: any[]) => {
    setLoadingSummary(true);
    try {
      // Mock AI summary generation
      const topEntities = entities.slice(0, 3).map(e => e.name);
      const topTags = tags.slice(0, 3).map(t => t.name);
      
      const summary = `You are someone who vibes with ${topTags.join(', ').toLowerCase()} themes and celebrates artists like ${topEntities.join(' and ')}. Your taste reflects a blend of contemporary culture and emotional depth, suggesting you appreciate both mainstream appeal and artistic authenticity. You're drawn to experiences that combine innovation with relatability, making you part of a generation that values both individual expression and collective connection.`;
      
      // Simulate typing effect
      let currentText = '';
      const words = summary.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentText += words[i] + ' ';
        setPersonaSummary(currentText);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setPersonaSummary('Your cultural persona reflects a unique blend of contemporary tastes and authentic expression.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleEntitySearch = async (query: string) => {
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

  const handleAddEntity = (entity: any) => {
    // Check if entity is already selected
    if (selectedEntities.find(e => e.entity_id === entity.entity_id)) {
      return;
    }
    
    const updatedEntities = [...selectedEntities, entity];
    setSelectedEntities(updatedEntities);
    localStorage.setItem('foundEntities', JSON.stringify(updatedEntities));
    
    // Clear search
    setSearchInput('');
    setShowSuggestions(false);
    setSearchResults([]);
    
    // Regenerate persona with new entities
    generatePersona(updatedEntities);
  };

  const removeEntity = (entityId: string) => {
    const updatedEntities = selectedEntities.filter(e => e.entity_id !== entityId);
    setSelectedEntities(updatedEntities);
    localStorage.setItem('foundEntities', JSON.stringify(updatedEntities));
    
    if (updatedEntities.length === 0) {
      // Clear all data if no entities left
      setAnalysisData(null);
      setInsightsData({});
      setPersonaSummary('');
    }
  };

  const regenerateInsights = async () => {
    if (analysisData?.tags) {
      await generateInsights(analysisData.tags);
    }
  };

  const InsightCarousel: React.FC<{ title: string; icon: React.ReactNode; items: any[]; type: string }> = ({ title, icon, items, type }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 3;
    const maxIndex = Math.max(0, items.length - itemsPerView);

    const nextSlide = () => {
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
              {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 bg-white/80 rounded-lg shadow-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 bg-white/80 rounded-lg shadow-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: -currentIndex * (100 / itemsPerView) + '%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.entity_id || index}
                className="flex-shrink-0 w-1/3 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                whileHover={{ y: -5 }}
              >
                {item.properties?.image?.url && (
                  <img
                    src={item.properties.image.url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags?.slice(0, 3).map((tag: any, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                  Add to My World
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  };
      
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!selectedEntities || selectedEntities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No persona data found</h2>
          <p className="text-gray-600 mb-8">Please start by building your persona on the homepage.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Build My Persona
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100">
      {/* Header */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Your Cultural Persona</h1>
            <p className="text-xl text-gray-600">Discover the story behind your tastes</p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center gap-4 mb-12"
          >
            <button
              onClick={regenerateInsights}
              disabled={loadingInsights}
              className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-md rounded-xl font-semibold text-gray-700 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loadingInsights ? 'animate-spin' : ''}`} />
              Regenerate Insights
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              <Download className="h-5 w-5" />
              Export as PDF
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              <Share2 className="h-5 w-5" />
              Share My Cultural DNA
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* 1. Selected Identity Cards */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Selected Identities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedEntities.map((entity, index) => (
              <motion.div
                key={entity.entity_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <button
                  onClick={() => removeEntity(entity.entity_id)}
                  className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                  {entity.properties?.image?.url ? (
                    <img
                      src={entity.properties.image.url}
                      alt={entity.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                      {entity.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{entity.name}</h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full font-medium">
                      {entity.types?.[0]?.replace('urn:entity:', '') || entity.type?.replace('urn:entity:', '') || 'Entity'}
                    </span>
                  </div>
                </div>
                
                {entity.disambiguation && (
                  <p className="text-gray-600 text-sm mb-3">{entity.disambiguation}</p>
                )}
                
                {entity.popularity && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${entity.popularity * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{Math.round(entity.popularity * 100)}%</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Add More Entities Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">➕ Add More to Your Identity</h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleEntitySearch(e.target.value);
                }}
                onFocus={() => searchInput && setShowSuggestions(true)}
                placeholder="Search for more artists, movies, books, places..."
                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-md border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-lg"
              />
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && (searchResults.length > 0 || searching) && (
              <div className="absolute z-50 w-full max-w-2xl mt-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-3">Searching cultural entities...</p>
                  </div>
                ) : (
                  searchResults.map((entity, index) => (
                    <button
                      key={entity.entity_id || index}
                      onClick={() => handleAddEntity(entity)}
                      disabled={selectedEntities.find(e => e.entity_id === entity.entity_id)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4">
                        {entity.properties?.image?.url ? (
                          <img 
                            src={entity.properties.image.url} 
                            alt={entity.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-gray-200">
                            <span className="text-white font-bold text-lg">
                              {entity.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-gray-800 font-semibold text-lg">{entity.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full border border-purple-200">
                              {entity.types?.[0]?.replace('urn:entity:', '') || entity.type?.replace('urn:entity:', '') || 'Entity'}
                            </span>
                            {entity.popularity && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-gray-600 text-sm">
                                  {Math.round(entity.popularity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                          {entity.disambiguation && (
                            <p className="text-gray-600 text-sm mt-1">
                              {entity.disambiguation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {selectedEntities.find(e => e.entity_id === entity.entity_id) ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Plus className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            
            <p className="text-center text-gray-600 mt-4">
              Add more interests to refine your cultural persona and discover new recommendations
            </p>
          </div>
        </motion.section>

        {/* 2. Taste Graph Summary */}
        {analysisData && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🧬 Your Taste Graph</h2>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 mb-6">
                  Based on your interests, you're most aligned with themes like...
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {analysisData.tags?.slice(0, 6).map((tag: any, index: number) => (
                    <motion.div
                      key={tag.tag_id || tag.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative"
                    >
                      <div
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
                        style={{
                          fontSize: `${1 + (tag.affinity || 0.5) * 0.5}rem`,
                          opacity: 0.7 + (tag.affinity || 0.5) * 0.3
                        }}
                      >
                        {tag.name}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round((tag.affinity || 0.5) * 100)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* 3. Discoveries Based on Your Taste */}
        {Object.keys(insightsData).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">🔍 Discoveries Based on Your Taste</h2>
            
            {loadingInsights ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Discovering your perfect matches...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <InsightCarousel
                  title="📍 Places to Travel Based on Your Taste"
                  icon={<MapPin className="h-6 w-6" />}
                  items={insightsData.places || []}
                  type="places"
                />
                <InsightCarousel
                  title="🎬 Movies You Might Love"
                  icon={<Film className="h-6 w-6" />}
                  items={insightsData.movies || []}
                  type="movies"
                />
                <InsightCarousel
                  title="🎤 Artists to Explore"
                  icon={<Music className="h-6 w-6" />}
                  items={insightsData.artists || []}
                  type="artists"
                />
                <InsightCarousel
                  title="📚 Books in Your Vibe"
                  icon={<BookOpen className="h-6 w-6" />}
                  items={insightsData.books || []}
                  type="books"
                />
              </div>
            )}
          </motion.section>
        )}

        {/* 3.5. Target Audience Explorer */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🎯 Target Audience Explorer</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Discover and select audience segments that match your cultural profile
          </p>
          
          {/* Selected Audiences Pills */}
          {selectedAudiences.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Audiences ({selectedAudiences.length})</h3>
              <div className="flex flex-wrap gap-3">
                {selectedAudiences.map((audience) => (
                  <div
                    key={audience.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-lg"
                  >
                    <span>{audience.name}</span>
                    <button
                      onClick={() => removeSelectedAudience(audience.id)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Audience Type Categories */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Audience Category</h3>
            {loadingAudienceTypes ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Loading audience categories...</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {audienceTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleAudienceTypeSelect(type.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                      selectedAudienceType === type.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/90 text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{type.name}</div>
                      {type.description && (
                        <div className="text-xs opacity-80 mt-1">{type.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Available Audiences */}
          {selectedAudienceType && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Available Audiences - {audienceTypes.find(t => t.id === selectedAudienceType)?.name}
              </h3>
              
              {loadingAudiences ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600">Finding matching audiences...</p>
                </div>
              ) : availableAudiences.length === 0 ? (
                <div className="text-center py-12 bg-white/90 backdrop-blur-md rounded-2xl">
                  <div className="text-6xl mb-4">🔍</div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">No matching audiences found</h4>
                  <p className="text-gray-600">Try another category or tag to discover relevant audiences.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableAudiences.map((audience, index) => (
                    <motion.div
                      key={audience.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleAudienceSelect(audience)}
                      className={`bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                        isAudienceSelected(audience.id)
                          ? 'border-blue-500 bg-blue-50/90'
                          : 'border-transparent hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">{audience.name}</h4>
                          {audience.description && (
                            <p className="text-gray-600 text-sm mb-3">{audience.description}</p>
                          )}
                        </div>
                        {isAudienceSelected(audience.id) && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Popularity Bar */}
                      {audience.popularity !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Popularity</span>
                            <span className="text-sm text-gray-600">
                              {getPopularityLabel(audience.popularity)} ({Math.round(audience.popularity * 100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${audience.popularity * 100}%` }}
                              transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                              className={`h-full bg-gradient-to-r ${getPopularityColor(audience.popularity)} rounded-full`}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {audience.tags && audience.tags.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 mb-2 block">Tags</span>
                          <div className="flex flex-wrap gap-2">
                            {audience.tags.slice(0, 3).map((tag: any, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full font-medium"
                              >
                                {tag.name || tag}
                              </span>
                            ))}
                            {audience.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{audience.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Selection indicator */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className={`text-center text-sm font-medium ${
                          isAudienceSelected(audience.id) ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {isAudienceSelected(audience.id) ? '✓ Selected' : 'Click to select'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Summary */}
          {selectedAudiences.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                🎯 Audience Selection Summary
              </h4>
              <p className="text-gray-600 mb-4">
                You've selected {selectedAudiences.length} audience segment{selectedAudiences.length !== 1 ? 's' : ''} 
                that align with your cultural profile. These will be used to personalize your content recommendations.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    if (analysisData?.tags) {
                     const button = event.target as HTMLButtonElement;
                     const originalText = button.textContent;
                     const originalStyle = button.style.cssText;
                     
                     button.textContent = '✓ Applied!';
                     button.style.cssText = 'background: linear-gradient(to right, #10b981, #059669) !important; color: white !important;';
                     button.disabled = true;
                     
                      await generateInsights(analysisData.tags);
                     
                     setTimeout(() => {
                       button.textContent = originalText;
                       button.style.cssText = originalStyle;
                       button.disabled = false;
                     }, 2000);
                    }
                  }}
                  disabled={loadingInsights}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loadingInsights ? 'Applying...' : 'Apply to Insights'}
                </button>
                <button 
                  onClick={() => setSelectedAudiences([])}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-300"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* 4. Persona Summary */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🎭 Your Cultural Identity</h2>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">AI-Generated Summary</h3>
              {loadingSummary && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Brain className="h-5 w-5 text-purple-500" />
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none"
            >
              <p className="text-gray-700 leading-relaxed text-lg">
                {personaSummary}
                {loadingSummary && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 bg-purple-500 ml-1"
                  />
                )}
              </p>
            </motion.div>

            {!loadingSummary && personaSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl"
              >
                <p className="text-purple-700 text-sm font-medium">
                  ✨ This analysis was generated using AI based on your cultural preferences and taste patterns.
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PersonaPage;