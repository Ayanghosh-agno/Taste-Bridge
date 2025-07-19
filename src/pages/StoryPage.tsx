import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Map, Music, Download, Copy, Home, Brain, Sparkles, Search, X, MapPin, Star, Calendar } from 'lucide-react';
import { qlooService } from '../services/qloo';

const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [audienceData, setAudienceData] = useState<any[]>([]);
  const [personaName, setPersonaName] = useState<string>('');
  const [hasPersonaData, setHasPersonaData] = useState(false);
  
  const [selectedContentType, setSelectedContentType] = useState('story');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentCache, setContentCache] = useState<{[key: string]: string}>({});
  
  // Travel plan specific states
  const [recommendedDestinations, setRecommendedDestinations] = useState<any[]>([]);
  const [searchDestinationInput, setSearchDestinationInput] = useState('');
  const [searchDestinationResults, setSearchDestinationResults] = useState<any[]>([]);
  const [selectedTravelDestination, setSelectedTravelDestination] = useState<any | null>(null);
  const [numberOfDays, setNumberOfDays] = useState(5);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchingDestinations, setSearchingDestinations] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  useEffect(() => {
    // Load content from cache when switching content types
    const cachedContent = contentCache[selectedContentType] || '';
    setGeneratedContent(cachedContent);
  }, [selectedContentType]);

  // Load cached content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('generatedContent');
    
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContentCache(parsedContent);
        // Set initial content for the current type
        setGeneratedContent(parsedContent[selectedContentType] || '');
      } catch (error) {
        console.error('Error parsing saved content:', error);
      }
    }
  }, []);

  // Save content to localStorage whenever cache changes
  useEffect(() => {
    if (Object.keys(contentCache).length > 0) {
      localStorage.setItem('generatedContent', JSON.stringify(contentCache));
    }
  }, [contentCache]);


  const contentTypes = [
    { id: 'story', label: 'Cultural Story', icon: <BookOpen className="h-5 w-5" />, title: 'Your Cultural Identity' },
    { id: 'travel', label: 'Travel Plan', icon: <Map className="h-5 w-5" />, title: 'Your Ideal Cultural Getaway' },
    { id: 'playlist', label: 'Playlist Idea', icon: <Music className="h-5 w-5" />, title: 'A Playlist That Matches Your Vibe' },
  ];

  useEffect(() => {
    checkPersonaData();
  }, []);
  
  // Fetch recommended destinations when travel plan is selected
  useEffect(() => {
    if (selectedContentType === 'travel' && hasPersonaData && selectedEntities.length > 0) {
      fetchRecommendedDestinations();
    }
  }, [selectedContentType, hasPersonaData, selectedEntities]);
  
  const fetchRecommendedDestinations = async (location?: { lat: number; lon: number }) => {
    setLoadingRecommendations(true);
    try {
      const entityIds = selectedEntities.map(entity => entity.entity_id);
      const destinations = await qlooService.getRecommendedDestinations(entityIds, location);
      setRecommendedDestinations(destinations);
    } catch (error) {
      console.error('Error fetching recommended destinations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  
  const handleDestinationSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchDestinationResults([]);
      setShowDestinationSuggestions(false);
      return;
    }

    setSearchingDestinations(true);
    setShowDestinationSuggestions(true);

    try {
      const results = await qlooService.searchEntities(query, 8, 'urn:entity:destination');
      setSearchDestinationResults(results);
    } catch (error) {
      console.error('Error searching destinations:', error);
    } finally {
      setSearchingDestinations(false);
    }
  };
  
  const handleDestinationSelect = (destination: any) => {
    setSelectedTravelDestination(destination);
    setSearchDestinationInput('');
    setShowDestinationSuggestions(false);
    setSearchDestinationResults([]);
    
    // If this destination has location data, fetch new recommendations
    if (destination.location && hasPersonaData && selectedEntities.length > 0) {
      fetchRecommendedDestinations(destination.location);
    }
  };

  const checkPersonaData = () => {
    try {
      // Check for selected entities
      const savedEntities = localStorage.getItem('foundEntities');
      const entities = savedEntities ? JSON.parse(savedEntities) : [];
      
      // Check for analysis data (tags)
      const savedAnalysisData = localStorage.getItem('analysisData');
      const analysis = savedAnalysisData ? JSON.parse(savedAnalysisData) : null;
      
      // Check for audience data
      const savedAudiences = localStorage.getItem('selectedAudiences');
      const audiences = savedAudiences ? JSON.parse(savedAudiences) : [];
      
      // Check for persona name (optional)
      const savedPersonaName = localStorage.getItem('personaName') || 'Your Cultural Persona';
      
      setSelectedEntities(entities);
      setAnalysisData(analysis);
      setAudienceData(audiences);
      setPersonaName(savedPersonaName);
      
      // Check if we have minimum required data
      const hasRequiredData = entities.length > 0 && analysis && analysis.tags && analysis.tags.length > 0;
      setHasPersonaData(hasRequiredData);
      
      console.log('Persona data check:', {
        entities: entities.length,
        analysis: analysis ? 'present' : 'missing',
        audiences: audiences.length,
        hasRequiredData
      });
      
    } catch (error) {
      console.error('Error checking persona data:', error);
      setHasPersonaData(false);
    }
  };

  const generateContent = async () => {
    if (!hasPersonaData) return;
    
    setLoading(true);
    try {
      const entityNames = selectedEntities.map(e => e.name).join(', ');
      const tagNames = analysisData.tags.slice(0, 5).map((t: any) => t.name).join(', ');
      const audienceTypes = audienceData.length > 0 
        ? audienceData.map(a => a.name).join(', ')
        : 'creative professionals, cultural enthusiasts';

      let prompt = '';
      
      switch (selectedContentType) {
        case 'story':
          prompt = `You are a lifestyle magazine storyteller. A user has selected these cultural entities: ${entityNames}, with interests in: ${tagNames}. They likely belong to audience segments: ${audienceTypes}. Create a compelling 4-paragraph cultural persona profile named '${personaName}'. Describe their values, cultural roots, creative spirit, and emotional world. Use a poetic, vivid tone that feels personal and aspirational.`;
          break;
          
        case 'travel':
          const destinationName = selectedTravelDestination?.name || 'your chosen destination';
          const destinationCountry = selectedTravelDestination?.properties?.geocode?.country_code || '';
          const destinationRegion = selectedTravelDestination?.properties?.geocode?.admin1_region || '';
          
          prompt = `You are a luxury travel planner. Create a detailed ${numberOfDays}-day travel itinerary for ${destinationName}${destinationRegion ? `, ${destinationRegion}` : ''}${destinationCountry ? `, ${destinationCountry}` : ''} for someone who loves: ${entityNames}, and identifies with cultural tags: ${tagNames}. 

For each day, suggest 3 activities or experiences with:
- **Activity Name** and brief description
- **Time**: Suggested time of day
- **Location**: Specific area/neighborhood
- **Cultural Connection**: How it relates to their taste profile
- **Local Tip**: Insider advice

End each day with a cultural insight about ${destinationName}. Make it inspiring, personal, and culturally rich.`;
          break;
          
        case 'playlist':
          prompt = `You're a music curator. Based on the entities: ${entityNames} and cultural tags: ${tagNames}, build a 10-song playlist. For each song, list: name, artist, genre, vibe/mood, and a sentence about why it fits this cultural profile. Give the playlist a catchy, emotional name.`;
          break;
      }

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemma-3n-E4B-it',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'Sorry, there was an error generating your content. Please try again.';
      
      setGeneratedContent(content);
      
      // Update cache with new content
      const updatedCache = {
        ...contentCache,
        [selectedContentType]: content
      };
      setContentCache(updatedCache);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Sorry, there was an error generating your content. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const downloadAsPDF = () => {
    // Create a simple text file download for now
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedContentType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split content into lines
    const lines = content.split('\n');
    const formattedElements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Empty line - add spacing
        formattedElements.push(<div key={index} className="h-4" />);
      } else if (trimmedLine.startsWith('## ')) {
        // Main heading
        formattedElements.push(
          <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Bold section headers (like song numbers)
        formattedElements.push(
          <h3 key={index} className="text-lg font-semibold text-purple-300 mb-2 mt-4">
            {trimmedLine.replace(/\*\*/g, '')}
          </h3>
        );
      } else if (trimmedLine.includes('**') && trimmedLine.includes(':')) {
        // Song details with bold labels
        const parts = trimmedLine.split('**');
        const formattedParts: (string | JSX.Element)[] = [];
        
        parts.forEach((part, partIndex) => {
          if (partIndex % 2 === 1) {
            // This is a bold part
            formattedParts.push(
              <span key={partIndex} className="font-semibold text-orange-300">
                {part}
              </span>
            );
          } else {
            formattedParts.push(part);
          }
        });
        
        formattedElements.push(
          <div key={index} className="mb-2 pl-4 border-l-2 border-gray-600">
            {formattedParts}
          </div>
        );
      } else if (trimmedLine.startsWith('**') || trimmedLine.includes('**')) {
        // Other bold text
        const parts = trimmedLine.split('**');
        const formattedParts: (string | JSX.Element)[] = [];
        
        parts.forEach((part, partIndex) => {
          if (partIndex % 2 === 1) {
            formattedParts.push(
              <span key={partIndex} className="font-semibold text-yellow-300">
                {part}
              </span>
            );
          } else {
            formattedParts.push(part);
          }
        });
        
        formattedElements.push(
          <p key={index} className="mb-3 leading-relaxed">
            {formattedParts}
          </p>
        );
      } else {
        // Regular paragraph
        formattedElements.push(
          <p key={index} className="mb-3 leading-relaxed text-gray-300">
            {trimmedLine}
          </p>
        );
      }
    });
    
    return <div>{formattedElements}</div>;
  };

  // If no persona data, show the message
  if (!hasPersonaData) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-3xl p-12 border border-gray-700">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Build Your Persona First</h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Please build your persona first by going to the Home page. Search and select some of your favorite artists, movies, or topics, and click 'Build My Persona'. We'll use that to generate your story!
                </p>
              </div>
              
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <Home className="h-5 w-5" />
                Go to Home →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">AI Story Generator</h1>
          <p className="text-gray-400 text-lg">Create personalized cultural content with AI</p>
        </motion.div>

        {/* Persona Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Your Persona Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Selected Entities:</span>
                <p className="text-white mt-1">{selectedEntities.slice(0, 3).map(e => e.name).join(', ')}{selectedEntities.length > 3 ? ` +${selectedEntities.length - 3} more` : ''}</p>
              </div>
              <div>
                <span className="text-gray-400">Cultural Tags:</span>
                <p className="text-white mt-1">{analysisData.tags.slice(0, 3).map((t: any) => t.name).join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-400">Audience Segments:</span>
                <p className="text-white mt-1">{audienceData.length > 0 ? audienceData.slice(0, 2).map(a => a.name).join(', ') : 'Creative Professionals'}</p>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Content Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Choose Content Type</h3>
          <div className="flex flex-wrap gap-4">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedContentType(type.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedContentType === type.id
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Travel Plan Specific UI */}
        {selectedContentType === 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 space-y-8"
          >
            {/* Recommended Destinations */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                Recommended Destinations Based on Your Taste
              </h3>
              
              {loadingRecommendations ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-3">Finding perfect destinations for you...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendedDestinations.map((destination, index) => (
                    <motion.div
                      key={destination.entity_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-600/30 hover:border-purple-400/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                    >
                      {/* Animated Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Image Container with Overlay */}
                      <div className="relative h-56 overflow-hidden">
                      {destination.properties?.image?.url && (
                        <img 
                          src={destination.properties.image.url} 
                          alt={destination.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                        />
                      )}
                        {!destination.properties?.image?.url && (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 animate-pulse"></div>
                            <MapPin className="h-20 w-20 text-purple-300 relative z-10 drop-shadow-lg" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Subtle Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                        
                        {/* Match Score Badge */}
                        <div className="absolute top-3 right-3">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500/95 to-emerald-500/95 backdrop-blur-md rounded-full border border-green-400/30 shadow-lg"
                          >
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-bold drop-shadow-sm">
                              {Math.round((destination.query?.affinity || 0.8) * 100)}%
                            </span>
                          </motion.div>
                        </div>
                        
                        {/* Popularity Badge */}
                        <div className="absolute top-3 left-3">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-500/95 to-amber-500/95 backdrop-blur-md rounded-full border border-yellow-400/30 shadow-lg"
                          >
                            <Star className="h-3 w-3 text-white drop-shadow-sm" />
                            <span className="text-white text-sm font-bold drop-shadow-sm">
                              {Math.round((destination.popularity || 0.8) * 100)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 relative z-10">
                        {/* Title and Location */}
                        <div className="mb-4">
                          <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300 leading-tight">
                            {destination.name}
                          </h4>
                          
                          {/* Location Info */}
                          {destination.properties?.geocode && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1 bg-blue-500/20 rounded-full">
                                <MapPin className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-blue-300 text-sm font-semibold tracking-wide">
                                {destination.properties.geocode.admin1_region && 
                                 destination.properties.geocode.country_code && 
                                 `${destination.properties.geocode.admin1_region}, ${destination.properties.geocode.country_code}`}
                              </span>
                            </div>
                          )}
                          
                          {/* Coordinates */}
                          {destination.location && (
                            <div className="text-gray-400 text-xs flex items-center gap-2 bg-gray-700/30 px-3 py-1 rounded-full">
                              <span className="text-sm">🌍</span>
                              <span className="font-mono">{destination.location.lat.toFixed(2)}°, {destination.location.lon.toFixed(2)}°</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Cultural Tags */}
                        {destination.tags && destination.tags.length > 0 && (
                          <div className="mb-6">
                            <div className="text-gray-400 text-xs mb-3 font-semibold uppercase tracking-wider flex items-center gap-2">
                              <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                              Cultural Vibes
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {destination.tags.slice(0, 4).map((tag, tagIndex) => (
                                <motion.span 
                                  key={tag.tag_id || tagIndex}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 + tagIndex * 0.05 }}
                                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500/25 to-pink-500/25 text-orange-200 text-xs rounded-full border border-orange-400/40 font-medium hover:from-orange-500/35 hover:to-pink-500/35 transition-all duration-200 cursor-default backdrop-blur-sm"
                                >
                                  {tag.name}
                                </motion.span>
                              ))}
                              {destination.tags.length > 4 && (
                                <span className="text-gray-400 text-xs px-3 py-1.5 bg-gray-600/30 rounded-full border border-gray-500/30">
                                  +{destination.tags.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDestinationSelect(destination);
                            }}
                            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn border border-purple-400/20"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                            <span className="relative z-10">
                              ✈️ Select Destination
                            </span>
                          </button>
                          
                          {destination.location && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const { lat, lon } = destination.location;
                                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&zoom=12`;
                                window.open(mapUrl, '_blank');
                              }}
                              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 relative overflow-hidden group/btn border border-blue-400/20 justify-center"
                              title="View on Google Maps"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                              <MapPin className="h-5 w-5 relative z-10 group-hover/btn:scale-110 transition-transform duration-200" />
                              <span className="relative z-10">🗺️ Map</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Search */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-400" />
                Or Search for a Specific Destination
              </h3>
              
              <div className="relative max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchDestinationInput}
                    onChange={(e) => {
                      setSearchDestinationInput(e.target.value);
                      handleDestinationSearch(e.target.value);
                    }}
                    onFocus={() => searchDestinationInput && setShowDestinationSuggestions(true)}
                    placeholder="Search destinations..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                {/* Search Suggestions */}
                {showDestinationSuggestions && (searchDestinationResults.length > 0 || searchingDestinations) && (
                  <div className="absolute z-[9999] w-full mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {searchingDestinations ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-400 mt-2">Searching destinations...</p>
                      </div>
                    ) : (
                      searchDestinationResults.map((destination, index) => (
                        <button
                          key={destination.entity_id || index}
                          onClick={() => handleDestinationSelect(destination)}
                          className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/50 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {destination.properties?.image?.url ? (
                              <img 
                                src={destination.properties.image.url} 
                                alt={destination.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{destination.name}</h4>
                              <p className="text-gray-400 text-sm">
                                {destination.properties?.geocode?.admin1_region && 
                                 destination.properties?.geocode?.country_code && 
                                 `${destination.properties.geocode.admin1_region}, ${destination.properties.geocode.country_code}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Destination & Trip Configuration */}
            {selectedTravelDestination && (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  Plan Your Trip
                </h3>
                
                {/* Selected Destination Display */}
                <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-xl">
                  <div className="flex items-center gap-4">
                    {selectedTravelDestination.properties?.image?.url && (
                      <img 
                        src={selectedTravelDestination.properties.image.url} 
                        alt={selectedTravelDestination.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg">{selectedTravelDestination.name}</h4>
                      <p className="text-green-300">
                        {selectedTravelDestination.properties?.geocode?.admin1_region && 
                         selectedTravelDestination.properties?.geocode?.country_code && 
                         `${selectedTravelDestination.properties.geocode.admin1_region}, ${selectedTravelDestination.properties.geocode.country_code}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTravelDestination(null)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Number of Days Selection */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">Trip Duration</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={numberOfDays}
                      onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 5)}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <span className="text-gray-300">days</span>
                    <div className="flex gap-2 ml-4">
                      {[3, 5, 7, 10].map(days => (
                        <button
                          key={days}
                          onClick={() => setNumberOfDays(days)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            numberOfDays === days
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Create Itinerary Button */}
                <button
                  onClick={generateContent}
                  disabled={loading || !selectedTravelDestination}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Itinerary...' : `Create ${numberOfDays}-Day Itinerary`}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Generate Button for non-travel content */}
        {selectedContentType !== 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-8"
          >
            <button
              onClick={generateContent}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : `Generate ${contentTypes.find(t => t.id === selectedContentType)?.label}`}
            </button>
          </motion.div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">
                {contentTypes.find(t => t.id === selectedContentType)?.title}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors duration-200"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={downloadAsPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <div className="text-gray-300 leading-relaxed">
                {formatContent(generatedContent)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;