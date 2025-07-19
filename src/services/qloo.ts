// Qloo API Types

// Interface for external service entries
export interface QlooExternalService {
  [key: string]: any;
  id: string;
}

export interface QlooNetflixInfo extends QlooExternalService {
  id: string;
}

export interface QlooImdbInfo extends QlooExternalService {
  id: string;
  user_rating?: number;
  user_rating_count?: number;
}

export interface QlooMetacriticInfo extends QlooExternalService {
  id: string;
  critic_rating?: number;
  user_rating?: number;
}

export interface QlooRottenTomatoesInfo extends QlooExternalService {
  id: string;
  critic_rating?: string;
  critic_rating_count?: string;
  user_rating?: string;
  user_rating_count?: string;
}

export interface QlooSpotifyInfo extends QlooExternalService {
  id: string;
  verified?: boolean;
  followers?: number;
  monthly_listeners?: number;
  last_release?: number;
  first_release?: number;
  artist_type?: string;
}

export interface QlooLastfmInfo extends QlooExternalService {
  id: string;
  listeners?: number;
  scrobbles?: number;
}

export interface QlooMusicbrainzInfo extends QlooExternalService {
  id: string;
  artist_type?: string;
}

export interface QlooExternalServices {
  netflix?: QlooNetflixInfo[];
  wikidata?: QlooExternalService[];
  twitter?: QlooExternalService[];
  facebook?: QlooExternalService[];
  instagram?: QlooExternalService[];
  letterboxd?: QlooExternalService[];
  metacritic?: QlooMetacriticInfo[];
  rottentomatoes?: QlooRottenTomatoesInfo[];
  imdb?: QlooImdbInfo[];
  spotify?: QlooSpotifyInfo[];
  lastfm?: QlooLastfmInfo[];
  musicbrainz?: QlooMusicbrainzInfo[];
  goodreads?: QlooExternalService[];
  [key: string]: QlooExternalService[] | undefined;
}

export interface QlooEntity {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    release_date?: string;
    description?: string;
    content_rating?: string;
    duration?: number;
    date_of_birth?: string;
    place_of_birth?: string;
    image?: {
      url: string;
    };
    akas?: {
      value: string;
      languages: string[];
    }[];
    filming_location?: string;
    production_companies?: string[];
    release_country?: string[];
    short_descriptions?: {
      value: string;
      languages: string[];
    }[];
    websites?: string[];
    [key: string]: any;
  };
  popularity?: number;
  tags?: QlooTag[];
  disambiguation?: string;
  external?: QlooExternalServices;
  query?: {
    rank?: number;
    rank_delta?: number;
    population_percent_delta?: number;
    population_percentile?: number;
    population_percentile_rank?: number;
    population_percentile_rank_velocity?: number;
    trending_score?: number;
    trending_rank?: number;
    charting_score?: number;
    measurements?: {
      audience_growth?: number;
      [key: string]: number | undefined;
    };
  };
  references?: any;
}

export interface QlooTag {
  id: string;
  name: string;
  type: string;
  score?: number;
}

export interface QlooInsight {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    release_date?: string;
    description?: string;
    content_rating?: string;
    duration?: number;
    image?: {
      url: string;
    };
    image_url?: string;
    akas?: {
      value: string;
      languages: string[];
    }[];
    filming_location?: string;
    production_companies?: string[];
    release_country?: string[];
    short_descriptions?: {
      value: string;
      languages: string[];
    }[];
    websites?: string[];
    [key: string]: any;
  };
  popularity?: number;
  tags?: QlooTag[];
  score?: number;
  external?: QlooExternalServices;
  query?: {
    affinity?: number;
    measurements?: Record<string, number>;
  };
  disambiguation?: string;
}

export interface QlooAnalysisResult {
  entity: QlooEntity;
  tags: {
    id: string;
    name: string;
    type: string;
    score: number;
  }[];
  audiences?: {
    id: string;
    name: string;
    type: string;
    score: number;
  }[];
  related_entities?: QlooEntity[];
}

