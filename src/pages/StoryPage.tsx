import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Map, Music, Download, Copy, Home, Brain, Sparkles } from 'lucide-react';

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

  // Clear generated content when content type changes
  useEffect(() => {
    setGeneratedContent('');
  }, [selectedContentType]);

  const contentTypes = [
    { id: 'story', label: 'Cultural Story', icon: <BookOpen className="h-5 w-5" />, title: 'Your Cultural Identity' },
    { id: 'travel', label: 'Travel Plan', icon: <Map className="h-5 w-5" />, title: 'Your Ideal Cultural Getaway' },
    { id: 'playlist', label: 'Playlist Idea', icon: <Music className="h-5 w-5" />, title: 'A Playlist That Matches Your Vibe' },
  ];

  useEffect(() => {
    checkPersonaData();
  }, []);

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
          prompt = `You are a luxury travel planner. Create a detailed 5-day travel itinerary for someone who loves: ${entityNames}, and identifies with cultural tags: ${tagNames}. For each day, suggest 3 activities or experiences, with name, description, time, location, and a local tip. End each day with a surprising cultural insight. Keep it inspiring and fun to read.`;
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
          transition={{ duration: 0.6, delay: 0.2 }}
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

        {/* Generate Button */}
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