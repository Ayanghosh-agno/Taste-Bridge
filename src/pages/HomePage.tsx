import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Users, X, Star, Plus } from 'lucide-react';
import { qlooService } from '../services/qloo';

const HomePage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  const entityTypes = [
    { 
      value: 'urn:entity:actor', 
      label: 'Actors', 
      icon: '🎭', 
      color: 'from-red-500 to-pink-500',
      description: 'Movie & TV stars',
      category: 'Entertainment'
    },
    { 
      value: 'urn:entity:album', 
      label: 'Albums', 
      icon: '💿', 
      color: 'from-purple-500 to-indigo-500',
      description: 'Music collections',
      category: 'Music'
    },
    { 
      value: 'urn:entity:artist', 
      label: 'Artists', 
      icon: '🎤', 
      color: 'from-pink-500 to-rose-500',
      description: 'Musicians & performers',
      category: 'Music'
    },
    { 
      value: 'urn:entity:author', 
      label: 'Authors', 
      icon: '✍️', 
      color: 'from-amber-500 to-orange-500',
      description: 'Writers & poets',
      category: 'Literature'
    },
    { 
      value: 'urn:entity:book', 
      label: 'Books', 
      icon: '📚', 
      color: 'from-emerald-500 to-teal-500',
      description: 'Novels & non-fiction',
      category: 'Literature'
    },
    { 
      value: 'urn:entity:brand', 
      label: 'Brands', 
      icon: '🏷️', 
      color: 'from-blue-500 to-cyan-500',
      description: 'Companies & products',
      category: 'Lifestyle'
    },
    { 
      value: 'urn:entity:destination', 
      label: 'Destinations', 
      icon: '🏝️', 
      color: 'from-teal-500 to-green-500',
      description: 'Travel hotspots',
      category: 'Travel'
    },
    { 
      value: 'urn:entity:director', 
      label: 'Directors', 
      icon: '🎬', 
      color: 'from-violet-500 to-purple-500',
      description: 'Film creators',
      category: 'Entertainment'
    },
    { 
      value: 'urn:entity:locality', 
      label: 'Localities', 
      icon: '🏘️', 
      color: 'from-slate-500 to-gray-500',
      description: 'Neighborhoods',
      category: 'Travel'
    },
    { 
      value: 'urn:entity:movie', 
      label: 'Movies', 
      icon: '🎬', 
      color: 'from-red-500 to-orange-500',
      description: 'Films & cinema',
      category: 'Entertainment'
    },
    { 
      value: 'urn:entity:person', 
      label: 'People', 
      icon: '👤', 
      color: 'from-indigo-500 to-blue-500',
      description: 'Public figures',
      category: 'Culture'
    },
    { 
      value: 'urn:entity:place', 
      label: 'Places', 
      icon: '📍', 
      color: 'from-green-500 to-emerald-500',
      description: 'Cities & landmarks',
      category: 'Travel'
    },
    { 
      value: 'urn:entity:podcast', 
      label: 'Podcasts', 
      icon: '🎙️', 
      color: 'from-orange-500 to-red-500',
      description: 'Audio shows',
      category: 'Media'
    },
    { 
      value: 'urn:entity:tv_show', 
      label: 'TV Shows', 
      icon: '📺', 
      color: 'from-cyan-500 to-blue-500',
      description: 'Series & programs',
      category: 'Entertainment'
    },
    { 
      value: 'urn:entity:videogame', 
      label: 'Video Games', 
      icon: '🎮', 
      color: 'from-purple-500 to-pink-500',
      description: 'Gaming titles',
      category: 'Gaming'
    }
  ];

  const categories = [
    { name: 'Entertainment', icon: '🎭', color: 'from-red-500 to-pink-500' },
    { name: 'Music', icon: '🎵', color: 'from-purple-500 to-pink-500' },
    { name: 'Literature', icon: '📖', color: 'from-amber-500 to-orange-500' },
    { name: 'Travel', icon: '✈️', color: 'from-teal-500 to-green-500' },
    { name: 'Lifestyle', icon: '🌟', color: 'from-blue-500 to-cyan-500' },
    { name: 'Culture', icon: '🎨', color: 'from-indigo-500 to-blue-500' },
    { name: 'Media', icon: '📻', color: 'from-orange-500 to-red-500' },
    { name: 'Gaming', icon: '🎮', color: 'from-purple-500 to-pink-500' }
  ];

  const [viewMode, setViewMode] = useState<'categories' | 'types'>('categories');

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
    
    // Auto-select entity types in this category
    const categoryTypes = entityTypes
      .filter(type => type.category === categoryName)
      .map(type => type.value);
    
    if (selectedCategories.includes(categoryName)) {
      // Remove category types
      setSelectedEntityTypes(prev => prev.filter(type => !categoryTypes.includes(type)));
    } else {
      // Add category types
      setSelectedEntityTypes(prev => [...new Set([...prev, ...categoryTypes])]);
    }
  };

  const toggleEntityType = (entityType: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(entityType) 
        ? prev.filter(type => type !== entityType)
        : [...prev, entityType]
    );
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
      // Filter search by selected entity types
      const results = await qlooService.searchEntities(query, 8);
      // Filter results by selected entity types if any are selected
      const filteredResults = selectedEntityTypes.length > 0 
        ? results.filter(entity => 
            selectedEntityTypes.some(type => 
              entity.type === type || entity.types?.includes(type)
            )
          )
        : results;
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching entities:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleEntitySelect = (entity: any) => {
    // Check if entity is already selected
    if (selectedEntities.find(e => e.entity_id === entity.entity_id)) {
      return;
    }
    
    // Auto-tick the category based on the selected entity
    const entityType = entity.type || entity.types?.[0];
    if (entityType) {
      const matchingEntityType = entityTypes.find(type => type.value === entityType);
      if (matchingEntityType && matchingEntityType.category) {
        // Add the category if not already selected
        setSelectedCategories(prev => 
          prev.includes(matchingEntityType.category) 
            ? prev 
            : [...prev, matchingEntityType.category]
        );
        
        // Add the entity type if not already selected
        setSelectedEntityTypes(prev => 
          prev.includes(entityType) 
            ? prev 
            : [...prev, entityType]
        );
      }
    }
    
    setSelectedEntities(prev => [...prev, entity]);
    setSearchInput('');
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const removeEntity = (entityId: string) => {
    setSelectedEntities(prev => prev.filter(e => e.entity_id !== entityId));
  };

  const handleBuildPersona = async () => {
    if (selectedEntities.length > 0) {
      setIsSearching(true);
      try {
        console.log('Selected entities:', selectedEntities);
        
        // Store selected entities and create a taste string from their names
        const tasteString = selectedEntities.map(e => e.name).join(', ');
        localStorage.setItem('userTastes', tasteString);
        localStorage.setItem('foundEntities', JSON.stringify(selectedEntities));
        
        navigate('/persona');
      } catch (error) {
        console.error('Error searching entities:', error);
        // Navigate with selected entities as fallback
        const tasteString = selectedEntities.map(e => e.name).join(', ');
        localStorage.setItem('userTastes', tasteString);
        localStorage.setItem('foundEntities', JSON.stringify(selectedEntities));
        navigate('/persona');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI-Powered Analysis',
      description: 'Discover your cultural DNA with advanced AI insights'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Taste Trends',
      description: 'Explore trending cultural movements and preferences'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Audience Matching',
      description: 'Find your cultural tribe and taste overlaps'
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Understand Taste.
            </span>
            <br />
            <span className="text-white">Discover Culture.</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Build your cultural persona, explore taste trends, and discover your place in the global cultural landscape
          </p>

          {/* Search Input */}
          {/* Entity Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="text-center mb-6">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-md border border-gray-600/50 rounded-3xl text-white hover:from-gray-700/70 hover:to-gray-600/70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <div className="relative">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🎯</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Customize Your Discovery</div>
                  <div className="text-sm text-gray-300">Choose what you want to explore</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 text-sm rounded-full border border-purple-400/30 font-medium">
                    {selectedEntityTypes.length} selected
                  </span>
                  <motion.div
                    animate={{ rotate: showTypeSelector ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-purple-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </button>
            </div>
            
            {showTypeSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 mb-6 shadow-2xl"
              >
                {/* View Mode Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-700/50 rounded-2xl p-1 border border-gray-600/30">
                    <button
                      onClick={() => setViewMode('categories')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        viewMode === 'categories'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      🎨 By Categories
                    </button>
                    <button
                      onClick={() => setViewMode('types')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        viewMode === 'types'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      🔍 Individual Types
                    </button>
                  </div>
                </div>

                {viewMode === 'categories' ? (
                  /* Category View */
                  <div>
                    <h3 className="text-white font-bold text-xl mb-6 text-center">
                      🌟 Choose Your Interest Categories
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {categories.map((category, index) => {
                        const isSelected = selectedCategories.includes(category.name);
                        const typeCount = entityTypes.filter(type => type.category === category.name).length;
                        
                        return (
                          <motion.button
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() => toggleCategory(category.name)}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-xl shadow-purple-500/25'
                                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-600/40'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <span className="text-white text-sm font-bold">✓</span>
                              </motion.div>
                            )}
                            
                            <div className="text-center">
                              <motion.div 
                                className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200"
                                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.5 }}
                              >
                                {category.icon}
                              </motion.div>
                              <div className={`font-bold text-lg mb-1 ${
                                isSelected ? 'text-purple-200' : 'text-white'
                              }`}>
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {typeCount} type{typeCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                            
                            {/* Animated background */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                               className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-10 rounded-2xl -z-10`}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {/* Selected Categories Summary */}
                    {selectedCategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl p-4 mb-6"
                      >
                        <div className="text-center">
                          <div className="text-purple-200 font-semibold mb-2">
                            🎯 Active Categories: {selectedCategories.join(', ')}
                          </div>
                          <div className="text-sm text-gray-300">
                            Including {selectedEntityTypes.length} specific types for personalized discovery
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* Individual Types View */
                  <div>
                    <h3 className="text-white font-bold text-xl mb-6 text-center">
                      🔍 Fine-tune Your Content Types
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                      {entityTypes.map((entityType, index) => {
                        const isSelected = selectedEntityTypes.includes(entityType.value);
                        
                        return (
                          <motion.button
                            key={entityType.value}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            onClick={() => toggleEntityType(entityType.value)}
                            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                              isSelected
                                ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <span className="text-white text-xs">✓</span>
                              </motion.div>
                            )}
                            <div className="text-center">
                              <div className="text-2xl mb-2">{entityType.icon}</div>
                              <div className={`text-sm font-medium mb-1 ${
                                isSelected ? 'text-purple-300' : 'text-gray-300'
                              }`}>
                                {entityType.label}
                              </div>
                              <div className="text-xs text-gray-400">
                                {entityType.description}
                              </div>
                            </div>
                            
                            {/* Animated background gradient */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                               className={`absolute inset-0 bg-gradient-to-r ${entityType.color} opacity-10 rounded-xl -z-10`}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Control Buttons */}
                
                {/* Status Summary */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/40 rounded-xl border border-gray-600/30">
                    <span className="text-2xl">🎯</span>
                    <span className="text-gray-300 text-sm">
                      {selectedEntityTypes.length === 0 
                        ? "Select types to customize your discovery experience" 
                        : `Discovering across ${selectedEntityTypes.length} selected type${selectedEntityTypes.length !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8 relative"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Enter your favorite artists, foods, cities, books, movies..."
                onFocus={() => searchInput && setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (searchResults.length > 0 || searching) && (
              <div className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-3">Searching cultural entities...</p>
                  </div>
                ) : (
                  searchResults.map((entity, index) => (
                    <button
                      key={entity.entity_id || index}
                      onClick={() => handleEntitySelect(entity)}
                      disabled={selectedEntities.find(e => e.entity_id === entity.entity_id)}
                      className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/50 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4">
                        {entity.properties?.image?.url ? (
                          <img 
                            src={entity.properties.image.url} 
                            alt={entity.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600">
                            <span className="text-white font-bold text-lg">
                              {entity.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-lg">{entity.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-400/30">
                              {entity.types?.[0]?.replace('urn:entity:', '') || entity.type?.replace('urn:entity:', '') || 'Entity'}
                            </span>
                            {entity.popularity && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-gray-400 text-sm">
                                  {Math.round(entity.popularity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                          {entity.disambiguation && (
                            <p className="text-gray-400 text-sm mt-1">
                              {entity.disambiguation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Plus className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>

        </motion.div>

        {/* Selected Entities */}
        {selectedEntities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Selected Preferences ({selectedEntities.length})
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {selectedEntities.map((entity, index) => (
                <motion.div
                  key={entity.entity_id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl hover:border-purple-400/50 transition-all duration-200"
                >
                  {entity.properties?.image?.url && (
                    <img 
                      src={entity.properties.image.url} 
                      alt={entity.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <span className="text-white font-medium">{entity.name}</span>
                  <button
                    onClick={() => removeEntity(entity.entity_id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        {selectedEntities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <button
              onClick={handleBuildPersona}
              disabled={selectedEntities.length === 0 || isSearching}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl font-semibold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-orange-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {isSearching ? 'Analyzing...' : 'Build My Persona'}
              </span>
            </button>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 py-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="group p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Cultural Map Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex justify-center pb-20"
        >
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full relative z-10"
            >
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#mapGradient)" strokeWidth="2" opacity="0.6" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="url(#mapGradient)" strokeWidth="1.5" opacity="0.4" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="url(#mapGradient)" strokeWidth="1" opacity="0.3" />
              <circle cx="100" cy="100" r="4" fill="url(#mapGradient)" />
              <circle cx="80" cy="80" r="3" fill="#A855F7" opacity="0.8" />
              <circle cx="120" cy="70" r="2.5" fill="#F97316" opacity="0.7" />
              <circle cx="130" cy="130" r="3.5" fill="#A855F7" opacity="0.6" />
              <circle cx="70" cy="140" r="2" fill="#F97316" opacity="0.8" />
              <circle cx="60" cy="110" r="2.5" fill="#A855F7" opacity="0.7" />
              <circle cx="140" cy="90" r="2" fill="#F97316" opacity="0.6" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;