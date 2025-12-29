import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Instagram, FileText, Link as LinkIcon, Heart, Eye, AtSign, Pencil, Trash2, Share2 } from 'lucide-react';
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 공유 데이터 설정
    const shareData = {
      title: post.title,
      text: post.description,
      url: post.url.startsWith('http') ? post.url : window.location.origin + post.url,
    };

    // 모바일 네이티브 공유 API 호출 (기기 시스템 메뉴)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return; // 성공 시 종료
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err);
        } else {
          return; // 사용자가 취소한 경우 종료
        }
      }
    }

    // 네이티브 공유 불가 시 (PC 브라우저 등) 클립보드 복사 실행
    copyToClipboard();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(post.url);
      setModalConfig({
        isOpen: true,
        title: t('card.share_title'),
        message: t('card.share_copied'),
        type: 'success',
        confirmText: 'OK'
      });
    } catch (err) {
      console.error('Failed to copy', err);
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
            message: 'An error occurred while deleting the post.',
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
        whileHover={{ scale: 1.01 }}
        className={`relative group overflow-hidden rounded-[2rem] border border-white/10 shadow-lg ${className} bg-[#1a1a20] flex flex-col`}
      >
        <a href={post.url} target="_blank" rel="noreferrer" onClick={handleCardClick} className="flex-grow flex flex-col p-5 md:p-6 relative h-full">
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-60 transition-opacity group-hover:opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Header Icons */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                  {getIcon()}
                </div>
                {post.language && (
                  <div className="flex items-center justify-center h-[40px] px-3 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl text-[10px] font-black uppercase tracking-wider text-gray-300">
                    {post.language}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-1.5">
                  <button onClick={handleEdit} className="p-2.5 rounded-lg bg-black/40 hover:bg-white/10 text-white/50 hover:text-white transition backdrop-blur-md border border-white/10">
                    <Pencil size={14} />
                  </button>
                  <button onClick={handleDelete} className="p-2.5 rounded-lg bg-black/40 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition backdrop-blur-md border border-white/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow min-h-0 mb-4">
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] bg-white/10 px-2 py-0.5 rounded border border-white/5">
                   {post.category}
                 </span>
                 <span className="text-[10px] font-bold text-gray-400 truncate">@{post.username}</span>
              </div>
              
              <h3 className={`font-black text-white leading-tight drop-shadow-2xl overflow-visible whitespace-normal ${
                variant === 'featured' 
                  ? 'text-xl md:text-2xl mb-2' // featured는 제목을 줄이지 않음
                  : 'text-base md:text-lg line-clamp-2'
              }`}>
                {post.title}
              </h3>
              
              <p className={`font-medium leading-snug transition-opacity overflow-hidden ${
                variant === 'featured' 
                  ? 'text-xs md:text-sm text-gray-300 opacity-90 line-clamp-3' 
                  : 'text-[11px] md:text-xs text-gray-400 opacity-80 line-clamp-2'
              }`}>
                {post.description}
              </p>
            </div>
            
            {/* Footer Row - Fixed to bottom */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
              <div className="flex items-center space-x-4">
                <button onClick={toggleLike} className={`flex items-center space-x-1.5 text-xs transition-all ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                  <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                  <span className="font-black">{likes}</span>
                </button>
                <div className="flex items-center space-x-1.5 text-gray-400 text-xs font-black">
                  <Eye size={14} />
                  <span>{views}</span>
                </div>
              </div>

              <button 
                onClick={handleShare}
                className="flex items-center justify-center text-gray-400 hover:text-white transition-colors p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 active:scale-90"
                aria-label="Share Link"
              >
                <Share2 size={16} />
              </button>
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