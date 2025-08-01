import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface WatsonXSummaryProps {
  personaData: any;
}

const GemmaSummary: React.FC<WatsonXSummaryProps> = ({ personaData }) => {
  const [summary, setSummary] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (personaData) {
      generateSummary();
    }
  }, [personaData]);

  const generateSummary = async () => {
    setTyping(true);
    
    // Mock Google Gemma response with typing effect
    const mockSummary = `You are a nostalgic explorer drawn to ${personaData.tags.slice(0, 3).join(', ')} experiences. Your cultural DNA reveals a sophisticated palate for contemporary art and innovative expression, with strong connections to urban creativity and authentic craftsmanship. You gravitate toward experiences that blend traditional elements with modern innovation, suggesting a personality that values both heritage and progress. Your taste profile indicates someone who seeks depth over surface-level entertainment, preferring quality and meaning in cultural consumption.`;
    
    // Simulate typing effect
    let currentText = '';
    const words = mockSummary.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      currentText += words[i] + ' ';
      setSummary(currentText);
    }
    
    setTyping(false);
  };

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <h4 className="text-base md:text-lg font-semibold text-white">Your Cultural Identity</h4>
        {typing && (
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-3"
          >
            <Sparkles className="h-5 w-5 text-purple-400" />
          </motion.div>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="prose prose-invert max-w-none"
      >
        <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
          {summary}
          {typing && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-6 bg-purple-400 ml-1"
            />
          )}
        </p>
      </motion.div>

      {!typing && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-400/20 rounded-xl"
        >
          <p className="text-purple-300 text-xs md:text-sm font-medium">
            ✨ This analysis was generated using Google Gemma AI based on your cultural preferences and taste patterns.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GemmaSummary;