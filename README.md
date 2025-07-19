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

**TasteBridge** is an innovative AI-powered cultural persona builder that helps users understand their taste preferences, discover cultural connections, and explore new experiences. Built with cutting-edge APIs from Qloo and Google Gemma AI, TasteBridge bridges cultures through intelligent taste discovery.

🔗 **Live Demo**: [https://celadon-taffy-213814.netlify.app/](https://celadon-taffy-213814.netlify.app/)

## ✨ Features

### 🎯 Core Functionality
- **Cultural Persona Building**: Create detailed taste profiles based on your preferences
- **AI-Powered Analysis**: Get insights powered by Google Gemma AI
- **Taste Comparison**: Compare cultural compatibility between different personas
- **Trend Discovery**: Explore trending cultural movements and preferences
- **Audience Matching**: Find your cultural tribe and taste overlaps
- **Interactive Visualizations**: Beautiful D3.js-powered cultural network graphs

### 🎨 User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Interactive Elements**: Hover effects, micro-interactions, and smooth transitions
- **Real-time Search**: Instant entity search with autocomplete
- **Progressive Disclosure**: Collapsible sections for better mobile experience

### 🔧 Technical Features
- **TypeScript**: Full type safety and better developer experience
- **React Router**: Client-side routing with deep linking support
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Beautiful, responsive charts and data visualizations
- **D3.js**: Interactive network graphs and data visualizations

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
│   └── WatsonXSummary.tsx # AI analysis component
├── pages/               # Page components
│   ├── HomePage.tsx     # Landing page with search
│   ├── PersonaPage.tsx  # Persona building and analysis
│   ├── ComparePage.tsx  # Persona comparison
│   ├── TrendsPage.tsx   # Cultural trends exploration
│   └── StoryPage.tsx    # Cultural stories and insights
├── services/            # API services
│   ├── qloo.ts         # Qloo API integration
│   └── together.ts     # Together AI integration
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## 🔌 API Integration

### Qloo API
TasteBridge integrates with the Qloo API to provide:
- **Entity Search**: Find movies, music, books, places, and more
- **Cultural Analysis**: Generate taste profiles and insights
- **Recommendations**: Get personalized cultural recommendations
- **Trend Data**: Access trending cultural content
- **Comparison**: Compare taste profiles between entities

### Together AI (Google Gemma)
The app uses Google Gemma AI through Together AI for:
- **Cultural Analysis**: Generate detailed persona insights
- **Compatibility Assessment**: Analyze cultural compatibility
- **Recommendations**: Provide personalized cultural suggestions
- **Narrative Generation**: Create engaging cultural stories

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Orange gradient (`from-purple-500 to-orange-500`)
- **Background**: Dark gray (`bg-gray-900`)
- **Cards**: Semi-transparent gray (`bg-gray-800/50`)
- **Text**: White primary, gray secondary
- **Accents**: Purple (`purple-400`) and Orange (`orange-400`)

### Typography
- **Headers**: Poppins font family
- **Body**: Inter font family
- **Responsive**: Mobile-first approach with breakpoint-specific sizing

### Components
- **Glass Morphism**: Backdrop blur effects
- **Gradient Borders**: Subtle gradient borders on interactive elements
- **Hover Effects**: Scale and glow effects on buttons and cards
- **Loading States**: Animated spinners and skeleton screens

## 📱 Mobile Optimization

TasteBridge is fully responsive with specific mobile optimizations:

- **Collapsible Sections**: Expandable content sections on mobile
- **Touch-Friendly**: Large touch targets and proper spacing
- **Optimized Images**: Responsive image sizing
- **Compact Navigation**: Mobile-friendly navigation menu
- **Readable Typography**: Appropriate font sizes for mobile screens

## 🚀 Deployment

### Netlify (Recommended)
The app is optimized for Netlify deployment with:
- **SPA Redirects**: Configured `_redirects` file for client-side routing
- **Build Optimization**: Optimized build process
- **Environment Variables**: Secure API key management

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
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
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
- **TypeScript**: Built-in TypeScript support
- **CSS**: PostCSS with Tailwind CSS
- **Optimization**: Tree shaking and code splitting

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Analysis**: Optimized bundle size
- **Caching**: Proper caching headers for static assets
- **Lazy Loading**: Components loaded on demand

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 100
- **SEO**: 90+

## 🤝 Acknowledgments

- **[Qloo](https://qloo.com/)** - Cultural intelligence API
- **[Together AI](https://api.together.ai/)** - Google Gemma AI integration
- **[Pexels](https://pexels.com/)** - Stock photography
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Framer Motion](https://framer.com/motion/)** - Smooth animations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ayan Ghosh**
- GitHub: [@Ayanghosh-agno](https://github.com/Ayanghosh-agno)
- Project: [TasteBridge](https://github.com/Ayanghosh-agno/Taste-Bridge)

---

<div align="center">
  <p>Made with ❤️ for cultural discovery</p>
  <p>
    <a href="https://celadon-taffy-213814.netlify.app/">View Demo</a> •
    <a href="https://github.com/Ayanghosh-agno/Taste-Bridge/issues">Report Bug</a> •
    <a href="https://github.com/Ayanghosh-agno/Taste-Bridge/issues">Request Feature</a>
  </p>
</div>
