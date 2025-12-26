import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Twitter, Instagram, FileText, Link as LinkIcon, Heart, Eye, AtSign } from 'lucide-react';
import { Post } from '../types';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';

interface PostCardProps {
  post: Post;
  variant?: 'compact' | 'standard' | 'featured';
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant = 'standard', className = '' }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [views, setViews] = useState(post.viewsCount);
  const [hasViewed, setHasViewed] = useState(false);

  // Check if current user Liked this post
  useEffect(() => {
    if (user) {
      db.checkUserLike(post.id, user.id).then(liked => setIsLiked(liked));
    }
  }, [user, post.id]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to like posts.");
      return;
    }
    
    // Optimistic Update
    if (isLiked) {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }

    // Server Update
    const error = await db.toggleLike(post.id, user.id);
    if (error) {
      // Revert if error
      if (isLiked) { // was liked, tried to unlike, failed -> still liked
        setIsLiked(true);
        setLikes(prev => prev + 1);
      } else { // was unliked, tried to like, failed -> still unliked
        setIsLiked(false);
        setLikes(prev => prev - 1);
      }
      console.error("Error toggling like:", error);
    }
  };

  const handleCardClick = () => {
    // Only count view once per session/card load to avoid spam
    if (!hasViewed) {
      db.incrementView(post.id);
      setViews(prev => prev + 1);
      setHasViewed(true);
    }
  };

  const getIcon = () => {
    switch (post.category) {
      case 'youtube': return <Play className="w-5 h-5 text-white" fill="currentColor" />;
      case 'x': return <Twitter className="w-5 h-5 text-white" fill="currentColor" />; // Lucide doesn't have X logo yet, reusing Twitter or generic
      case 'threads': return <AtSign className="w-5 h-5 text-white" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-white" />;
      case 'article': return <FileText className="w-5 h-5 text-white" />;
      default: return <LinkIcon className="w-5 h-5 text-white" />;
    }
  };

  const getGradient = () => {
    switch (post.category) {
      case 'youtube': return 'bg-gradient-to-br from-red-600/80 to-red-900/80';
      case 'x': return 'bg-gradient-to-br from-gray-900/90 to-black/90'; // X is black
      case 'threads': return 'bg-gradient-to-br from-black/90 to-gray-800/90'; // Threads is also black usually
      case 'instagram': return 'bg-gradient-to-br from-pink-500/80 to-orange-500/80';
      case 'article': return 'bg-gradient-to-br from-blue-500/80 to-cyan-600/80';
      default: return 'bg-gradient-to-br from-purple-500/80 to-indigo-600/80';
    }
  };

  const isFeatured = variant === 'featured';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}
    >
      <a href={post.url} target="_blank" rel="noreferrer" onClick={handleCardClick} className="block w-full h-full cursor-pointer">
        {/* Background Image with Overlay */}
        <div className={`absolute inset-0 z-0 ${isFeatured ? 'opacity-60' : 'opacity-40'} group-hover:opacity-50 transition-opacity duration-500`}>
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col justify-end">
          {/* Category Badge */}
          <div className={`absolute top-4 right-4 p-2 rounded-full ${getGradient()} backdrop-blur-md shadow-lg`}>
            {getIcon()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 mb-2">
               <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                 {post.category === 'x' ? 'X (TWITTER)' : post.category}
               </span>
               <span className="text-xs text-gray-400">• {post.username}</span>
            </div>
            
            <h3 className={`font-bold text-white leading-tight ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg line-clamp-2'}`}>
              {post.title}
            </h3>
            
            {isFeatured && (
              <p className="text-gray-300 text-sm line-clamp-2 mt-2">{post.description}</p>
            )}

            <div className="flex items-center space-x-4 pt-3 mt-2 border-t border-white/10">
              <button 
                onClick={toggleLike}
                className={`flex items-center space-x-1 text-xs transition-colors duration-200 cursor-pointer ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
                title={isLiked ? "Unlike" : "Like"}
              >
                <motion.div whileTap={{ scale: 0.8 }} animate={{ scale: isLiked ? 1.1 : 1 }}>
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
                <span className="font-medium">{likes}</span>
              </button>
              
              <div className="flex items-center space-x-1 text-gray-400 text-xs">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-2xl transition-colors duration-300 pointer-events-none" />
      </a>
    </motion.div>
  );
};

export default PostCard;