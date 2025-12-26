import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Instagram, FileText, Link as LinkIcon, Heart, Eye, AtSign } from 'lucide-react';
import { Post } from '../types';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';

interface PostCardProps {
  post: Post;
  variant?: 'compact' | 'standard' | 'featured';
  className?: string;
}

// Custom X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
      case 'x': return <XLogo className="w-5 h-5 text-white" />;
      case 'threads': return <AtSign className="w-5 h-5 text-white" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-white" />;
      case 'article': return <FileText className="w-5 h-5 text-white" />;
      default: return <LinkIcon className="w-5 h-5 text-white" />;
    }
  };

  const getBackgroundStyle = () => {
    switch (post.category) {
      case 'youtube': 
        return 'bg-gradient-to-br from-[#ff0000] via-[#c40404] to-[#282828]';
      case 'x': 
        return 'bg-gradient-to-br from-[#14171A] via-[#000000] to-[#657786]';
      case 'threads': 
        return 'bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#333333]'; 
      case 'instagram': 
        return 'bg-gradient-to-bl from-[#833ab4] via-[#fd1d1d] to-[#fcb045]';
      case 'article': 
        return 'bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e]';
      default: 
        return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600';
    }
  };

  const isFeatured = variant === 'featured';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg ${className} bg-[#1a1a1a]`}
    >
      <a href={post.url} target="_blank" rel="noreferrer" onClick={handleCardClick} className="block w-full h-full cursor-pointer flex flex-col">
        
        {/* Modern Color Background (Replaces Image) */}
        <div className={`absolute inset-0 z-0 ${getBackgroundStyle()} opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700`}>
          {/* Abstract Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
             {/* Category Icon */}
            <div className={`p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg`}>
              {getIcon()}
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center space-x-2">
               <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">
                 {post.category === 'x' ? 'X' : post.category}
               </span>
            </div>
            
            <h3 className={`font-bold text-white leading-tight drop-shadow-md ${isFeatured ? 'text-2xl md:text-4xl' : 'text-lg line-clamp-2'}`}>
              {post.title}
            </h3>
            
            {/* Display description for all variants, adjusting lines based on size */}
            <p className={`text-gray-200 font-light drop-shadow-sm mt-1 ${
              isFeatured ? 'text-sm md:text-base line-clamp-3' : 
              variant === 'compact' ? 'text-sm line-clamp-4' : 
              'text-xs line-clamp-2'
            }`}>
              {post.description}
            </p>

            <div className="flex items-center space-x-4 pt-3 mt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                 {/* Avatar placeholder if needed, or just username */}
                 <span className="text-xs font-semibold text-gray-300">@{post.username}</span>
              </div>
              
              <div className="flex-grow" />

              <button 
                onClick={toggleLike}
                className={`flex items-center space-x-1 text-xs transition-colors duration-200 cursor-pointer ${isLiked ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}
                title={isLiked ? "Unlike" : "Like"}
              >
                <motion.div whileTap={{ scale: 0.8 }} animate={{ scale: isLiked ? 1.1 : 1 }}>
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
                <span className="font-medium">{likes}</span>
              </button>
              
              <div className="flex items-center space-x-1 text-gray-300 text-xs">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover Border Glow Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-2xl transition-colors duration-300 pointer-events-none" />
      </a>
    </motion.div>
  );
};

export default PostCard;