import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, BarChart3, Search, X, Star } from 'lucide-react';
import { qlooService } from '../services/qloo';
import { togetherService, formatMarkdown } from '../services/together';

const ComparePage: React.FC = () => {
  const [profile1, setProfile1] = useState('');
  const [profile2, setProfile2] = useState('');
  const [selectedEntity1, setSelectedEntity1] = useState<any>(null);
  const [selectedEntity2, setSelectedEntity2] = useState<any>(null);
  const [searchResults1, setSearchResults1] = useState<any[]>([]);
  const [searchResults2, setSearchResults2] = useState<any[]>([]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);

  const handleSearch = async (query: string, profileNumber: 1 | 2) => {
    if (!query.trim()) {
      if (profileNumber === 1) {
        setSearchResults1([]);
        setShowSuggestions1(false);
      } else {
        setSearchResults2([]);
        setShowSuggestions2(false);
      }
      return;
    }

    if (profileNumber === 1) {
      setSearching1(true);
      setShowSuggestions1(true);
    } else {
      setSearching2(true);
      setShowSuggestions2(true);
    }

    try {
      const results = await qlooService.searchEntities(query, 8);
      if (profileNumber === 1) {
        setSearchResults1(results);
      } else {
        setSearchResults2(results);
      }
    } catch (error) {
      console.error('Error searching entities:', error);
    } finally {
      if (profileNumber === 1) {
        setSearching1(false);
      } else {
        setSearching2(false);
      }
    }
  };

  const handleEntitySelect = (entity: any, profileNumber: 1 | 2) => {
    if (profileNumber === 1) {
      setSelectedEntity1(entity);
      setProfile1(entity.name);
      setShowSuggestions1(false);
      setSearchResults1([]);
    } else {
      setSelectedEntity2(entity);
      setProfile2(entity.name);
      setShowSuggestions2(false);
      setSearchResults2([]);
    }
  };

  const clearSelection = (profileNumber: 1 | 2) => {
    if (profileNumber === 1) {
      setSelectedEntity1(null);
      setProfile1('');
      setSearchResults1([]);
      setShowSuggestions1(false);
    } else {
      setSelectedEntity2(null);
      setProfile2('');
      setSearchResults2([]);
      setShowSuggestions2(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedEntity1 || !selectedEntity2) return;
    
    setLoading(true);
    try {
      const entityIds1 = [selectedEntity1.entity_id];
      const entityIds2 = [selectedEntity2.entity_id];
      
      // Compare the profiles using Qloo API
      const comparison = await qlooService.compareEntities(entityIds1, entityIds2);
      
      setComparisonData(comparison);
      
      // Generate AI analysis after comparison is complete
      await generateAIAnalysis(comparison);
    } catch (error) {
      console.error('Error comparing profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async (comparison: any) => {
    setGeneratingAnalysis(true);
    try {
      const prompt = `You are a cultural anthropologist and data analyst. Based on the following cultural comparison data between two profiles, provide a comprehensive analysis:

Profile A: ${selectedEntity1?.name || 'Profile A'}
Profile B: ${selectedEntity2?.name || 'Profile B'}

Comparison Results:
- Cultural Overlap Score: ${Math.round((comparison.overlapScore || 0) * 100)}%
- Shared Preferences: ${comparison.commonTags?.length || 0} common cultural tags
- Profile A Strengths: ${comparison.profile1Stronger?.length || 0} distinctive preferences
- Profile B Strengths: ${comparison.profile2Stronger?.length || 0} distinctive preferences
- Total Cultural Tags Analyzed: ${comparison.totalTags || 0}
- Average Cultural Affinity: ${((comparison.avgAffinity || 0) * 1000).toFixed(2)}‰

Top Shared Cultural Tags: ${comparison.commonTags?.slice(0, 5).map((tag: any) => tag.name).join(', ') || 'None'}

Profile A Distinctive Tags: ${comparison.profile1Stronger?.slice(0, 3).map((tag: any) => tag.name).join(', ') || 'None'}

Profile B Distinctive Tags: ${comparison.profile2Stronger?.slice(0, 3).map((tag: any) => tag.name).join(', ') || 'None'}

Please provide:
1. A detailed cultural compatibility analysis
2. Insights into what this overlap means for shared experiences
3. Recommendations for cultural activities both profiles would enjoy
4. Analysis of how their differences could complement each other
5. Potential areas of cultural discovery for each profile

Keep the analysis engaging, insightful, and practical. Focus on cultural implications and real-world applications.`;

      const analysis = await togetherService.generateCulturalAnalysis(prompt);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setAiAnalysis('Unable to generate AI analysis at this time. Please try again later.');
    } finally {
      setGeneratingAnalysis(false);
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
          <h1 className="text-4xl font-bold text-white mb-4">Compare Cultural Personas</h1>
          <p className="text-gray-400 text-lg">Discover taste overlaps and cultural connections</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-white font-semibold mb-3">Profile 1</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={profile1}
                  onChange={(e) => {
                    setProfile1(e.target.value);
                    handleSearch(e.target.value, 1);
                  }}
                  onFocus={() => profile1 && setShowSuggestions1(true)}
                  placeholder="Search for artists, movies, books, people..."
                  className="w-full pl-12 pr-12 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {selectedEntity1 && (
                  <button
                    onClick={() => clearSelection(1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Selected Entity Display */}
              {selectedEntity1 && (
                <div className="mt-3 p-3 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedEntity1.properties?.image?.url && (
                      <img 
                        src={selectedEntity1.properties.image.url} 
                        alt={selectedEntity1.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-white font-semibold">{selectedEntity1.name}</h4>
                      <p className="text-purple-300 text-sm">{selectedEntity1.types?.[0]?.replace('urn:entity:', '') || 'Entity'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Suggestions */}
              {showSuggestions1 && (searchResults1.length > 0 || searching1) && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  {searching1 ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : (
                    searchResults1.map((entity, index) => (
                      <button
                        key={entity.entity_id || index}
                        onClick={() => handleEntitySelect(entity, 1)}
                        className="w-full p-4 text-left hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {entity.properties?.image?.url ? (
                            <img 
                              src={entity.properties.image.url} 
                              alt={entity.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
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
                            {entity.properties?.short_description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {entity.properties.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="relative">
              <label className="block text-white font-semibold mb-3">Profile 2</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={profile2}
                  onChange={(e) => {
                    setProfile2(e.target.value);
                    handleSearch(e.target.value, 2);
                  }}
                  onFocus={() => profile2 && setShowSuggestions2(true)}
                  placeholder="Search for artists, movies, books, people..."
                  className="w-full pl-12 pr-12 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {selectedEntity2 && (
                  <button
                    onClick={() => clearSelection(2)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Selected Entity Display */}
              {selectedEntity2 && (
                <div className="mt-3 p-3 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedEntity2.properties?.image?.url && (
                      <img 
                        src={selectedEntity2.properties.image.url} 
                        alt={selectedEntity2.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-white font-semibold">{selectedEntity2.name}</h4>
                      <p className="text-purple-300 text-sm">{selectedEntity2.types?.[0]?.replace('urn:entity:', '') || 'Entity'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Suggestions */}
              {showSuggestions2 && (searchResults2.length > 0 || searching2) && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  {searching2 ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : (
                    searchResults2.map((entity, index) => (
                      <button
                        key={entity.entity_id || index}
                        onClick={() => handleEntitySelect(entity, 2)}
                        className="w-full p-4 text-left hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {entity.properties?.image?.url ? (
                            <img 
                              src={entity.properties.image.url} 
                              alt={entity.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
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
                            {entity.properties?.short_description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {entity.properties.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={handleCompare}
              disabled={!selectedEntity1 || !selectedEntity2 || loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Comparing...' : 'Compare Profiles'}
            </button>
          </div>
        </motion.div>

        {/* Comparison Results */}
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Overlap Score */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Zap className="h-6 w-6 text-purple-400 mr-3" />
                <h3 className="text-2xl font-semibold text-white">Cultural Overlap</h3>
              </div>
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-32 h-32 mx-auto mb-6"
                >
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: comparisonData.overlapScore }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      style={{
                        strokeDasharray: `${2 * Math.PI * 56}`,
                        strokeDashoffset: `${2 * Math.PI * 56 * (1 - comparisonData.overlapScore)}`
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#F97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {Math.round(comparisonData.overlapScore * 100)}%
                    </span>
                  </div>
                </motion.div>
                
                <p className="text-gray-400 text-lg">
                  These profiles share {Math.round(comparisonData.overlapScore * 100)}% cultural overlap
                </p>
              </div>
            </div>

            {/* Common Tags */}
            <div className="space-y-8">
              {/* Top Shared Preferences */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <BarChart3 className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-2xl font-semibold text-white">Shared Preferences</h3>
                  <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                    {comparisonData.commonTags?.length || 0} tags
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {comparisonData.commonTags && comparisonData.commonTags.length > 0 ? comparisonData.commonTags.map((tag: any, index: number) => (
                    <motion.div
                      key={tag.tag_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 bg-green-500/10 border border-green-400/20 rounded-xl hover:bg-green-500/20 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-green-300 font-semibold">{tag.name}</h4>
                        <span className="text-green-400 text-sm">
                          {(tag.combinedAffinity * 1000).toFixed(1)}‰
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-600/20 text-green-200 text-xs rounded-full">
                          {tag.subtype?.replace('urn:tag:', '').replace(':place', '') || 'tag'}
                        </span>
                        <span className="text-green-400 text-xs">
                          Δ {tag.delta.toFixed(1)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-300 text-xs w-12">A:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                            <div 
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${Math.min((tag.aAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-12">
                            {(tag.aAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-300 text-xs w-12">B:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                            <div 
                              className="h-full bg-orange-400 rounded-full"
                              style={{ width: `${Math.min((tag.bAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-12">
                            {(tag.bAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-2 text-gray-400 text-center py-8">
                      No strong shared interests found. These profiles have distinct preferences.
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Strengths Comparison */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Profile 1 Stronger */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <Users className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      {selectedEntity1?.name || 'Profile A'} Strengths
                    </h3>
                    <span className="ml-3 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                      {comparisonData.profile1Stronger?.length || 0} tags
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {comparisonData.profile1Stronger && comparisonData.profile1Stronger.length > 0 ? comparisonData.profile1Stronger.map((tag: any, index: number) => (
                      <motion.div
                        key={tag.tag_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-3 bg-purple-500/10 border border-purple-400/20 rounded-lg hover:bg-purple-500/20 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-purple-300 font-medium">{tag.name}</h4>
                          <span className="text-purple-400 text-sm">
                            {(tag.aAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-200 text-xs rounded-full">
                            {tag.subtype?.replace('urn:tag:', '').replace(':place', '') || 'tag'}
                          </span>
                          <span className="text-purple-400 text-xs">
                            Δ {tag.delta.toFixed(1)}
                          </span>
                        </div>
                      </motion.div>
                    )) : (
                      <p className="text-gray-400 text-center py-8">
                        No distinctive preferences found for this profile.
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile 2 Stronger */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <Users className="h-6 w-6 text-orange-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      {selectedEntity2?.name || 'Profile B'} Strengths
                    </h3>
                    <span className="ml-3 px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full">
                      {comparisonData.profile2Stronger?.length || 0} tags
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {comparisonData.profile2Stronger && comparisonData.profile2Stronger.length > 0 ? comparisonData.profile2Stronger.map((tag: any, index: number) => (
                      <motion.div
                        key={tag.tag_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-3 bg-orange-500/10 border border-orange-400/20 rounded-lg hover:bg-orange-500/20 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-orange-300 font-medium">{tag.name}</h4>
                          <span className="text-orange-400 text-sm">
                            {(tag.bAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-600/20 text-orange-200 text-xs rounded-full">
                            {tag.subtype?.replace('urn:tag:', '').replace(':place', '') || 'tag'}
                          </span>
                          <span className="text-orange-400 text-xs">
                            Δ {tag.delta.toFixed(1)}
                          </span>
                        </div>
                      </motion.div>
                    )) : (
                      <p className="text-gray-400 text-center py-8">
                        No distinctive preferences found for this profile.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Preferences */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Star className="h-6 w-6 text-yellow-400 mr-3" />
                  <h3 className="text-2xl font-semibold text-white">Top Mutual Preferences</h3>
                  <span className="ml-3 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                    {comparisonData.topTags?.length || 0} high-affinity tags
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonData.topTags && comparisonData.topTags.length > 0 ? comparisonData.topTags.map((tag: any, index: number) => (
                    <motion.div
                      key={tag.tag_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-xl hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-yellow-300 font-semibold">{tag.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">
                            {(tag.combinedAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-300 text-xs">A:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${Math.min((tag.aAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs">
                            {(tag.aAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-300 text-xs">B:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div 
                              className="h-full bg-orange-400 rounded-full"
                              style={{ width: `${Math.min((tag.bAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs">
                            {(tag.bAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full text-gray-400 text-center py-8">
                      No high-affinity shared preferences found.
                    </div>
                  )}
                </div>
              </div>

              {/* Tags by Category */}
              {comparisonData.tagsByCategory && Object.keys(comparisonData.tagsByCategory).length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <BarChart3 className="h-6 w-6 text-blue-400 mr-3" />
                    <h3 className="text-2xl font-semibold text-white">Preferences by Category</h3>
                    <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                      {Object.keys(comparisonData.tagsByCategory).length} categories
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {Object.entries(comparisonData.tagsByCategory).slice(0, 6).map(([category, tags]: [string, any], categoryIndex: number) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                        className="p-4 bg-blue-500/5 border border-blue-400/10 rounded-xl"
                      >
                        <h4 className="text-blue-300 font-semibold mb-3 capitalize flex items-center gap-2">
                          {category.replace('_', ' ')}
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full">
                            {tags.length} tags
                          </span>
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tags.slice(0, 6).map((tag: any, index: number) => (
                            <div
                              key={tag.tag_id}
                              className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm font-medium">{tag.name}</span>
                                <span className="text-blue-400 text-xs">
                                  {(tag.combinedAffinity * 1000).toFixed(1)}‰
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-purple-300">A: {(tag.aAffinity * 1000).toFixed(1)}‰</span>
                                <span className="text-orange-300">B: {(tag.bAffinity * 1000).toFixed(1)}‰</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {tags.length > 6 && (
                          <p className="text-gray-400 text-sm mt-3">
                            +{tags.length - 6} more {category.replace('_', ' ')} tags
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Tag Analysis */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-2xl font-semibold text-white">Complete Analysis</h3>
                    <span className="ml-3 px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full">
                      {comparisonData.totalTags || 0} total tags
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Average Affinity</div>
                    <div className="text-lg font-bold text-white">
                      {((comparisonData.avgAffinity || 0) * 1000).toFixed(2)}‰
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {comparisonData.allTags && comparisonData.allTags.slice(0, 20).map((tag: any, index: number) => (
                    <motion.div
                      key={tag.tag_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{tag.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                            {tag.subtype?.replace('urn:tag:', '').replace(':place', '') || 'tag'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Δ {tag.delta.toFixed(2)}
                          </span>
                          <span className="text-white font-bold">
                            {(tag.combinedAffinity * 1000).toFixed(1)}‰
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-300 text-sm w-20">{selectedEntity1?.name || 'Profile A'}:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((tag.aAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-16">
                            {(tag.aAffinity * 1000).toFixed(2)}‰
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-orange-300 text-sm w-20">{selectedEntity2?.name || 'Profile B'}:</span>
                          <div className="flex-1 bg-gray-600 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((tag.bAffinity / 0.006) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-16">
                            {(tag.bAffinity * 1000).toFixed(2)}‰
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {comparisonData.allTags && comparisonData.allTags.length > 20 && (
                  <div className="text-center mt-4">
                    <span className="text-gray-400 text-sm">
                      Showing top 20 of {comparisonData.allTags.length} analyzed tags
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Summary - Updated */}
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-purple-400 mr-3" />
                <h3 className="text-2xl font-semibold text-white">AI Cultural Analysis</h3>
                {generatingAnalysis && (
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-3"
                  >
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}
              </div>
              
              {generatingAnalysis ? (
                <div className="text-center py-8">
                  <div className="text-gray-300 mb-4">Generating comprehensive cultural analysis...</div>
                  <div className="text-sm text-gray-400">This may take a few moments</div>
                </div>
              ) : aiAnalysis ? (
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
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(aiAnalysis) }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-700/20 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{comparisonData.totalTags || 0}</div>
                      <div className="text-gray-400 text-sm">Total Tags Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{comparisonData.commonTags?.length || 0}</div>
                      <div className="text-gray-400 text-sm">Shared Preferences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Object.keys(comparisonData.tagsByCategory || {}).length}
                      </div>
                      <div className="text-gray-400 text-sm">Categories Covered</div>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-400/20 rounded-xl"
                  >
                    <p className="text-purple-300 text-sm font-medium">
                      ✨ This analysis was generated using Google Gemma AI based on cultural comparison data from Qloo.
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {comparisonData.overlapScore > 0.7 
                      ? `These profiles show exceptional cultural alignment (${Math.round(comparisonData.overlapScore * 100)}% compatibility), indicating very similar taste preferences and strong potential for shared experiences.`
                      : comparisonData.overlapScore > 0.4
                      ? `These profiles demonstrate moderate cultural compatibility (${Math.round(comparisonData.overlapScore * 100)}% compatibility), with meaningful overlap in preferences.`
                      : `These profiles show distinct cultural preferences (${Math.round(comparisonData.overlapScore * 100)}% compatibility), offering opportunities for diverse cultural discovery.`
                    }
                  </p>
                  
                  {comparisonData.commonTags && comparisonData.commonTags.length > 0 && (
                    <p className="text-purple-300">
                      <strong>Key shared interests:</strong> {comparisonData.commonTags.slice(0, 5).map((tag: any) => tag.name).join(', ')}.
                    </p>
                  )}
                  
                  {comparisonData.topTags && comparisonData.topTags.length > 0 && (
                    <p className="text-yellow-300">
                      <strong>Top mutual preferences:</strong> {comparisonData.topTags.slice(0, 3).map((tag: any) => tag.name).join(', ')}.
                    </p>
                  )}
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-700/20 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{comparisonData.totalTags || 0}</div>
                      <div className="text-gray-400 text-sm">Total Tags Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{comparisonData.commonTags?.length || 0}</div>
                      <div className="text-gray-400 text-sm">Shared Preferences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Object.keys(comparisonData.tagsByCategory || {}).length}
                      </div>
                      <div className="text-gray-400 text-sm">Categories Covered</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;