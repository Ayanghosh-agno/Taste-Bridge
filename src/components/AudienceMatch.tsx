import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface AudienceMatchProps {
  audiences: Array<{ name: string; match: number }>;
}

const AudienceMatch: React.FC<AudienceMatchProps> = ({ audiences }) => {
  return (
    <div>
      <div className="space-y-6">
        {audiences.map((audience, index) => (
          <motion.div
            key={audience.name}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-white font-semibold text-sm md:text-base">{audience.name}</h4>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
              <div className="flex-1 sm:w-24 md:w-32 bg-gray-600 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${audience.match * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full"
                />
              </div>
              <span className="text-white font-bold text-sm md:text-base min-w-[3rem] text-right">
                {Math.round(audience.match * 100)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AudienceMatch;