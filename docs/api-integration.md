# API Integration Documentation

## Overview

TasteBridge integrates with two primary AI services to deliver its cultural intelligence capabilities:
1. **Qloo Taste AI** - For cultural data, entity relationships, and cross-domain insights
2. **Google Gemma AI** (via Together AI) - For natural language analysis and creative content generation

This document provides detailed information about how these integrations work, the specific endpoints used, data transformation processes, and best practices implemented.

## Qloo API Integration

### Authentication & Configuration

```typescript
const QLOO_BASE_URL = import.meta.env.VITE_QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY;

// Request headers
const headers = {
  'X-API-Key': QLOO_API_KEY,
  'Content-Type': 'application/json',
};
```

### Core Endpoints Used

#### 1. Entity Search (`/search`)
**Purpose**: Discover cultural entities across multiple domains

```typescript
async searchEntities(query: string, limit: number = 10, type?: string): Promise<QlooEntity[]> {
  let url = `/search?query=${encodeURIComponent(query)}&take=${limit}`;
  if (type) {
    url += `&types=${encodeURIComponent(type)}`;
  }
  
  const response = await this.makeRequest(url);
  return response.results || [];
}
```

**Supported Entity Types**:
- `urn:entity:actor` - Movie & TV actors
- `urn:entity:album` - Music albums
- `urn:entity:artist` - Musicians & performers
- `urn:entity:author` - Writers & poets
- `urn:entity:book` - Books & literature
- `urn:entity:brand` - Companies & products
- `urn:entity:destination` - Travel destinations
- `urn:entity:director` - Film directors
- `urn:entity:locality` - Neighborhoods & areas
- `urn:entity:movie` - Films & cinema
- `urn:entity:person` - Public figures
- `urn:entity:place` - Cities & landmarks
- `urn:entity:podcast` - Audio shows
- `urn:entity:tv_show` - TV series
- `urn:entity:videogame` - Gaming titles

**Response Structure**:
```typescript
interface QlooEntity {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    description?: string;
    image?: { url: string };
    // ... other properties
  };
  popularity?: number;
  tags?: QlooTag[];
  external?: QlooExternalServices;
}
```

#### 2. Cultural Insights (`/v2/insights`)
**Purpose**: Generate cultural profiles and discover cross-domain affinities

```typescript
async getInsights(entityIds: string[], entityType?: string): Promise<InsightData> {
  const entityObjects = entityIds.map(id => ({ id }));
  const filterType = entityType || 'urn:entity:artist';
  
  const payload = { 
    'signal.interests.entities': entityObjects,
    'filter.type': filterType
  };
  
  const response = await this.makeRequest('/v2/insights', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  return this.processInsightsResponse(response);
}
```

**Key Features**:
- Cross-domain entity analysis
- Cultural tag extraction
- Audience demographic matching
- Confidence scoring

#### 3. Entity Comparison (`/v2/insights/compare`)
**Purpose**: Compare cultural affinities between entities or personas

```typescript
async compareEntities(entityIds1: string[], entityIds2: string[]): Promise<QlooCompareResult> {
  const params = new URLSearchParams({
    'a.signal.interests.entities': entityIds1[0],
    'b.signal.interests.entities': entityIds2[0],
    'page': '1',
    'take': '20'
  });
  
  const response = await this.makeRequest(`/v2/insights/compare?${params.toString()}`);
  return this.processComparisonResponse(response);
}
```

**Comparison Metrics**:
- Overlap score calculation
- Shared cultural tags
- Distinctive preferences per profile
- Affinity strength analysis

#### 4. Recommendations (`/recommendations`)
**Purpose**: Get personalized recommendations across domains

```typescript
async getRecommendedDestinations(entityIds: string[]): Promise<QlooEntity[]> {
  const params = new URLSearchParams({
    'entity_ids': entityIds.join(','),
    'type': 'urn:entity:destination',
    'bias.content_based': '0.5',
    'sort_by': 'affinity',
    'take': '20'
  });
  
  const response = await this.makeRequest(`/recommendations?${params.toString()}`);
  return response.results || [];
}
```

#### 5. Trending Analysis (`/trends/category`)
**Purpose**: Discover trending cultural content by category

```typescript
async getTrendsByCategory(category: string): Promise<QlooEntity[]> {
  const typeParam = category.startsWith('urn:entity:') ? category : `urn:entity:${category}`;
  const response = await this.makeRequest(`/trends/category?type=${typeParam}`);
  return response.results?.entities || [];
}
```

#### 6. Audience Intelligence (`/v2/audiences`)
**Purpose**: Match cultural preferences with demographic audiences

```typescript
async getAudiencesForPersona(entityIds: string[], tags: any[]): Promise<QlooAudience[]> {
  const params = new URLSearchParams();
  params.append('filter.parents.types', 'urn:entity:person');
  
  entityIds.forEach(entityId => {
    params.append('signal.interests.entities', entityId);
  });
  
  tags.slice(0, 5).forEach(tag => {
    const tagId = tag.tag_id || tag.id || tag.name;
    params.append('signal.interests.tags', tagId);
  });
  
  const response = await this.makeRequest(`/v2/audiences?${params.toString()}`);
  return response.results?.audiences || [];
}
```

#### 7. Geospatial Insights (`/v2/insights` with location filters)
**Purpose**: Analyze cultural preferences by geographic location

```typescript
async getHeatmapInsights(entityId: string, longitude: number, latitude: number, radius: number): Promise<any[]> {
  const params = new URLSearchParams({
    'filter.type': 'urn:heatmap', 
    'filter.location': `POINT(${longitude} ${latitude})`,
    'filter.location.radius': radius.toString(),
    'signal.interests.entities': entityId
  });
  
  const response = await this.makeRequest(`/v2/insights?${params.toString()}`);
  return response.results?.heatmap || [];
}
```

### Data Processing & Transformation

#### Entity Normalization
```typescript
const normalizeEntity = (rawEntity: any): QlooEntity => {
  return {
    entity_id: rawEntity.entity_id || rawEntity.id,
    name: rawEntity.name,
    type: rawEntity.type || rawEntity.types?.[0],
    properties: {
      image: rawEntity.properties?.image || rawEntity.image,
      description: rawEntity.properties?.description,
      release_year: rawEntity.properties?.release_year,
      // ... other properties
    },
    popularity: rawEntity.popularity || rawEntity.query?.popularity,
    tags: rawEntity.tags || [],
    external: rawEntity.external || {}
  };
};
```

#### Comparison Data Processing
```typescript
const processComparisonResponse = (response: any): QlooCompareResult => {
  const tags = response.results?.tags || [];
  
  // Calculate overlap score
  const avgAffinity = tags.length > 0 
    ? tags.reduce((sum: number, tag: any) => sum + (tag.query?.affinity || 0), 0) / tags.length
    : 0;
  const overlapScore = Math.min(avgAffinity * 200, 1);
  
  // Categorize tags by affinity patterns
  const allTags = tags.map((tag: any) => ({
    ...tag,
    aAffinity: tag.query?.a?.affinity || 0,
    bAffinity: tag.query?.b?.affinity || 0,
    combinedAffinity: tag.query?.affinity || 0,
    delta: tag.query?.delta || 0
  }));
  
  // Sort and categorize
  allTags.sort((a, b) => b.combinedAffinity - a.combinedAffinity);
  
  const commonTags = allTags.filter(tag => {
    const minAffinity = Math.min(tag.aAffinity, tag.bAffinity);
    return minAffinity > 0.0015 && tag.delta < 2.0;
  }).slice(0, 15);
  
  return {
    overlapScore,
    commonTags,
    allTags,
    totalTags: tags.length,
    avgAffinity
  };
};
```

### Error Handling & Resilience

#### Graceful Degradation
```typescript
async searchEntities(query: string): Promise<QlooEntity[]> {
  try {
    const response = await this.makeRequest(`/search?query=${encodeURIComponent(query)}`);
    return response.results || [];
  } catch (error) {
    console.error('Qloo API error:', error);
    // Return cached results or empty array
    return this.getCachedResults(query) || [];
  }
}
```

#### Rate Limiting & Retry Logic
```typescript
private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`${QLOO_BASE_URL}${endpoint}`, {
        ...options,
        headers: this.getHeaders(options.headers),
      });
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        await this.delay(Math.pow(2, retryCount) * 1000);
        retryCount++;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retryCount === maxRetries - 1) throw error;
      retryCount++;
      await this.delay(1000);
    }
  }
}
```

## Google Gemma AI Integration (via Together AI)

### Configuration
```typescript
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1';
const MODEL_NAME = 'google/gemma-3n-E4B-it';
```

### Core Functionality

#### Cultural Analysis Generation
```typescript
async generateCulturalAnalysis(prompt: string): Promise<string> {
  try {
    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: 'You are a cultural anthropologist and data analyst specializing in taste preferences and cultural compatibility.'
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

    return response.choices[0]?.message?.content || 'Unable to generate analysis.';
  } catch (error) {
    console.error('Together AI error:', error);
    return this.getFallbackAnalysis();
  }
}
```

#### Prompt Engineering Strategies

**1. Persona Analysis Prompts**
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

**2. Comparison Analysis Prompts**
```typescript
const createComparisonPrompt = (comparison: any, entity1: any, entity2: any) => {
  return `You are a cultural anthropologist. Based on this comparison data:

Profile A: ${entity1?.name}
Profile B: ${entity2?.name}

Overlap Score: ${Math.round((comparison.overlapScore || 0) * 100)}%
Shared Tags: ${comparison.commonTags?.slice(0, 5).map(tag => tag.name).join(', ')}

Provide:
1. Cultural compatibility analysis
2. Shared experience recommendations
3. How differences complement each other
4. Areas for cultural discovery

Focus on practical, real-world applications.`;
};
```

#### Response Processing
```typescript
const formatMarkdown = (text: string): string => {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-purple-300">$1</em>')
    
    // Lists
    .replace(/^(\d+)\.\s+(.*$)/gm, '<div class="flex items-start gap-3 mb-3"><span class="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">$1</span><span class="text-gray-300">$2</span></div>')
    
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
};
```

## Integration Best Practices

### 1. Caching Strategy
```typescript
// Cache frequently accessed data
const cacheKey = `qloo_search_${query}`;
const cachedResult = localStorage.getItem(cacheKey);

if (cachedResult && Date.now() - JSON.parse(cachedResult).timestamp < 300000) {
  return JSON.parse(cachedResult).data;
}

// Store new results with timestamp
localStorage.setItem(cacheKey, JSON.stringify({
  data: results,
  timestamp: Date.now()
}));
```

### 2. Request Optimization
```typescript
// Debounce search requests
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (query.length < 2) return;
    await handleSearch(query);
  }, 300),
  []
);
```

### 3. Error Boundaries
```typescript
// Graceful fallback for API failures
const handleApiError = (error: Error, context: string) => {
  console.error(`${context} failed:`, error);
  
  // Show user-friendly message
  setErrorMessage('Unable to load data. Please try again.');
  
  // Return cached or mock data
  return getCachedData() || getMockData();
};
```

### 4. Performance Monitoring
```typescript
// Track API response times
const startTime = performance.now();
const response = await qlooService.searchEntities(query);
const endTime = performance.now();

console.log(`Search took ${endTime - startTime} milliseconds`);
```

## Data Privacy & Security

### 1. No Personal Data Storage
- All cultural analysis is performed without storing personal information
- User preferences stored locally only
- No server-side user data collection

### 2. API Key Security
- Environment variables for sensitive credentials
- No API keys exposed in client-side code
- Proper CORS configuration

### 3. Data Validation
```typescript
// Validate API responses
const validateQlooEntity = (entity: any): boolean => {
  return entity && 
         typeof entity.name === 'string' && 
         typeof entity.entity_id === 'string' &&
         entity.name.length > 0;
};

// Sanitize user inputs
const sanitizeQuery = (query: string): string => {
  return query.trim().slice(0, 100); // Limit length
};
```

This comprehensive API integration enables TasteBridge to deliver sophisticated cultural intelligence while maintaining performance, reliability, and user privacy.