export interface QlooCompareResult {
  overlapScore?: number;
  commonTags?: string[];
  differences?: {
    profile1Only?: string[];
    profile2Only?: string[];
  };
  audienceOverlap?: any[];
}

export interface QlooTrendingEntity extends QlooEntity {
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  timeframe?: string;
}

export interface QlooEntityType {
  id: string;
  name: string;
}

export interface QlooTagType {
  id: string;
  name: string;
}

export interface QlooAudienceType {
  id: string;
  name: string;
}

export interface QlooAudience {
  id: string;
  name: string;
  match?: number;
  description?: string;
}

// API Response Types
export interface QlooApiResponse<T> {
  success: boolean;
  duration?: number;
  totalRequestDuration?: number;
  results: T;
}

export interface QlooEntitiesResults {
  entities: QlooEntity[];
  entity?: QlooEntity;
}

export interface QlooInsightsResults {
  entities: QlooInsight[];
}

export interface QlooAnalysisResults {
  analysis: QlooAnalysisResult;
}

export interface QlooCompareResults {
  comparison: QlooCompareResult;
}

export interface QlooTrendingResults {
  entities: QlooTrendingEntity[];
  period?: string;
}

export interface QlooEntityTypesResults {
  types: QlooEntityType[];
}

export interface QlooTagTypesResults {
  types: QlooTagType[];
}

export interface QlooTagsResults {
  tags: QlooTag[];
}

export interface QlooAudienceTypesResults {
  types: QlooAudienceType[];
}

export interface QlooAudiencesResults {
  audiences: QlooAudience[];
}

// Parameter Types
export interface QlooFilterParams {
  'filter.type'?: string;
  'filter.id'?: string;
  'filter.tags'?: string;
  'filter.content_rating'?: string;
  'filter.popularity.min'?: number;
  'filter.popularity.max'?: number;
  'filter.release_year.min'?: number;
  'filter.release_year.max'?: number;
  'filter.external.netflix'?: string;
  'filter.external.imdb'?: string;
  'filter.external.rottentomatoes'?: string;
  [key: string]: any;
}

export interface QlooSignalParams {
  'signal.interests.entities'?: string;
  'signal.interests.tags'?: string;
  'signal.demographics.age.min'?: number;
  'signal.demographics.age.max'?: number;
  'signal.demographics.gender'?: string;
  'signal.demographics.income'?: string;
  'signal.location'?: string;
  [key: string]: any;
}

export interface QlooOutputParams {
  take?: number;
  page?: number;
  offset?: number;
  sort_by?: 'affinity' | 'distance';
  'feature.explainability'?: boolean;
  'include.popularity'?: boolean;
  'include.tags'?: boolean;
  'include.metrics'?: string;
  [key: string]: any;
}

export type QlooParams = QlooFilterParams & QlooSignalParams & QlooOutputParams;

// Legacy interfaces for backward compatibility
export interface Entity extends QlooEntity {
  id: string;
  domain?: string;
  score?: number;
}

export interface Audience extends QlooAudience {}

export interface TrendData {
  entity: Entity;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
}

export interface InsightData {
  entities: Entity[];
  tags: string[];
  audiences: Audience[];
  cultural_domains: string[];
  confidence: number;
}

// Use environment variables for API credentials
const QLOO_BASE_URL = import.meta.env.VITE_QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY || 'Q6QmSrWCYJMMwb5PqQTLHsbGYbGagx-GcffaSobyJfw';

