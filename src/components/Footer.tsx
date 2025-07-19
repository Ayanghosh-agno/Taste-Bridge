import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Brain, Database } from 'lucide-react';

const Footer: React.FC = () => {
  const links = [
    { label: 'GitHub', icon: <Github className="h-5 w-5" />, url: 'https://github.com/Ayanghosh-agno/Taste-Bridge' },
    { label: 'Qloo API', icon: <Database className="h-5 w-5" />, url: 'https://docs.qloo.com' },
    { label: 'Google Gemma', icon: <Brain className="h-5 w-5" />, url: 'https://api.together.ai/' },
    { label: 'Devpost', icon: <ExternalLink className="h-5 w-5" />, url: 'https://qloo-hackathon.devpost.com/' },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full"></div>
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md"></div>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              TasteBridge
            </span>
          </div>
          
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Bridging cultures through AI-powered taste discovery. Built with Qloo APIs and Google Gemma AI.
          </p>
          
          <div className="flex justify-center gap-6 mb-8">
            {links.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </span>
                {link.label}
              </motion.a>
            ))}
          </div>
          
          <div className="text-gray-500 text-sm">
            <p>&copy; 2025 TasteBridge. Made with ❤️ by Ayan for cultural discovery.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;