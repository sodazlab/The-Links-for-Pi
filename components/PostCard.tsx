import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Instagram, FileText, Link as LinkIcon, Heart, Eye, AtSign, Pencil, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

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
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [views, setViews] = useState(post.viewsCount);
  const [hasViewed, setHasViewed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Modal states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    showCancel?: boolean;
    onConfirm?: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Check if current user Liked this post
  useEffect(() => {
    if (user) {
      db.checkUserLike(post.id, user.id).then(liked => setIsLiked(liked));
    }
  }, [user, post.id]);

  const isOwner = user?.id === post.userId;

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setModalConfig({
        isOpen: true,
        title: 'Authentication Required',
        message: 'Please connect your Pi wallet to interact with community posts.',
        type: 'warning'
      });
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

    const error = await db.toggleLike(post.id, user.id);
    if (error) {
      if (isLiked) {
        setIsLiked(true);
        setLikes(prev => prev + 1);
      } else {
        setIsLiked(false);
        setLikes(prev => prev - 1);
      }
    }
  };

  const handleCardClick = () => {
    if (!hasViewed) {
      db.incrementView(post.id);
      setViews(prev => prev + 1);
      setHasViewed(true);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/submit', { state: { post } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setModalConfig({
      isOpen: true,
      title: 'Remove Post?',
      message: 'This will permanently delete your post from the platform.',
      type: 'confirm',
      showCancel: true,
      confirmText: 'Delete Now',
      onConfirm: async () => {
        setIsVisible(false);
        const { error } = await db.deletePost(post.id);
        if (error) {
          setIsVisible(true);
          setModalConfig({
            isOpen: true,
            title: 'Deletion Failed',
            message: 'An error occurred while trying to delete the post.',
            type: 'error'
          });
        }
      }
    });
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
      case 'youtube': return 'bg-gradient-to-br from-[#ff0000] via-[#c40404] to-[#282828]';
      case 'x': return 'bg-gradient-to-br from-[#525252] via-[#2d2d2d] to-[#0a0a0a]';
      case 'threads': return 'bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#333333]'; 
      case 'instagram': return 'bg-gradient-to-bl from-[#833ab4] via-[#fd1d1d] to-[#fcb045]';
      case 'article': return 'bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e]';
      default: return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600';
    }
  };

  const isFeatured = variant === 'featured';
  
  if (!isVisible) return null;

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={`relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg ${className} bg-[#1a1a1a]`}
      >
        <a href={post.url} target="_blank" rel="noreferrer" onClick={handleCardClick} className="block w-full h-full cursor-pointer flex flex-col">
          <div className={`absolute inset-0 z-0 ${getBackgroundStyle()} opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-black/20 to-transparent" />
          </div>

          <div className="relative z-10 p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg`}>
                {getIcon()}
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button onClick={handleEdit} className="p-2 rounded-full bg-black/40 hover:bg-white/20 text-white/80 transition backdrop-blur-md border border-white/10"><Pencil size={14} /></button>
                  <button onClick={handleDelete} className="p-2 rounded-full bg-black/40 hover:bg-red-500/20 text-white/80 transition backdrop-blur-md border border-white/10"><Trash2 size={14} /></button>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-2">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">{post.category === 'x' ? 'X' : post.category}</span>
              <h3 className={`font-bold text-white leading-tight drop-shadow-md ${isFeatured ? 'text-2xl md:text-4xl' : 'text-lg line-clamp-2'}`}>{post.title}</h3>
              <p className={`text-gray-200 font-light drop-shadow-sm mt-1 ${isFeatured ? 'text-sm md:text-base line-clamp-3' : variant === 'compact' ? 'text-sm line-clamp-4' : 'text-xs line-clamp-2'}`}>{post.description}</p>
              <div className="flex items-center space-x-4 pt-3 mt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-gray-300">@{post.username}</span>
                <div className="flex-grow" />
                <button onClick={toggleLike} className={`flex items-center space-x-1 text-xs transition-colors duration-200 cursor-pointer ${isLiked ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}>
                  <motion.div whileTap={{ scale: 0.8 }} animate={{ scale: isLiked ? 1.1 : 1 }}><Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /></motion.div>
                  <span className="font-medium">{likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-300 text-xs"><Eye className="w-4 h-4" /><span>{views}</span></div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-2xl transition-colors duration-300 pointer-events-none" />
        </a>
      </motion.div>

      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />
    </>
  );
};

export default PostCard;