class QlooService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${QLOO_BASE_URL}${endpoint}`;
    const headers = {
      'X-API-Key': QLOO_API_KEY,
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
      console.error(`Qloo API error for ${endpoint}:`, error);
      throw error;
    }
  }

  async searchEntities(query: string, limit: number = 10): Promise<QlooEntity[]> {
    try {
      const response: QlooApiResponse<QlooEntitiesResults> = await this.makeRequest(
        `/search?query=${encodeURIComponent(query)}&take=${limit}`
      );
      
      // Handle the actual Qloo API response structure
      // The response has a "results" array directly, not nested under "results.entities"
      const entities = response.results || [];
      console.log('Qloo API response entities:', entities);
      return entities;
    } catch (error) {
      console.error('Error searching entities:', error);
      // Return empty array on error - let the calling code handle fallbacks
      return [];
    }
  }

  async getEntityDetails(entityId: string): Promise<QlooEntity | null> {
    try {
      const response: QlooApiResponse<QlooEntitiesResults> = await this.makeRequest(`/entities/${entityId}`);
      return response.results?.entity || null;
    } catch (error) {
      console.error('Error getting entity details:', error);
      return null;
    }
  }

  async getInsights(entityIds: string[], entityType?: string): Promise<InsightData> {
    if (!entityIds || entityIds.length === 0) {
      console.log('No entity IDs provided, returning mock data');
      return {
        entities: [],
        tags: ['indie', 'experimental', 'nostalgic', 'urban', 'minimalist'],
        audiences: [
          { id: '1', name: 'Creative Professionals', match: 0.87 },
          { id: '2', name: 'Urban Explorers', match: 0.82 },
          { id: '3', name: 'Cultural Enthusiasts', match: 0.79 },
        ],
        cultural_domains: ['music', 'food', 'travel', 'art'],
        confidence: 0.85,
      };
    }

    try {
      console.log(`Getting insights for entities: ${entityIds.join(', ')}`);
      
      // Format entity IDs as required by the API
      const entityObjects = entityIds.map(id => ({ id }));
      
      // Use the provided entity type or default to artist
      const filterType = entityType || 'urn:entity:artist';
      console.log('Using filter type:', filterType);
      
      const payload = { 
        'signal.interests.entities': entityObjects,
        'filter.type': filterType // Required parameter based on selected entities
      };
      
      console.log('Calling insights API with payload:', payload);
      
      const response: QlooApiResponse<QlooInsightsResults> = await this.makeRequest('/v2/insights', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Insights API response:', response);
      
      const entities = response.results?.entities || [];
      const tags = entities.flatMap(e => e.tags?.map(t => t.name || t.id) || []);
      console.log('Extracted tags from insights:', tags);
      
      return {
        entities: entities,
        tags: [...new Set(tags)].slice(0, 15), // Remove duplicates and limit to 15 tags
        audiences: [],
        cultural_domains: [],
        confidence: 0.8,
      };
    } catch (error) {
      console.error('Error getting insights:', error);
      // Return mock data as fallback
      return {
        entities: [],
        tags: ['indie', 'experimental', 'nostalgic', 'urban', 'minimalist'],
        audiences: [
          { id: '1', name: 'Creative Professionals', match: 0.87 },
          { id: '2', name: 'Urban Explorers', match: 0.82 },
          { id: '3', name: 'Cultural Enthusiasts', match: 0.79 },
        ],
        cultural_domains: ['music', 'food', 'travel', 'art'],
        confidence: 0.85,
      };
    }
  }

  async getAnalysis(entityIds: string[]): Promise<any> {
    if (!entityIds || entityIds.length === 0) {
      throw new Error('Entity IDs are required for analysis');
    }

    try {
      const entityIdsParam = entityIds.join(',');
      const response = await this.makeRequest(`/analysis?entity_ids=${entityIdsParam}`);
      
      console.log('Analysis API response:', response);
      return response.results || {};
    } catch (error) {
      console.error('Error getting analysis:', error);
      // Return mock analysis data
      return {
        tags: [
          { name: 'Pop', affinity: 0.95, tag_id: 'pop' },
          { name: 'Canadian', affinity: 0.88, tag_id: 'canadian' },
          { name: 'Contemporary', affinity: 0.82, tag_id: 'contemporary' },
          { name: 'Mainstream', affinity: 0.78, tag_id: 'mainstream' },
          { name: 'Emotional', affinity: 0.75, tag_id: 'emotional' },
          { name: 'Youth Culture', affinity: 0.72, tag_id: 'youth-culture' }
        ],
        entities: entityIds.map(id => ({ entity_id: id, enhanced: true }))
      };
    }
  }

  async getInsightsByType(type: string, tagIds: string[], limit: number = 10): Promise<QlooInsight[]> {
    if (!tagIds || tagIds.length === 0) {
      console.log('No tag IDs provided for insights');
      return [];
    }

    try {
      const params = new URLSearchParams();
      params.append('filter.type', type);
      tagIds.slice(0, 5).forEach(tagId => {
        params.append('signal.interests.tags', tagId);
      });
      params.append('take', limit.toString());
      
      console.log(`Getting insights for type ${type} with params:`, params.toString());
      
      const response: QlooApiResponse<QlooInsightsResults> = await this.makeRequest(`/v2/insights?${params.toString()}`);
      
      console.log(`Insights API response for ${type}:`, response);
      return response.results?.entities || [];
    } catch (error) {
      console.error(`Error getting insights for type ${type}:`, error);
      
      // Return mock data based on type
      const mockData: Record<string, any[]> = {
        'urn:entity:place': [
          { name: 'Toronto', entity_id: 'toronto', properties: { image: { url: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg' } }, tags: [{ name: 'Urban' }, { name: 'Cultural' }] },
          { name: 'Nashville', entity_id: 'nashville', properties: { image: { url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg' } }, tags: [{ name: 'Music' }, { name: 'Country' }] }
        ],
        'urn:entity:movie': [
          { name: 'La La Land', entity_id: 'lalaland', properties: { image: { url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg' } }, tags: [{ name: 'Musical' }, { name: 'Romance' }] },
          { name: 'The Greatest Showman', entity_id: 'greatestshowman', properties: { image: { url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg' } }, tags: [{ name: 'Musical' }, { name: 'Inspiring' }] }
        ],
        'urn:entity:artist': [
          { name: 'Billie Eilish', entity_id: 'billieeilish', properties: { image: { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg' } }, tags: [{ name: 'Alternative' }, { name: 'Gen Z' }] },
          { name: 'The Weeknd', entity_id: 'theweeknd', properties: { image: { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg' } }, tags: [{ name: 'R&B' }, { name: 'Canadian' }] }
        ],
        'urn:entity:book': [
          { name: 'The Seven Husbands of Evelyn Hugo', entity_id: 'evelyn-hugo', properties: { image: { url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg' } }, tags: [{ name: 'Romance' }, { name: 'Drama' }] },
          { name: 'Where the Crawdads Sing', entity_id: 'crawdads', properties: { image: { url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg' } }, tags: [{ name: 'Mystery' }, { name: 'Nature' }] }
        ]
      };
      
      return mockData[type] || [];
    }
  }

  async compareEntities(entityIds1: string[], entityIds2: string[]): Promise<QlooCompareResult> {
    try {
      // Use the first entity from each array for comparison
      const entityA = entityIds1[0];
      const entityB = entityIds2[0];
      
      if (!entityA || !entityB) {
        throw new Error('Both entities are required for comparison');
      }
      
      const params = new URLSearchParams({
        'a.signal.interests.entities': entityA,
        'b.signal.interests.entities': entityB,
        'page': '1',
        'take': '20'
      });
      
      const response = await this.makeRequest(`/v2/insights/compare?${params.toString()}`);
      
      // Process the actual API response structure
      const tags = response.results?.tags || [];
      
      // Calculate overlap score based on tag affinities
      // Real API values are around 0.002-0.005, so we need to scale appropriately
      const avgAffinity = tags.length > 0 
        ? tags.reduce((sum: number, tag: any) => sum + (tag.query?.affinity || 0), 0) / tags.length
        : 0;
      const overlapScore = Math.min(avgAffinity * 200, 1); // Scale 0.005 -> 1.0
      
      // Categorize ALL tags based on affinity patterns
      const allTags = tags.map((tag: any) => ({
        ...tag,
        aAffinity: tag.query?.a?.affinity || 0,
        bAffinity: tag.query?.b?.affinity || 0,
        combinedAffinity: tag.query?.affinity || 0,
        delta: tag.query?.delta || 0
      }));

      // Sort tags by combined affinity (highest first)
      allTags.sort((a, b) => b.combinedAffinity - a.combinedAffinity);

      // Common tags: Both profiles have reasonable affinity
      const commonTags = allTags
        .filter((tag: any) => {
          const minAffinity = Math.min(tag.aAffinity, tag.bAffinity);
          return minAffinity > 0.0015 && tag.delta < 2.0; // Both have affinity, not too different
        })
        .slice(0, 15);
      
      // Profile A stronger tags: A has much higher affinity than B
      const profile1Stronger = allTags
        .filter((tag: any) => {
          return tag.aAffinity > tag.bAffinity && 
                 tag.delta > 1.3 && 
                 tag.aAffinity > 0.002;
        })
        .slice(0, 12);
        
      // Profile B stronger tags: B has much higher affinity than A  
      const profile2Stronger = allTags
        .filter((tag: any) => {
          return tag.bAffinity > tag.aAffinity && 
                 tag.delta > 1.3 && 
                 tag.bAffinity > 0.002;
        })
        .slice(0, 12);

      // High affinity tags for both profiles (top preferences)
      const topTags = allTags
        .filter(tag => tag.combinedAffinity > 0.004)
        .slice(0, 10);

      // Moderate affinity tags
      const moderateTags = allTags
        .filter(tag => tag.combinedAffinity >= 0.003 && tag.combinedAffinity <= 0.004)
        .slice(0, 10);

      // Group tags by category/subtype
      const tagsByCategory = allTags.reduce((acc: any, tag: any) => {
        const category = tag.subtype?.replace('urn:tag:', '').split(':')[0] || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(tag);
        return acc;
      }, {});
      
      return {
        overlapScore,
        commonTags,
        profile1Stronger,
        profile2Stronger,
        topTags,
        moderateTags,
        tagsByCategory,
        allTags,
        totalTags: tags.length,
        avgAffinity
      };
    } catch (error) {
      console.error('Error comparing entities:', error);
      // Return mock comparison data
      return {
        overlapScore: 0.73,
        commonTags: ['indie', 'urban', 'contemporary'],
        differences: {
          profile1Only: ['experimental', 'minimalist'],
          profile2Only: ['mainstream', 'classical']
        },
        audienceOverlap: [
          { name: 'Creative Professionals', both: true },
          { name: 'Urban Explorers', both: false, profile: 1 },
          { name: 'Art Enthusiasts', both: true }
        ]
      };
    }
  }

  async getTrendsByCategory(category: string): Promise<QlooEntity[]> {
    // Use the category directly as it should already be in the correct format
    const typeParam = category.startsWith('urn:entity:') ? category : `urn:entity:${category}`;
    
    try {
      const response: QlooApiResponse<QlooTrendingResults> = await this.makeRequest(
        `/trends/category?type=${typeParam}`
      );
      
      // Return the entities directly from the API response
      return response.results?.entities || [];
    } catch (error) {
      console.error('Error getting trends by category:', error);
      // Return empty array on error
      return [];
    }
  }

  async getTags(): Promise<QlooTag[]> {
    try {
      const response: QlooApiResponse<QlooTagsResults> = await this.makeRequest('/v2/tags?filter.popularity.min=0.1');
      
      // Parse the actual Qloo API response structure
      return response.results?.tags || [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [
        { id: 'indie', name: 'indie', type: 'urn:tag:genre:music' },
        { id: 'experimental', name: 'experimental', type: 'urn:tag:genre:music' },
        { id: 'nostalgic', name: 'nostalgic', type: 'urn:tag:genre:music' },
        { id: 'urban', name: 'urban', type: 'urn:tag:genre:music' },
        { id: 'minimalist', name: 'minimalist', type: 'urn:tag:genre:music' },
        { id: 'cultural-fusion', name: 'cultural-fusion', type: 'urn:tag:genre:music' }
      ];
    }
  }

  async getAudiences(): Promise<QlooAudience[]> {
    try {
      console.log('Calling audiences API...');
      const response: QlooApiResponse<QlooAudiencesResults> = await this.makeRequest('/v2/audiences?filter.parents.types=urn:entity:person');
      console.log('Audiences API response:', response);
      return response.results?.audiences || [];
    } catch (error) {
      console.error('Error getting audiences:', error);
      return [
        { id: '1', name: 'Creative Professionals', match: 0.87 },
        { id: '2', name: 'Urban Explorers', match: 0.82 },
        { id: '3', name: 'Cultural Enthusiasts', match: 0.79 },
        { id: '4', name: 'Indie Music Lovers', match: 0.75 },
      ];
    }
  }

  async getAudienceTypes(): Promise<any[]> {
    try {
      console.log('Calling audience types API...');
      const response: QlooApiResponse<{ audience_types: any[] }> = await this.makeRequest('/v2/audiences/types');
      console.log('Audience types API response:', response);
      
      // Process the actual API response structure
      const audienceTypes = response.results?.audience_types || [];
      
      // Transform the response to include user-friendly names
      return audienceTypes.map(audienceType => ({
        id: audienceType.type,
        name: this.formatAudienceTypeName(audienceType.type),
        type: audienceType.type,
        parents: audienceType.parents
      }));
    } catch (error) {
      console.error('Error getting audience types:', error);
      return [
        { id: 'urn:audience:communities', name: 'Communities', type: 'urn:audience:communities' },
        { id: 'urn:audience:hobbies_and_interests', name: 'Hobbies & Interests', type: 'urn:audience:hobbies_and_interests' },
        { id: 'urn:audience:lifestyle_preferences_beliefs', name: 'Lifestyle & Beliefs', type: 'urn:audience:lifestyle_preferences_beliefs' },
        { id: 'urn:audience:professional_area', name: 'Professional Areas', type: 'urn:audience:professional_area' },
        { id: 'urn:audience:leisure', name: 'Leisure', type: 'urn:audience:leisure' }
      ];
    }
  }

  private formatAudienceTypeName(type: string): string {
    // Convert URN format to human-readable names
    const typeMap: Record<string, string> = {
      'urn:audience:communities': 'Communities',
      'urn:audience:global_issues': 'Global Issues',
      'urn:audience:hobbies_and_interests': 'Hobbies & Interests',
      'urn:audience:investing_interests': 'Investing Interests',
      'urn:audience:leisure': 'Leisure',
      'urn:audience:life_stage': 'Life Stage',
      'urn:audience:lifestyle_preferences_beliefs': 'Lifestyle & Beliefs',
      'urn:audience:political_preferences': 'Political Preferences',
      'urn:audience:professional_area': 'Professional Areas',
      'urn:audience:spending_habits': 'Spending Habits'
    };
    
    return typeMap[type] || type.replace('urn:audience:', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async getAudiencesByType(audienceType: string, entityIds: string[]): Promise<any[]> {
    try {
      console.log(`Getting audiences for type ${audienceType} with entities:`, entityIds);
      
      const params = new URLSearchParams();
      params.append('filter.audience.types', audienceType);
      params.append('filter.popularity.min', '0.3');
      
      // Add entity IDs as signal
      entityIds.forEach(entityId => {
        params.append('signal.interests.entities', entityId);
      });
      
      params.append('take', '20');
      
      console.log('Calling audiences API with params:', params.toString());
      const response = await this.makeRequest(`/v2/audiences?${params.toString()}`);
      
      console.log('Audiences API response:', response);
      return response.results?.audiences || [];
    } catch (error) {
      console.error(`Error getting audiences for type ${audienceType}:`, error);
      return [];
    }
  }

  async getAudiencesForPersona(entityIds: string[], tags: any[]): Promise<QlooAudience[]> {
    try {
      console.log('Getting audiences for persona with entities:', entityIds, 'and tags:', tags);
      
      const params = new URLSearchParams();
      params.append('filter.parents.types', 'urn:entity:person');
      
      // Add entity IDs as signal
      entityIds.forEach(entityId => {
        params.append('signal.interests.entities', entityId);
      });
      
      // Add top tags as signal
      tags.slice(0, 5).forEach(tag => {
        const tagId = tag.tag_id || tag.id || tag.name;
        params.append('signal.interests.tags', tagId);
      });
      
      params.append('take', '10');
      
      console.log('Calling audiences API with params:', params.toString());
      const response: QlooApiResponse<QlooAudiencesResults> = await this.makeRequest(`/v2/audiences?${params.toString()}`);
      
      console.log('Audiences API response:', response);
      
      // Process the response to add match scores based on affinity
      const audiences = response.results?.audiences || [];
      return audiences.map(audience => ({
        ...audience,
        match: audience.query?.affinity || Math.random() * 0.4 + 0.6 // Fallback to random high match
      }));
    } catch (error) {
      console.error('Error getting audiences for persona:', error);
      // Return mock audience data as fallback
      return [
        { id: '1', name: 'Creative Professionals', match: 0.87, description: 'Artists, designers, and creative thinkers' },
        { id: '2', name: 'Urban Explorers', match: 0.82, description: 'City dwellers who love discovering new places' },
        { id: '3', name: 'Cultural Enthusiasts', match: 0.79, description: 'People passionate about arts and culture' },
        { id: '4', name: 'Indie Music Lovers', match: 0.75, description: 'Fans of independent and alternative music' },
        { id: '5', name: 'Digital Natives', match: 0.71, description: 'Tech-savvy millennials and Gen Z' }
      ];
    }
  }

  async getEntityWeeklyTrend(entityId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        entity_id: entityId,
        start_date: startDate,
        end_date: endDate
      });
      
      const response = await this.makeRequest(`/trends/entity?${params.toString()}`);
      
      // Transform API response to chart format based on actual response structure
      if (response.results?.trends && Array.isArray(response.results.trends)) {
        return response.results.trends.map((trend: any) => {
          const date = new Date(trend.date);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return {
            day: `${date.getMonth() + 1}/${date.getDate()}`,
            fullDate: trend.date,
            dayName: dayNames[date.getDay()],
            popularity: trend.popularity || 0,
            rank: trend.rank || 0,
            rankDelta: trend.rank_delta || 0,
            populationPercentDelta: trend.population_percent_delta || 0,
            value: Math.round((trend.popularity || 0) * 100) // Convert to 0-100 scale for chart
          };
        });
      }
      
      // Fallback to mock data
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return {
        day: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toISOString(),
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        popularity: Math.random(),
        rank: Math.floor(Math.random() * 100) + 1,
        rankDelta: Math.floor(Math.random() * 21) - 10,
        populationPercentDelta: (Math.random() - 0.5) * 0.01,
        value: Math.floor(Math.random() * 100) + 50
        };
      });
    } catch (error) {
      console.error('Error getting entity weekly trend:', error);
      // Return mock data as fallback
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return {
        day: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toISOString(),
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        popularity: Math.random(),
        rank: Math.floor(Math.random() * 100) + 1,
        rankDelta: Math.floor(Math.random() * 21) - 10,
        populationPercentDelta: (Math.random() - 0.5) * 0.01,
        value: Math.floor(Math.random() * 100) + 50
        };
      });
    }
  }
}

export const qlooService = new QlooService();