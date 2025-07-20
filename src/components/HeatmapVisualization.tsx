import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, TrendingUp, Star, Target } from 'lucide-react';

interface HeatmapPoint {
  location: {
    latitude: number;
    longitude: number;
    geohash: string;
  };
  query: {
    affinity: number;
    affinity_rank: number;
    popularity: number;
  };
}

interface HeatmapVisualizationProps {
  heatmapData: HeatmapPoint[];
  selectedEntity: any;
  selectedLocation: { lat: number; lng: number } | null;
  radius: number;
}

const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({
  heatmapData,
  selectedEntity,
  selectedLocation,
  radius
}) => {
  // Calculate statistics
  const avgAffinity = heatmapData.length > 0 
    ? heatmapData.reduce((sum, point) => sum + point.query.affinity, 0) / heatmapData.length 
    : 0;
  
  const highAffinityPoints = heatmapData.filter(point => point.query.affinity > 0.7);
  const mediumAffinityPoints = heatmapData.filter(point => point.query.affinity >= 0.4 && point.query.affinity <= 0.7);
  const lowAffinityPoints = heatmapData.filter(point => point.query.affinity < 0.4);

  // Sort points by affinity for top locations
  const topLocations = [...heatmapData]
    .sort((a, b) => b.query.affinity - a.query.affinity)
    .slice(0, 8);

  const getAffinityColor = (affinity: number) => {
    if (affinity > 0.7) return 'from-red-500 to-pink-500';
    if (affinity > 0.4) return 'from-orange-500 to-yellow-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getAffinityLabel = (affinity: number) => {
    if (affinity > 0.7) return 'High';
    if (affinity > 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-8">
      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-3">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(avgAffinity * 100)}%
          </div>
          <div className="text-gray-400 text-sm">Average Affinity</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-400/20 rounded-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">
            {highAffinityPoints.length}
          </div>
          <div className="text-gray-400 text-sm">High Affinity</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/20 rounded-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl mx-auto mb-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-1">
            {mediumAffinityPoints.length}
          </div>
          <div className="text-gray-400 text-sm">Medium Affinity</div>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-3">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {lowAffinityPoints.length}
          </div>
          <div className="text-gray-400 text-sm">Low Affinity</div>
        </div>
      </motion.div>

      {/* Affinity Distribution Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
      >
        <h4 className="text-white font-semibold text-xl mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          Affinity Distribution
        </h4>
        
        <div className="space-y-4">
          {/* High Affinity Bar */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-red-400 font-medium">High (70%+)</div>
            <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(highAffinityPoints.length / heatmapData.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-end pr-2"
              >
                <span className="text-white text-sm font-bold">
                  {highAffinityPoints.length}
                </span>
              </motion.div>
            </div>
            <div className="w-16 text-gray-400 text-sm">
              {Math.round((highAffinityPoints.length / heatmapData.length) * 100)}%
            </div>
          </div>

          {/* Medium Affinity Bar */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-orange-400 font-medium">Medium (40-70%)</div>
            <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(mediumAffinityPoints.length / heatmapData.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-end pr-2"
              >
                <span className="text-white text-sm font-bold">
                  {mediumAffinityPoints.length}
                </span>
              </motion.div>
            </div>
            <div className="w-16 text-gray-400 text-sm">
              {Math.round((mediumAffinityPoints.length / heatmapData.length) * 100)}%
            </div>
          </div>

          {/* Low Affinity Bar */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-blue-400 font-medium">Low (&lt;40%)</div>
            <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(lowAffinityPoints.length / heatmapData.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-end pr-2"
              >
                <span className="text-white text-sm font-bold">
                  {lowAffinityPoints.length}
                </span>
              </motion.div>
            </div>
            <div className="w-16 text-gray-400 text-sm">
              {Math.round((lowAffinityPoints.length / heatmapData.length) * 100)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Affinity Locations - Creative Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
      >
        <h4 className="text-white font-semibold text-xl mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Star className="h-5 w-5 text-white" />
          </div>
          Top Cultural Hotspots
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topLocations.map((point, index) => (
            <motion.div
              key={point.location.geohash}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className={`relative p-4 bg-gradient-to-br ${getAffinityColor(point.query.affinity)}/10 border border-gray-600 rounded-xl hover:scale-105 transition-all duration-300 group cursor-pointer`}
            >
              {/* Rank Badge */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${getAffinityColor(point.query.affinity)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                #{index + 1}
              </div>
              
              {/* Affinity Level Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${getAffinityColor(point.query.affinity)}/20 rounded-full text-xs font-medium mb-3`}>
                <div className={`w-2 h-2 bg-gradient-to-r ${getAffinityColor(point.query.affinity)} rounded-full`}></div>
                <span className="text-white">{getAffinityLabel(point.query.affinity)} Affinity</span>
              </div>
              
              {/* Location Info */}
              <div className="space-y-2">
                <div className="text-white font-semibold">
                  Location #{index + 1}
                </div>
                <div className="text-gray-300 text-sm">
                  {point.location.latitude.toFixed(4)}°, {point.location.longitude.toFixed(4)}°
                </div>
                
                {/* Affinity Score */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Affinity</span>
                  <span className="text-white font-bold text-lg">
                    {Math.round(point.query.affinity * 100)}%
                  </span>
                </div>
                
                {/* Popularity Score */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Popularity</span>
                  <span className="text-gray-300 text-sm">
                    {Math.round(point.query.popularity * 100)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${point.query.affinity * 100}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getAffinityColor(point.query.affinity)} rounded-full`}
                  />
                </div>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-orange-500/0 group-hover:from-purple-500/5 group-hover:to-orange-500/5 rounded-xl transition-all duration-300"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-400/20 rounded-2xl p-8"
      >
        <h4 className="text-white font-semibold text-xl mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          Cultural Insights Summary
        </h4>
        
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Based on the cultural affinity analysis for <strong className="text-white">{selectedEntity?.name}</strong> around 
            coordinates <strong className="text-purple-300">{selectedLocation?.lat.toFixed(4)}°, {selectedLocation?.lng.toFixed(4)}°</strong> 
            within a <strong className="text-orange-300">{(radius / 1000).toFixed(0)}km radius</strong>, we discovered{' '}
            <strong className="text-white">{heatmapData.length} cultural data points</strong> with an average cultural affinity of{' '}
            <strong className="text-yellow-300">{Math.round(avgAffinity * 100)}%</strong>.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-800/30 rounded-xl">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {Math.round((highAffinityPoints.length / heatmapData.length) * 100)}%
              </div>
              <div className="text-gray-400 text-sm">High Affinity Areas</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {topLocations.length > 0 ? Math.round(topLocations[0].query.affinity * 100) : 0}%
              </div>
              <div className="text-gray-400 text-sm">Peak Affinity Score</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {(radius / 1000).toFixed(0)}km
              </div>
              <div className="text-gray-400 text-sm">Analysis Radius</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeatmapVisualization;