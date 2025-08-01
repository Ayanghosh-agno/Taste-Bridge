// Together AI Service for Google Gemma integration

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY || 'your-together-api-key';
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1';

// Utility function to format markdown text to HTML
const formatMarkdown = (text: string): string => {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3 border-b border-gray-600 pb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b-2 border-purple-400 pb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-6">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic text-purple-300">$1</em>')
    
    // Numbered lists
    .replace(/^(\d+)\.\s+(.*$)/gm, '<div class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">$1</span><span class="text-gray-300">$2</span></div>')
    
    // Bullet points
    .replace(/^[-•]\s+(.*$)/gm, '<div class="flex items-start gap-3 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></span><span class="text-gray-300">$1</span></div>')
    
    // Code blocks (inline)
    .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-700 text-purple-300 rounded text-sm font-mono">$1</code>')
    
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
};

// Export the function for use in components
export { formatMarkdown };

class TogetherService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${TOGETHER_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Together AI API error for ${endpoint}:`, error);
      throw error;
    }
  }

  async generateCulturalAnalysis(prompt: string): Promise<string> {
    try {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: 'google/gemma-3n-E4B-it',
          messages: [
            {
              role: 'system',
              content: 'You are a cultural anthropologist and data analyst specializing in taste preferences and cultural compatibility. Provide insightful, engaging, and practical analysis based on cultural data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        }),
      });

      return response.choices[0]?.message?.content || 'Unable to generate analysis at this time.';
    } catch (error) {
      console.error('Error generating cultural analysis:', error);
      
      // Return a fallback analysis
      return `Based on the cultural comparison data, these profiles show interesting patterns of taste alignment and divergence. 

The overlap score indicates the degree of shared cultural preferences, while the distinctive preferences for each profile reveal unique aspects of their cultural identity.

Shared cultural tags suggest areas where both profiles would likely enjoy similar experiences, making them excellent candidates for collaborative cultural exploration.

The differences between profiles can be complementary, offering opportunities for mutual cultural discovery and broadening of horizons.

For optimal cultural experiences, consider activities that blend the shared interests while introducing elements from each profile's distinctive preferences.`;
    }
  }

  async generatePersonaInsights(entities: any[], tags: string[]): Promise<string> {
    try {
      const entityNames = entities.map(e => e.name).join(', ');
      const tagList = tags.join(', ');
      
      const prompt = `Based on these cultural preferences:

Entities: ${entityNames}
Cultural Tags: ${tagList}

Provide a comprehensive cultural persona analysis including:
1. Core cultural identity traits
2. Lifestyle preferences and values
3. Recommended cultural experiences
4. Potential audience matches
5. Cultural discovery opportunities

Keep the analysis engaging and actionable.`;

      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: 'google/gemma-3n-E4B-it',
          messages: [
            {
              role: 'system',
              content: 'You are a cultural anthropologist specializing in taste analysis and persona development. Provide insightful, personalized cultural analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        }),
      });

      return response.choices[0]?.message?.content || 'Unable to generate persona insights at this time.';
    } catch (error) {
      console.error('Error generating persona insights:', error);
      
      // Return a fallback analysis
      return `Your cultural profile reveals a sophisticated and eclectic taste that spans multiple domains of creative expression. You demonstrate an appreciation for both mainstream and alternative cultural forms, suggesting an open-minded approach to new experiences.

Your preferences indicate someone who values authenticity and artistic integrity, while also being drawn to innovative and contemporary expressions. This balance suggests you're likely to enjoy cultural experiences that challenge conventional boundaries while maintaining emotional resonance.

Based on your taste profile, you would likely thrive in environments that celebrate creativity, diversity, and intellectual curiosity. Consider exploring cultural events that blend different artistic mediums or showcase emerging artists alongside established voices.`;
    }
  }
}

export const togetherService = new TogetherService();