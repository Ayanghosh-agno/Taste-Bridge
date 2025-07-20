# TasteBridge - AI Cultural Persona Builder

<div align="center">
  <img src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg" alt="TasteBridge Banner" width="800" height="300" style="object-fit: cover; border-radius: 10px;">

  [![Netlify Status](https://api.netlify.com/api/v1/badges/08e27f12-adda-4e87-88d1-36fb22fce8cf/deploy-status)](https://app.netlify.com/projects/celadon-taffy-213814/deploys)
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
</div>

## 🌟 Overview

**TasteBridge** is an innovative AI-powered cultural persona builder that helps users understand their taste preferences, discover cultural connections, and explore new experiences. Built with cutting-edge APIs from Qloo and Google Gemma AI, TasteBridge bridges cultures through intelligent taste discovery and comprehensive cultural analysis.

🔗 **Live Demo**: [https://celadon-taffy-213814.netlify.app/](https://celadon-taffy-213814.netlify.app/)

## ✨ Features

### 🎯 Core Functionality
- **Cultural Persona Building**: Create detailed taste profiles based on your preferences across multiple content types
- **AI-Powered Analysis**: Get insights powered by Google Gemma AI through Together AI
- **Taste Comparison**: Compare cultural compatibility between different personas with detailed overlap analysis
- **Trend Discovery**: Explore trending cultural movements and preferences across categories
- **Audience Matching**: Find your cultural tribe and discover taste overlaps with demographic insights
- **Interactive Visualizations**: Beautiful D3.js-powered cultural network graphs and data visualizations

### 🗺️ Advanced Insights & Analytics
- **Cultural Heatmap Generation**: Generate location-based cultural affinity heatmaps for any entity
- **Entity Demographics Analysis**: Discover age and gender demographics for cultural entities
- **Geospatial Insights**: Analyze cultural preferences by location with demographic filters
- **Interactive Maps**: Leaflet-powered maps with custom markers and heatmap visualizations
- **Real-time Location Selection**: Click-to-select locations for cultural analysis

### 🎨 User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop with adaptive layouts
- **Modern UI**: Clean, gradient-based design with smooth animations and micro-interactions
- **Interactive Elements**: Hover effects, drag-and-drop network graphs, and smooth transitions
- **Real-time Search**: Instant entity search with autocomplete across 15+ content types
- **Progressive Disclosure**: Collapsible sections and expandable content for better mobile experience
- **Category-based Filtering**: Organize content by Entertainment, Music, Literature, Travel, and more

### 🔧 Technical Features
- **TypeScript**: Full type safety and better developer experience
- **React Router**: Client-side routing with deep linking support
- **Framer Motion**: Smooth animations and page transitions
- **Recharts**: Beautiful, responsive charts and data visualizations
- **D3.js**: Interactive network graphs and advanced data visualizations
- **Leaflet Maps**: Interactive mapping with custom markers and overlays

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Qloo API key (from [Qloo Hackathon](https://qloo-hackathon.devpost.com/))
- Together AI API key (from [Together AI](https://api.together.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayanghosh-agno/Taste-Bridge.git
   cd Taste-Bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_QLOO_API_KEY=your_qloo_api_key_here
   VITE_QLOO_BASE_URL=https://hackathon.api.qloo.com
   VITE_TOGETHER_API_KEY=your_together_ai_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── Footer.tsx       # Site footer
│   ├── TasteProfile.tsx # User taste display
│   ├── CulturalGraph.tsx # D3.js network visualization
│   ├── AudienceMatch.tsx # Audience matching display
│   ├── TrendChart.tsx   # Trend visualization
│   ├── WatsonXSummary.tsx # AI analysis component
│   ├── LeafletMap.tsx   # Interactive map component
│   └── HeatmapVisualization.tsx # Heatmap data visualization
├── pages/               # Page components
│   ├── HomePage.tsx     # Landing page with search and category selection
│   ├── PersonaPage.tsx  # Persona building and analysis
│   ├── ComparePage.tsx  # Persona comparison with detailed analysis
│   ├── TrendsPage.tsx   # Cultural trends exploration
│   ├── InsightsPage.tsx # Advanced cultural insights and heatmaps
│   └── StoryPage.tsx    # Cultural stories and insights
├── services/            # API services
│   ├── qloo.ts         # Qloo API integration with comprehensive endpoints
│   └── together.ts     # Together AI integration for Google Gemma
├── App.tsx             # Main app component with routing
├── main.tsx           # App entry point
└── index.css          # Global styles with custom animations
```

## 🔌 API Integration

### Qloo API
TasteBridge integrates with multiple Qloo API endpoints to provide:
- **Entity Search**: Find movies, music, books, places, people, and more across 15+ content types
- **Cultural Analysis**: Generate taste profiles and insights using the Insights API
- **Recommendations**: Get personalized cultural recommendations
- **Trend Data**: Access trending cultural content by category
- **Comparison**: Compare taste profiles between entities with detailed overlap analysis
- **Demographics**: Analyze age and gender demographics for cultural entities
- **Heatmap Generation**: Generate location-based cultural affinity data
- **Geospatial Insights**: Location-based cultural analysis with demographic filters

### Together AI (Google Gemma)
The app uses Google Gemma AI through Together AI for:
- **Cultural Analysis**: Generate detailed persona insights and compatibility assessments
- **Compatibility Assessment**: Analyze cultural compatibility between profiles
- **Recommendations**: Provide personalized cultural suggestions
- **Narrative Generation**: Create engaging cultural stories and explanations

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Orange gradient (`from-purple-500 to-orange-500`)
- **Background**: Dark gray (`bg-gray-900`)
- **Cards**: Semi-transparent gray (`bg-gray-800/50`)
- **Text**: White primary, gray secondary
- **Accents**: Purple (`purple-400`) and Orange (`orange-400`)
- **Status Colors**: Green (positive), Red (negative), Blue (neutral)

### Typography
- **Headers**: Poppins font family
- **Body**: Inter font family
- **Responsive**: Mobile-first approach with breakpoint-specific sizing

### Components
- **Glass Morphism**: Backdrop blur effects with transparency
- **Gradient Borders**: Subtle gradient borders on interactive elements
- **Hover Effects**: Scale and glow effects on buttons and cards
- **Loading States**: Animated spinners and skeleton screens
- **Progress Bars**: Animated progress indicators with color coding

## 📱 Mobile Optimization

TasteBridge is fully responsive with specific mobile optimizations:

- **Collapsible Sections**: Expandable content sections on mobile
- **Touch-Friendly**: Large touch targets and proper spacing
- **Optimized Images**: Responsive image sizing with fallbacks
- **Compact Navigation**: Mobile-friendly navigation menu
- **Readable Typography**: Appropriate font sizes for mobile screens
- **Swipe Gestures**: Touch-friendly interactions for maps and carousels

## 🗺️ Advanced Features

### Cultural Heatmap Generation
- **Location-based Analysis**: Generate cultural affinity heatmaps for any location
- **Interactive Maps**: Click-to-select locations with visual feedback
- **Radius Control**: Adjustable analysis radius (10-80km)
- **Visual Indicators**: Color-coded markers based on affinity levels
- **Detailed Popups**: Rich information overlays for each data point

### Entity Demographics
- **Age Analysis**: Detailed age group breakdowns with above/below average indicators
- **Gender Analysis**: Gender preference analysis with visual representations
- **Progress Bars**: Animated visual indicators for demographic data
- **Color Coding**: Green for above average, red for below average performance

### Geospatial Insights
- **Content Type Filtering**: Filter by movies, artists, books, places, TV shows, brands
- **Demographic Filters**: Filter by gender (male/female) and age groups
- **Subtype Selection**: Fine-tune analysis with content subtypes
- **Location-based Results**: Discover culturally relevant content by location

## 🚀 Deployment

### Netlify (Recommended)
The app is optimized for Netlify deployment with:
- **SPA Redirects**: Configured `_redirects` file for client-side routing
- **Build Optimization**: Optimized build process with tree shaking
- **Environment Variables**: Secure API key management
- **Continuous Deployment**: Automatic deployments from Git

Deploy to Netlify:
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

### Other Platforms
The app can be deployed to any static hosting service:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with optimizations
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Code Quality
- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Code linting and formatting with React-specific rules
- **Prettier**: Code formatting (recommended)
- **Husky**: Git hooks for quality checks (optional)

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Configuration

### Environment Variables
```env
# Qloo API Configuration
VITE_QLOO_API_KEY=your_qloo_api_key
VITE_QLOO_BASE_URL=https://hackathon.api.qloo.com

# Together AI Configuration  
VITE_TOGETHER_API_KEY=your_together_ai_key
```

### Vite Configuration
The app uses Vite for fast development and optimized builds:
- **React Plugin**: Fast refresh and JSX support
- **TypeScript**: Built-in TypeScript support with type checking
- **CSS**: PostCSS with Tailwind CSS processing
- **Optimization**: Tree shaking, code splitting, and asset optimization

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with proper sizing and lazy loading
- **Bundle Analysis**: Optimized bundle size with tree shaking
- **Caching**: Proper caching headers for static assets
- **Lazy Loading**: Components and routes loaded on demand

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 100
- **SEO**: 90+

## 🎯 Content Types Supported

TasteBridge supports analysis across 15+ content types:

### Entertainment
- **Movies** 🎬 - Films and cinema
- **TV Shows** 📺 - Series and programs
- **Actors** 🎭 - Movie & TV stars
- **Directors** 🎬 - Film creators

### Music
- **Artists** 🎤 - Musicians & performers
- **Albums** 💿 - Music collections

### Literature
- **Books** 📚 - Novels & non-fiction
- **Authors** ✍️ - Writers & poets

### Travel & Places
- **Destinations** 🏝️ - Travel hotspots
- **Places** 📍 - Cities & landmarks
- **Localities** 🏘️ - Neighborhoods

### Media & Technology
- **Podcasts** 🎙️ - Audio shows
- **Video Games** 🎮 - Gaming titles
- **Brands** 🏷️ - Companies & products

### Culture
- **People** 👤 - Public figures and personalities

## 🤝 Acknowledgments

- **[Qloo](https://qloo.com/)** - Cultural intelligence API providing comprehensive taste analysis
- **[Together AI](https://api.together.ai/)** - Google Gemma AI integration for cultural insights
- **[Pexels](https://pexels.com/)** - High-quality stock photography
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icons
- **[Framer Motion](https://framer.com/motion/)** - Smooth animations and transitions
- **[Leaflet](https://leafletjs.com/)** - Interactive mapping capabilities
- **[D3.js](https://d3js.org/)** - Advanced data visualizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ayan Ghosh**
- GitHub: [@Ayanghosh-agno](https://github.com/Ayanghosh-agno)
- Project: [TasteBridge](https://github.com/Ayanghosh-agno/Taste-Bridge)

---

<div align="center">
  <p>Made with ❤️ for cultural discovery and cross-cultural understanding</p>
  <p>
    <a href="https://celadon-taffy-213814.netlify.app/">View Demo</a> •
    <a href="https://github.com/Ayanghosh-agno/Taste-Bridge/issues">Report Bug</a> •
    <a href="https://github.com/Ayanghosh-agno/Taste-Bridge/issues">Request Feature</a>
  </p>
</div>