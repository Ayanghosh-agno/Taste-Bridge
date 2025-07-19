import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Users, TrendingUp, MapPin, Book, Music, Film, Gamepad2, Coffee, Camera, Palette, Globe, ArrowLeft, Star, Tag, Brain, BarChart3, Map, Calendar, Clock, User, Heart, Target, Zap, Award, Compass, Search, Plus } from 'lucide-react';
import { qlooService } from '../services/qloo';

const PersonaPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personaData, setPersonaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any>({});
  const [loadingRecommendations, setLoadingRecommendations] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonaData = async () => {
      try {
        // Check if we have foundEntities in localStorage
        const savedEntities = localStorage.getItem('foundEntities');
        if (!savedEntities) {
          // If no entities found, redirect to home page
          console.log('No foundEntities found, redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        const foundEntities = JSON.parse(localStorage.getItem('foundEntities') || '[]');
        
        if (foundEntities.length === 0) {
          console.log('Empty foundEntities array, redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        // Get analysis data
        const entityIds = foundEntities.map((entity: any) => entity.entity_id);
        const analysisData = await qlooService.getAnalysis(entityIds);
        
        // Get insights for different categories
        const tagIds = analysisData.tags.slice(0, 5).map((tag: any) => tag.tag_id);
        
        const [places, movies, artists, books] = await Promise.all([
          qlooService.getInsightsByType('urn:entity:place', tagIds, 6),
          qlooService.getInsightsByType('urn:entity:movie', tagIds, 6),
          qlooService.getInsightsByType('urn:entity:artist', tagIds, 6),
          qlooService.getInsightsByType('urn:entity:book', tagIds, 6)
        ]);

        setPersonaData({
          entities: foundEntities,
          analysis: analysisData,
          insights: {
            places,
            movies,
            artists,
            books
          }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading persona data:', error);
        // On error, redirect to home page instead of showing error
        navigate('/', { replace: true });
        setLoading(false);
      }
    };

    loadPersonaData();
  }, [id, navigate]);

  const handleGetRecommendations = async (type: string) => {
    if (!personaData?.analysis?.tags) return;
    
    setLoadingRecommendations(type);
    try {
      const tagIds = personaData.analysis.tags.slice(0, 5).map((tag: any) => tag.tag_id);
      const recs = await qlooService.getInsightsByType(type, tagIds, 12);
      setRecommendations(prev => ({ ...prev, [type]: recs }));
    } catch (error) {
      console.error(`Error getting ${type} recommendations:`, error);
    } finally {
      setLoadingRecommendations(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">No Persona Found</h1>
            <p className="text-gray-300 mb-8">
              It looks like you haven't created your cultural persona yet. Let's start by exploring your tastes!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Start Building Your Persona
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!personaData) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">No Persona Data</h1>
          <p className="text-gray-300 mb-6">Please start by building your persona on the home page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { entities, analysis, insights } = personaData;

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          
          <h1 className="text-5xl font-bold text-white mb-4">Your Cultural Persona</h1>
          <p className="text-xl text-gray-300">Discover the story behind your tastes</p>
        </motion.div>

        {/* Selected Entities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Cultural DNA</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity: any, index: number) => (
              <motion.div
                key={entity.entity_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-4">
                  {entity.properties?.image?.url ? (
                    <img
                      src={entity.properties.image.url}
                      alt={entity.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                      {entity.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{entity.name}</h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 text-sm rounded-full">
                      {entity.types?.[0]?.replace('urn:entity:', '') || 'Entity'}
                    </span>
                  </div>
                </div>
                {entity.disambiguation && (
                  <p className="text-gray-600 text-sm">{entity.disambiguation}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Taste Analysis */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Taste Profile</h2>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600 mb-6">
                Based on your selections, you're most aligned with these cultural themes:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {analysis.tags?.slice(0, 8).map((tag: any, index: number) => (
                  <motion.div
                    key={tag.tag_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                      style={{
                        fontSize: `${0.9 + (tag.affinity || 0.5) * 0.3}rem`,
                        opacity: 0.8 + (tag.affinity || 0.5) * 0.2
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

        {/* Insights Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Discover Your World</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Places */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Places to Explore</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {insights.places?.slice(0, 4).map((place: any, index: number) => (
                  <motion.div
                    key={place.entity_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{place.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {place.tags?.slice(0, 2).map((tag: any, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => handleGetRecommendations('urn:entity:place')}
                disabled={loadingRecommendations === 'urn:entity:place'}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loadingRecommendations === 'urn:entity:place' ? 'Loading...' : 'Discover More Places'}
              </button>
            </div>

            {/* Movies */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white">
                  <Film className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Movies You'll Love</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {insights.movies?.slice(0, 4).map((movie: any, index: number) => (
                  <motion.div
                    key={movie.entity_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{movie.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {movie.tags?.slice(0, 2).map((tag: any, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => handleGetRecommendations('urn:entity:movie')}
                disabled={loadingRecommendations === 'urn:entity:movie'}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loadingRecommendations === 'urn:entity:movie' ? 'Loading...' : 'Discover More Movies'}
              </button>
            </div>

            {/* Artists */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white">
                  <Music className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Artists to Follow</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {insights.artists?.slice(0, 4).map((artist: any, index: number) => (
                  <motion.div
                    key={artist.entity_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{artist.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {artist.tags?.slice(0, 2).map((tag: any, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => handleGetRecommendations('urn:entity:artist')}
                disabled={loadingRecommendations === 'urn:entity:artist'}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loadingRecommendations === 'urn:entity:artist' ? 'Loading...' : 'Discover More Artists'}
              </button>
            </div>

            {/* Books */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                  <Book className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Books to Read</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {insights.books?.slice(0, 4).map((book: any, index: number) => (
                  <motion.div
                    key={book.entity_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{book.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {book.tags?.slice(0, 2).map((tag: any, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => handleGetRecommendations('urn:entity:book')}
                disabled={loadingRecommendations === 'urn:entity:book'}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loadingRecommendations === 'urn:entity:book' ? 'Loading...' : 'Discover More Books'}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Recommendations Display */}
        {Object.keys(recommendations).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Your Personalized Recommendations</h2>
            
            {Object.entries(recommendations).map(([type, items]: [string, any]) => (
              <div key={type} className="mb-12">
                <h3 className="text-2xl font-bold text-white mb-6 capitalize">
                  {type.replace('urn:entity:', '')} Recommendations
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item: any, index: number) => (
                    <motion.div
                      key={item.entity_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {item.properties?.image?.url && (
                        <img
                          src={item.properties.image.url}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-xl mb-4"
                        />
                      )}
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.tags?.slice(0, 3).map((tag: any, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 text-xs rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore More?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Discover new experiences that match your unique cultural profile
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Refine My Persona
              </button>
              <button
                onClick={() => window.location.href = '/explore'}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Explore More
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PersonaPage;