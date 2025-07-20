import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Tag, User, Globe, Calendar, MapPin } from 'lucide-react';

interface NodeDetailModalProps {
  node: any;
  onClose: () => void;
}

const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  const renderEntityDetails = () => {
    if (node.type !== 'entity') return null;

    // Try to get entity data from the original entity data if available
    const entityData = node.entityData || {};
    const properties = entityData.properties || {};
    const external = entityData.external || {};

    return (
      <div className="space-y-6">
        {/* Entity Image */}
        {properties.image?.url && (
          <div className="flex justify-center">
            <img 
              src={properties.image.url} 
              alt={`${node.label} - ${node.entityType?.replace('_', ' ') || 'Cultural entity'} image`}
              className="w-32 h-32 rounded-xl object-cover border-2 border-gray-600 shadow-lg"
            />
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Entity Type</div>
              <div className="text-white font-medium capitalize">
                {node.entityType?.replace('_', ' ') || 'Unknown'}
              </div>
            </div>
          </div>

          {properties.release_year && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Release Year</div>
                <div className="text-white font-medium">{properties.release_year}</div>
              </div>
            </div>
          )}

          {properties.place_of_birth && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Place of Birth</div>
                <div className="text-white font-medium">{properties.place_of_birth}</div>
              </div>
            </div>
          )}

          {node.radius && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Influence Score</div>
                <div className="text-white font-medium">{node.radius.toFixed(1)}/20</div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {properties.description && (
          <div className="p-4 bg-gray-700/30 rounded-xl">
            <h4 className="text-white font-semibold mb-2">Description</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{properties.description}</p>
          </div>
        )}

        {/* Short Descriptions */}
        {properties.short_descriptions && properties.short_descriptions.length > 0 && (
          <div className="p-4 bg-gray-700/30 rounded-xl">
            <h4 className="text-white font-semibold mb-2">About</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {properties.short_descriptions[0].value}
            </p>
          </div>
        )}

        {/* External Links */}
        {Object.keys(external).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External Links
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {external.netflix && external.netflix.length > 0 && (
                <a
                  href={`https://netflix.com/title/${external.netflix[0].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">N</div>
                  <span className="text-red-300 text-sm">Netflix</span>
                </a>
              )}
              
              {external.imdb && external.imdb.length > 0 && (
                <a
                  href={`https://imdb.com/title/${external.imdb[0].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg hover:bg-yellow-500/30 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-black text-xs font-bold">I</div>
                  <span className="text-yellow-300 text-sm">IMDb</span>
                </a>
              )}
              
              {external.spotify && external.spotify.length > 0 && (
                <a
                  href={`https://open.spotify.com/artist/${external.spotify[0].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">♪</div>
                  <span className="text-green-300 text-sm">Spotify</span>
                </a>
              )}
              
              {external.goodreads && external.goodreads.length > 0 && (
                <a
                  href={`https://goodreads.com/book/show/${external.goodreads[0].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg hover:bg-amber-500/30 transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                  <span className="text-amber-300 text-sm">Goodreads</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Additional Properties */}
        {(properties.content_rating || properties.duration) && (
          <div className="grid grid-cols-2 gap-4">
            {properties.content_rating && (
              <div className="p-3 bg-gray-700/30 rounded-lg text-center">
                <div className="text-gray-400 text-xs">Content Rating</div>
                <div className="text-white font-semibold">{properties.content_rating}</div>
              </div>
            )}
            {properties.duration && (
              <div className="p-3 bg-gray-700/30 rounded-lg text-center">
                <div className="text-gray-400 text-xs">Duration</div>
                <div className="text-white font-semibold">{Math.round(properties.duration / 60)} min</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTagDetails = () => {
    if (node.type !== 'tag') return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-300 leading-relaxed">
            This cultural tag represents a shared characteristic or theme that connects different entities in your persona. 
            Tags help identify patterns and commonalities across your diverse interests.
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl">
          <h4 className="text-orange-300 font-semibold mb-2">Cultural Significance</h4>
          <p className="text-gray-300 text-sm">
            The "{node.label}" tag indicates a cultural preference or characteristic that appears across multiple 
            domains in your taste profile. This cross-domain connection is what makes your cultural identity unique.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-gray-400 text-xs">Node Size</div>
            <div className="text-white font-semibold">{node.radius.toFixed(1)}</div>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-gray-400 text-xs">Connections</div>
            <div className="text-white font-semibold">Multiple</div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserDetails = () => {
    if (node.type !== 'user') return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-300 leading-relaxed">
            This is your cultural center - the hub of your taste network. All your preferences, 
            entities, and cultural tags connect through this central point, representing your unique cultural identity.
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl">
          <h4 className="text-purple-300 font-semibold mb-2">Your Cultural Network</h4>
          <p className="text-gray-300 text-sm">
            Your position at the center of this network represents how all your cultural preferences 
            interconnect. The strength and number of connections show the diversity and depth of your cultural persona.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-gray-400 text-xs">Role</div>
            <div className="text-white font-semibold">Central Hub</div>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-gray-400 text-xs">Influence</div>
            <div className="text-white font-semibold">Maximum</div>
          </div>
          <div className="p-3 bg-gray-700/30 rounded-lg text-center">
            <div className="text-gray-400 text-xs">Type</div>
            <div className="text-white font-semibold">User</div>
          </div>
        </div>
      </div>
    );
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'entity': return <Globe className="h-6 w-6 text-white" />;
      case 'tag': return <Tag className="h-6 w-6 text-white" />;
      case 'user': return <User className="h-6 w-6 text-white" />;
      default: return <Globe className="h-6 w-6 text-white" />;
    }
  };

  const getNodeColor = () => {
    switch (node.type) {
      case 'entity': return 'from-cyan-500 to-blue-500';
      case 'tag': return 'from-orange-500 to-red-500';
      case 'user': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 border border-gray-600 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${getNodeColor()} rounded-xl flex items-center justify-center`}>
                {getNodeIcon()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{node.label}</h3>
                <p className="text-gray-400 text-sm capitalize">
                  {node.type === 'entity' ? `${node.entityType?.replace('_', ' ') || 'Entity'}` : 
                   node.type === 'tag' ? 'Cultural Tag' : 
                   'Your Cultural Center'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close entity details modal"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {renderEntityDetails()}
          {renderTagDetails()}
          {renderUserDetails()}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs text-center">
              Click outside or press the X to close • Data powered by Qloo
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NodeDetailModal;