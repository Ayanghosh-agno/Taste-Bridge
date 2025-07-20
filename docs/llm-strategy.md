# LLM Strategy & Prompt Engineering Documentation

## Overview

TasteBridge leverages Google Gemma AI (via Together AI) to transform raw cultural data from Qloo into meaningful, actionable insights. This document details our prompt engineering strategies, LLM integration patterns, and techniques for generating high-quality cultural analysis.

## Model Selection & Configuration

### Google Gemma 3n-E4B-it
**Why Gemma?**
- Excellent instruction following capabilities
- Strong performance on analytical tasks
- Good balance of creativity and factual accuracy
- Optimized for conversational AI applications

**Configuration Parameters**:
```typescript
const MODEL_CONFIG = {
  model: 'google/gemma-3n-E4B-it',
  max_tokens: 1000,
  temperature: 0.7,    // Balanced creativity/consistency
  top_p: 0.9,         // Nucleus sampling for quality
  stream: false       // Complete responses for analysis
};
```

## Prompt Engineering Framework

### 1. System Prompt Design

**Cultural Anthropologist Persona**:
```typescript
const SYSTEM_PROMPTS = {
  cultural_analyst: `You are a cultural anthropologist and data analyst specializing in taste preferences and cultural compatibility. Provide insightful, engaging, and practical analysis based on cultural data.`,
  
  persona_specialist: `You are a cultural anthropologist specializing in taste analysis and persona development. Provide insightful, personalized cultural analysis.`,
  
  comparison_expert: `You are a cultural compatibility expert who analyzes the intersection of different taste profiles to provide meaningful insights about shared experiences and complementary differences.`
};
```

**Key Principles**:
- Establish expertise and authority
- Set expectations for output style
- Define the analytical lens (cultural anthropology)
- Emphasize practical, actionable insights

### 2. Structured Prompt Templates

#### Persona Analysis Template
```typescript
const createPersonaPrompt = (entities: any[], tags: string[]) => {
  const entityNames = entities.map(e => e.name).join(', ');
  const tagList = tags.join(', ');
  
  return `Based on these cultural preferences:

Entities: ${entityNames}
Cultural Tags: ${tagList}

Provide a comprehensive cultural persona analysis including:
1. Core cultural identity traits
2. Lifestyle preferences and values  
3. Recommended cultural experiences
4. Potential audience matches
5. Cultural discovery opportunities

Keep the analysis engaging and actionable.`;
};
```

#### Comparison Analysis Template
```typescript
const createComparisonPrompt = (comparison: any, entity1: any, entity2: any) => {
  return `You are a cultural anthropologist and data analyst. Based on the following cultural comparison data between two profiles, provide a comprehensive analysis:

Profile A: ${entity1?.name || 'Profile A'}
Profile B: ${entity2?.name || 'Profile B'}

Comparison Results:
- Cultural Overlap Score: ${Math.round((comparison.overlapScore || 0) * 100)}%
- Shared Preferences: ${comparison.commonTags?.length || 0} common cultural tags
- Profile A Strengths: ${comparison.profile1Stronger?.length || 0} distinctive preferences
- Profile B Strengths: ${comparison.profile2Stronger?.length || 0} distinctive preferences
- Total Cultural Tags Analyzed: ${comparison.totalTags || 0}
- Average Cultural Affinity: ${((comparison.avgAffinity || 0) * 1000).toFixed(2)}‰

Top Shared Cultural Tags: ${comparison.commonTags?.slice(0, 5).map((tag: any) => tag.name).join(', ') || 'None'}

Please provide:
1. A detailed cultural compatibility analysis
2. Insights into what this overlap means for shared experiences
3. Recommendations for cultural activities both profiles would enjoy
4. Analysis of how their differences could complement each other
5. Potential areas of cultural discovery for each profile

Keep the analysis engaging, insightful, and practical. Focus on cultural implications and real-world applications.`;
};
```

### 3. Advanced Prompt Techniques

#### Few-Shot Learning Examples
```typescript
const createFewShotPrompt = (data: any) => {
  return `Here are examples of high-quality cultural analysis:

Example 1:
Input: Entities: Radiohead, Wes Anderson, Haruki Murakami
Tags: indie, melancholic, artistic, minimalist
Output: Your cultural profile reveals a sophisticated appreciation for artistic subtlety and emotional depth. You gravitate toward creators who challenge conventional boundaries while maintaining meticulous attention to craft...

Example 2:
Input: Entities: Beyoncé, Ava DuVernay, Chimamanda Ngozi Adichie  
Tags: empowering, contemporary, influential, authentic
Output: Your preferences indicate a strong connection to contemporary voices that champion authenticity and social consciousness...

Now analyze this profile:
Input: ${data.input}
Output:`;
};
```

#### Chain-of-Thought Prompting
```typescript
const createChainOfThoughtPrompt = (data: any) => {
  return `Let's analyze this cultural profile step by step:

Step 1: Identify the core themes
Looking at entities: ${data.entities}
And tags: ${data.tags}

Step 2: Find cross-domain connections
How do these preferences connect across different cultural domains?

Step 3: Determine cultural archetype
What type of cultural consumer does this represent?

Step 4: Generate actionable insights
What specific recommendations can we make?

Step 5: Synthesize final analysis
Combine all insights into a cohesive cultural persona description.

Please work through each step and provide the final analysis:`;
};
```

## Content Generation Strategies

### 1. Cultural Archetype Generation

**Prompt Structure**:
```typescript
const generateArchetypePrompt = (personaData: any) => {
  return `Based on this cultural profile, create a unique Cultural Archetype:

Cultural Data:
- Entities: ${personaData.entities.map(e => e.name).join(', ')}
- Top Tags: ${personaData.tags.slice(0, 8).join(', ')}
- Audience Matches: ${personaData.audiences?.map(a => a.name).join(', ') || 'Various'}

Create an archetype that includes:
1. **Archetype Name**: A creative, memorable title (e.g., "The Nostalgic Explorer", "The Urban Curator")
2. **Core Essence**: 2-3 sentences capturing the fundamental nature
3. **Cultural Signature**: What makes this archetype unique
4. **Discovery Style**: How they approach new cultural experiences
5. **Ideal Experiences**: Specific recommendations aligned with their nature

Make it personal, insightful, and inspiring. Avoid generic descriptions.`;
};
```

### 2. Cultural Compass Generation

**Directional Analysis**:
```typescript
const generateCompassPrompt = (entities: any[]) => {
  return `Create a Cultural Compass for this profile showing directional preferences:

Entities: ${entities.map(e => e.name).join(', ')}

Analyze and provide scores (0-100) for these cultural dimensions:

**Temporal Orientation**
- Past/Traditional ← → Future/Innovative
- Classic ← → Contemporary

**Aesthetic Preference**  
- Minimalist ← → Maximalist
- Subtle ← → Bold

**Emotional Resonance**
- Contemplative ← → Energetic
- Melancholic ← → Uplifting

**Cultural Scope**
- Mainstream ← → Niche
- Local ← → Global

**Discovery Style**
- Familiar ← → Experimental
- Curated ← → Spontaneous

Provide specific scores and brief explanations for each dimension.`;
};
```

### 3. "Why I Like This" Explanations

**Preference Analysis**:
```typescript
const generateWhyILikePrompt = (entity: any, userProfile: any) => {
  return `Explain why someone with this cultural profile would be drawn to "${entity.name}":

User's Cultural Profile:
- Preferred Entities: ${userProfile.entities.map(e => e.name).join(', ')}
- Cultural Tags: ${userProfile.tags.join(', ')}

Target Entity: ${entity.name}
Entity Type: ${entity.type}
Entity Tags: ${entity.tags?.map(t => t.name).join(', ') || 'Various'}

Provide a personalized explanation that:
1. Identifies specific connection points between their profile and this entity
2. Explains the deeper cultural affinities at play
3. Describes what aspects would particularly resonate
4. Suggests what they might discover or appreciate

Make it feel like a knowledgeable friend explaining why this recommendation makes perfect sense for them.`;
};
```

## Response Processing & Enhancement

### 1. Markdown Formatting
```typescript
const formatMarkdown = (text: string): string => {
  return text
    // Headers with styling
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3 border-b border-gray-600 pb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b-2 border-purple-400 pb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-6">$1</h1>')
    
    // Text formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-purple-300">$1</em>')
    
    // Lists with custom styling
    .replace(/^(\d+)\.\s+(.*$)/gm, '<div class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">$1</span><span class="text-gray-300">$2</span></div>')
    .replace(/^[-•]\s+(.*$)/gm, '<div class="flex items-start gap-3 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></span><span class="text-gray-300">$1</span></div>')
    
    // Code and line breaks
    .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-700 text-purple-300 rounded text-sm font-mono">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
};
```

