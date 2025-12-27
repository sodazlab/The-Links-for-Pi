import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Instagram, FileText, Link as LinkIcon, Heart, Eye, AtSign, Pencil, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

interface PostCardProps {
  post: Post;
  variant?: 'compact' | 'standard' | 'featured';
  className?: string;
}

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PostCard: React.FC<PostCardProps> = ({ post, variant = 'standard', className = '' }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [views, setViews] = useState(post.viewsCount);
  const [hasViewed, setHasViewed] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    showCancel?: boolean;
    onConfirm?: () => Promise<void> | void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
        title: 'Community Interaction',
        message: t('card.login_req'),
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    
    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(prev => prevLiked ? prev - 1 : prev + 1);

    const error = await db.toggleLike(post.id, user.id);
    if (error) {
      setIsLiked(prevLiked);
      setLikes(prev => prevLiked ? prev + 1 : prev - 1);
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
      title: t('card.delete_confirm'),
      message: t('card.delete_msg'),
      type: 'confirm',
      showCancel: true,
      confirmText: t('card.delete_btn'),
      onConfirm: async () => {
        const { error } = await db.deletePost(post.id);
        if (error) {
          setModalConfig({
            isOpen: true,
            title: 'Action Failed',
            message: 'An error occurred while deleting the post. Please check permissions.',
            type: 'error'
          });
        } else {
          window.location.reload();
        }
      }
    });
  };

  const getIcon = () => {
    switch (post.category) {
      case 'youtube': return <Play className="w-4 h-4 text-white" fill="currentColor" />;
      case 'x': return <XLogo className="w-4 h-4 text-white" />;
      case 'threads': return <AtSign className="w-4 h-4 text-white" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-white" />;
      case 'article': return <FileText className="w-4 h-4 text-white" />;
      default: return <LinkIcon className="w-4 h-4 text-white" />;
    }
  };

  const getGradient = () => {
    switch (post.category) {
      case 'youtube': return 'from-[#ff0000]/30 to-[#120524]';
      case 'x': return 'from-[#525252]/30 to-[#120524]';
      case 'instagram': return 'from-[#fd1d1d]/20 to-[#120524]';
      case 'article': return 'from-[#0f0c29]/40 to-[#120524]';
      default: return 'from-purple-600/20 to-[#120524]';
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`relative group overflow-hidden rounded-3xl border border-white/10 shadow-lg ${className} bg-[#1a1a1a] flex flex-col`}
      >
        <a href={post.url} target="_blank" rel="noreferrer" onClick={handleCardClick} className="flex-grow flex flex-col p-5 relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-60 transition-opacity group-hover:opacity-80`} />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                  {getIcon()}
                </div>
                {/* Language Badge */}
                {post.language && (
                  <div className="flex items-center justify-center p-2.5 h-[38px] min-w-[38px] rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl text-[10px] font-black uppercase tracking-wider text-gray-300">
                    {post.language}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button onClick={handleEdit} className="p-2 rounded-xl bg-black/40 hover:bg-white/10 text-white/50 hover:text-white transition backdrop-blur-md border border-white/10">
                    <Pencil size={12} />
                  </button>
                  <button onClick={handleDelete} className="p-2 rounded-xl bg-black/40 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition backdrop-blur-md border border-white/10">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                   {post.category}
                 </span>
                 <span className="text-[9px] font-bold text-gray-500">@{post.username}</span>
              </div>
              
              <h3 className={`font-black text-white leading-tight drop-shadow-2xl ${variant === 'featured' ? 'text-xl md:text-2xl' : 'text-base line-clamp-2'}`}>
                {post.title}
              </h3>
              
              <p className="text-gray-400 font-medium text-[10px] mt-2 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                {post.description}
              </p>
              
              <div className="flex items-center space-x-4 pt-3 mt-3 border-t border-white/5">
                <button onClick={toggleLike} className={`flex items-center space-x-1.5 text-xs transition-all ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                  <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                  <span className="font-black">{likes}</span>
                </button>
                <div className="flex items-center space-x-1.5 text-gray-400 text-xs font-black">
                  <Eye size={14} />
                  <span>{views}</span>
                </div>
              </div>
            </div>
          </div>
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