# TasteBridge Architecture Documentation

## Overview

TasteBridge is built using a modern, scalable architecture that seamlessly integrates multiple AI services and APIs to deliver a sophisticated cultural persona building experience. This document provides a detailed technical overview of the system architecture, data flow, and component interactions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Tailwind CSS + Framer Motion         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Pages     │  │ Components  │  │  Services   │            │
│  │             │  │             │  │             │            │
│  │ • HomePage  │  │ • Navigation│  │ • qloo.ts   │            │
│  │ • PersonaPage│ │ • CulturalGraph│ • together.ts│            │
│  │ • ComparePage│ │ • LeafletMap│  │             │            │
│  │ • TrendsPage│  │ • Modals    │  │             │            │
│  │ • InsightsPage│ │ • Charts   │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Qloo Taste AI     │    │     Google Gemma AI             │ │
│  │                     │    │     (via Together AI)           │ │
│  │ • Entity Search     │    │                                 │ │
│  │ • Recommendations   │    │ • Cultural Analysis             │ │
│  │ • Insights API      │    │ • Persona Synthesis             │ │
│  │ • Comparison API    │    │ • Compatibility Assessment      │ │
│  │ • Trends API        │    │ • Creative Content Generation   │ │
│  │ • Audiences API     │    │                                 │ │
│  │ • Geospatial Data   │    │                                 │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── Navigation.tsx
├── Router
│   ├── HomePage.tsx
│   │   ├── EntitySearch
│   │   ├── CategorySelector
│   │   └── SelectedEntities
│   ├── PersonaPage.tsx
│   │   ├── TasteProfile.tsx
│   │   ├── CulturalGraph.tsx
│   │   ├── AudienceMatch.tsx
│   │   └── WatsonXSummary.tsx
│   ├── ComparePage.tsx
│   │   ├── EntitySearch (x2)
│   │   ├── ComparisonResults
│   │   └── AIAnalysis
│   ├── TrendsPage.tsx
│   │   ├── CategoryTrends
│   │   └── TrendChart.tsx
│   └── InsightsPage.tsx
│       ├── LeafletMap.tsx
│       └── HeatmapVisualization.tsx
└── Footer.tsx
```

### State Management

TasteBridge uses a combination of local component state and localStorage for data persistence:

#### Local State (React useState)
- **Search Results**: Temporary storage for entity search results
- **UI State**: Loading states, modal visibility, form inputs
- **Interaction State**: Selected nodes, hover states, animation triggers

#### Persistent State (localStorage)
- **foundEntities**: User's selected cultural preferences
- **userTastes**: Formatted taste string for display
- **Cached API Responses**: Temporary caching for performance

#### State Flow Example
```typescript
// User selects entities on HomePage
const [selectedEntities, setSelectedEntities] = useState<any[]>([]);

// Entities are persisted to localStorage
useEffect(() => {
  localStorage.setItem('foundEntities', JSON.stringify(selectedEntities));
}, [selectedEntities]);

// PersonaPage reads from localStorage
useEffect(() => {
  const savedEntities = localStorage.getItem('foundEntities');
  if (savedEntities) {
    const entities = JSON.parse(savedEntities);
    // Process entities for persona building
  }
}, []);
```

## Data Flow Architecture

### 1. Entity Discovery Flow
```
User Input → Search API → Qloo Entity Search → Results Display → Entity Selection → localStorage
```

### 2. Persona Building Flow
```
Selected Entities → Qloo Insights API → Cultural Tags → Audience Matching → AI Analysis → Persona Display
```

### 3. Comparison Flow
```
Two Entities → Qloo Compare API → Overlap Analysis → Google Gemma → Compatibility Report
```

### 4. Visualization Flow
```
Persona Data → D3.js Processing → Network Graph → Interactive Visualization
```

## Component Design Patterns

### 1. Service Layer Pattern
All external API calls are abstracted through service classes:

```typescript
// qloo.ts - Centralized Qloo API integration
class QlooService {
  async searchEntities(query: string): Promise<QlooEntity[]>
  async getInsights(entityIds: string[]): Promise<InsightData>
  async compareEntities(ids1: string[], ids2: string[]): Promise<CompareResult>
}

// together.ts - Google Gemma AI integration
class TogetherService {
  async generateCulturalAnalysis(prompt: string): Promise<string>
  async generatePersonaInsights(entities: any[], tags: string[]): Promise<string>
}
```

### 2. Compound Component Pattern
Complex UI elements are broken into smaller, focused components:

```typescript
// CulturalGraph.tsx
const CulturalGraph = ({ personaData }) => {
  // Main visualization logic
  return (
    <div>
      <svg ref={svgRef} />
      <InteractiveControls />
      <CrossDomainExplanation />
      {selectedNode && <NodeDetailModal />}
    </div>
  );
};
```

### 3. Custom Hooks Pattern
Reusable logic is extracted into custom hooks:

```typescript
// Example: useEntitySearch hook
const useEntitySearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await qlooService.searchEntities(query);
      setResults(results);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { results, loading, search };
};
```

## Performance Optimizations

### 1. Code Splitting
- Route-based code splitting using React.lazy()
- Component-level splitting for heavy visualizations

### 2. API Optimization
- Request debouncing for search inputs
- Response caching in localStorage
- Batch API calls where possible

### 3. Rendering Optimization
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers

### 4. Bundle Optimization
- Tree shaking for unused code
- Dynamic imports for large libraries (D3.js, Leaflet)
- Optimized build configuration with Vite

## Error Handling Strategy

### 1. API Error Handling
```typescript
try {
  const response = await qlooService.searchEntities(query);
  return response;
} catch (error) {
  console.error('Search failed:', error);
  // Graceful fallback to cached data or mock data
  return getCachedResults() || getMockData();
}
```

### 2. UI Error Boundaries
- React Error Boundaries for component-level error catching
- Graceful degradation for failed API calls
- User-friendly error messages

### 3. Loading States
- Skeleton screens for better perceived performance
- Progressive loading for complex visualizations
- Clear feedback for long-running operations

## Security Considerations

### 1. API Key Management
- Environment variables for sensitive data
- No API keys exposed in client-side code
- Proper CORS configuration

### 2. Data Validation
- Input sanitization for user-generated content
- Type checking with TypeScript
- Validation of API responses

### 3. Privacy Protection
- No personal data stored on servers
- Local storage for user preferences
- Compliance with privacy-first principles

## Scalability Considerations

### 1. Component Modularity
- Loosely coupled components
- Clear separation of concerns
- Reusable component library

### 2. State Management
- Prepared for Redux/Zustand if needed
- Modular state structure
- Efficient data normalization

### 3. API Integration
- Abstracted service layer for easy provider switching
- Configurable endpoints and parameters
- Rate limiting and retry mechanisms

## Development Workflow

### 1. File Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level components
├── services/      # API integration layer
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
└── styles/        # Global styles and themes
```

### 2. Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- kebab-case for file names
- UPPER_CASE for constants

### 3. Code Quality
- ESLint for code consistency
- TypeScript for type safety
- Prettier for code formatting
- Comprehensive error handling

This architecture ensures TasteBridge is maintainable, scalable, and provides a solid foundation for future enhancements while delivering a smooth user experience.