### 2. Content Validation
```typescript
const validateLLMResponse = (response: string): boolean => {
  // Check minimum length
  if (response.length < 100) return false;
  
  // Check for placeholder text
  const placeholders = ['[placeholder]', 'TODO', 'REPLACE_ME'];
  if (placeholders.some(p => response.includes(p))) return false;
  
  // Check for meaningful content
  const meaningfulWords = ['cultural', 'preference', 'taste', 'experience'];
  const wordCount = meaningfulWords.filter(word => 
    response.toLowerCase().includes(word)
  ).length;
  
  return wordCount >= 2;
};
```

### 3. Fallback Content Generation
```typescript
const generateFallbackAnalysis = (context: string): string => {
  const fallbacks = {
    persona: `Your cultural profile reveals a sophisticated and eclectic taste that spans multiple domains of creative expression. You demonstrate an appreciation for both mainstream and alternative cultural forms, suggesting an open-minded approach to new experiences.`,
    
    comparison: `These profiles show interesting patterns of taste alignment and divergence. The overlap score indicates the degree of shared cultural preferences, while the distinctive preferences reveal unique aspects of each cultural identity.`,
    
    archetype: `You embody the "Cultural Explorer" archetype - someone who seeks authentic experiences across diverse domains while maintaining a discerning eye for quality and meaning.`
  };
  
  return fallbacks[context] || fallbacks.persona;
};
```

## Quality Assurance & Optimization

### 1. Response Quality Metrics
```typescript
const assessResponseQuality = (response: string, context: any) => {
  const metrics = {
    length: response.length,
    readability: calculateReadabilityScore(response),
    relevance: calculateRelevanceScore(response, context),
    creativity: calculateCreativityScore(response),
    actionability: calculateActionabilityScore(response)
  };
  
  return metrics;
};
```

### 2. A/B Testing Framework
```typescript
const testPromptVariations = async (basePrompt: string, variations: string[]) => {
  const results = [];
  
  for (const variation of variations) {
    const response = await generateResponse(variation);
    const quality = assessResponseQuality(response, basePrompt);
    
    results.push({
      prompt: variation,
      response,
      quality,
      timestamp: Date.now()
    });
  }
  
  return results.sort((a, b) => b.quality.overall - a.quality.overall);
};
```

### 3. Continuous Improvement
```typescript
// Track successful prompt patterns
const trackPromptSuccess = (prompt: string, userFeedback: number) => {
  const promptPattern = extractPattern(prompt);
  
  localStorage.setItem(`prompt_success_${promptPattern}`, JSON.stringify({
    pattern: promptPattern,
    successRate: userFeedback,
    lastUsed: Date.now()
  }));
};

// Use successful patterns for future prompts
const optimizePrompt = (basePrompt: string): string => {
  const successfulPatterns = getSuccessfulPatterns();
  return incorporatePatterns(basePrompt, successfulPatterns);
};
```

## Integration with Qloo Data

### 1. Data-Driven Prompting
```typescript
const createDataDrivenPrompt = (qlooData: any) => {
  // Extract quantitative insights
  const affinityScores = qlooData.tags?.map(t => t.affinity) || [];
  const avgAffinity = affinityScores.reduce((a, b) => a + b, 0) / affinityScores.length;
  
  // Incorporate data confidence
  const confidence = qlooData.confidence || 0.8;
  const confidenceModifier = confidence > 0.9 ? 'high confidence' : 
                           confidence > 0.7 ? 'moderate confidence' : 'emerging patterns';
  
  return `Based on ${confidenceModifier} cultural data analysis (avg affinity: ${avgAffinity.toFixed(3)}):

${basePrompt}

Note: Focus on the strongest cultural signals while acknowledging areas of uncertainty.`;
};
```

### 2. Cross-Domain Synthesis
```typescript
const synthesizeCrossDomainInsights = (entities: any[]) => {
  // Group entities by domain
  const domains = groupBy(entities, 'type');
  
  // Find connecting themes
  const connectingTags = findCommonTags(entities);
  
  return `Analyze the cross-domain cultural connections:

Domains Represented: ${Object.keys(domains).join(', ')}
Connecting Themes: ${connectingTags.join(', ')}

How do preferences in ${Object.keys(domains)[0]} relate to choices in ${Object.keys(domains)[1]}? 
What deeper cultural values connect these seemingly different interests?`;
};
```

This comprehensive LLM strategy enables TasteBridge to generate nuanced, personalized cultural insights that go beyond simple data summarization to provide meaningful, actionable cultural intelligence.