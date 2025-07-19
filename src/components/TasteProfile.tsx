import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Star } from 'lucide-react';

interface TasteProfileProps {
  userTastes: string;
  personaData: any;
}

const TasteProfile: React.FC<TasteProfileProps> = ({ userTastes, personaData }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* User Input */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Your Tastes</h4>
          <div className="bg-gray-700/30 rounded-xl p-4">
            <p className="text-gray-300">{userTastes}</p>
          </div>
        </div>

        {/* Matched Entities */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Matched Entities</h4>
          <div className="space-y-3">
            {personaData?.entities?.map((entity: any, index: number) => (
              <motion.div
                key={entity.id || entity.entity_id || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {entity.image ? (
                    <img 
                      src={entity.image} 
                      alt={entity.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-gray-600">
                      <span className="text-white font-bold text-lg">
                        {entity.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-white font-medium">{entity.name}</span>
                  {entity.type && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {entity.type.replace('urn:entity:', '')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">
                    {Math.round((entity.confidence || entity.popularity || 0.5) * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <Tag className="h-5 w-5 text-purple-400 mr-2" />
          <h4 className="text-lg font-semibold text-white">Cultural Tags</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {personaData?.tags?.map((tag: string, index: number) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-400/30 rounded-full text-purple-300 font-medium hover:scale-105 transition-transform duration-200"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasteProfile;