import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Map, Music, Download, Copy } from 'lucide-react';

const StoryPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [storyType, setStoryType] = useState('story');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const availableTags = [
    'indie', 'experimental', 'nostalgic', 'urban', 'minimalist',
    'cultural-fusion', 'contemporary', 'artisanal', 'eclectic', 'ethereal',
    'organic', 'avant-garde', 'sophisticated', 'rustic', 'cosmopolitan'
  ];

  const storyTypes = [
    { id: 'story', label: 'Cultural Story', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'travel', label: 'Travel Plan', icon: <Map className="h-5 w-5" /> },
    { id: 'playlist', label: 'Playlist Idea', icon: <Music className="h-5 w-5" /> },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const generateContent = async () => {
    if (selectedTags.length === 0) return;
    
    setLoading(true);
    try {
      // Mock WatsonX response
      const mockContent = {
        story: `In the heart of a bustling metropolis, where ${selectedTags.join(', ')} cultures intertwine, there exists a hidden world of artistic expression. The protagonist navigates through underground galleries, discovering how their refined taste for experimental art mirrors the city's own evolution. Each encounter reveals a new layer of cultural complexity, from intimate jazz clubs tucked between towering skyscrapers to artisanal coffee shops that serve as meeting grounds for creative minds. This journey becomes a reflection of modern cultural identity - fluid, interconnected, and beautifully complex.`,
        
        travel: `Your Cultural Journey Itinerary:

Day 1: Arrival in Tokyo
- Morning: Explore the minimalist architecture of Omotesando Hills
- Afternoon: Visit experimental art galleries in Shibuya
- Evening: Indie music venue in Golden Gai

Day 2: Cultural Immersion
- Morning: Traditional tea ceremony with contemporary twist
- Afternoon: Artisanal craft workshops in Asakusa
- Evening: Fusion dining experience in Harajuku

Day 3: Urban Discovery
- Morning: Architecture walk through Ginza
- Afternoon: Contemporary art museums
- Evening: Underground music scene exploration

This itinerary balances your appreciation for ${selectedTags.slice(0, 3).join(', ')} with authentic cultural experiences.`,

        playlist: `"${selectedTags.join(' & ').toUpperCase()} VIBES" - A Curated Musical Journey

1. "Midnight City" - M83 (atmospheric indie)
2. "Holocene" - Bon Iver (nostalgic minimalism)
3. "Teardrop" - Massive Attack (experimental electronic)
4. "Black" - Pearl Jam (raw authenticity)
5. "Breathe Me" - Sia (ethereal vocals)
6. "Kiara" - Bonobo (organic electronic)
7. "The Night We Met" - Lord Huron (indie folk fusion)
8. "Crystalised" - The xx (minimalist indie)
9. "Radioactive" - Kings of Leon (alternative rock)
10. "Sunset Lover" - Petit Biscuit (dreamy electronic)

This playlist captures the essence of ${selectedTags.slice(0, 3).join(', ')} through carefully selected tracks that tell a story of cultural exploration and emotional depth.`
      };
      
      setGeneratedContent(mockContent[storyType as keyof typeof mockContent]);
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

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">WatsonX Story Generator</h1>
          <p className="text-gray-400 text-lg">Create personalized cultural content with AI</p>
        </motion.div>

        {/* Story Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Choose Content Type</h3>
          <div className="flex flex-wrap gap-4">
            {storyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setStoryType(type.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  storyType === type.id
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

        {/* Tag Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Select Your Taste Tags</h3>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag, index) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                }`}
              >
                {tag}
              </motion.button>
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
            disabled={selectedTags.length === 0 || loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : `Generate ${storyTypes.find(t => t.id === storyType)?.label}`}
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
              <h3 className="text-2xl font-semibold text-white">Generated Content</h3>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors duration-200"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={() => {/* PDF download logic */}}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="prose prose-invert max-w-none"
            >
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {generatedContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;