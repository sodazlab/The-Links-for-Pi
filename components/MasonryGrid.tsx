import React from 'react';
import PostCard from '../pages/PostCard';
import { Post } from '../types';
import { Zap } from 'lucide-react';
import { useLanguage } from '../services/languageContext';

interface MasonryGridProps {
  posts: Post[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ posts }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="text-cyan-400 w-5 h-5" />
        {t('home.fresh_feeds')}
      </h2>
      
      <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid">
            <PostCard post={post} className="mb-3 h-auto aspect-auto" variant="compact" />
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition text-gray-300">
          {t('home.load_more')}
        </button>
      </div>
    </div>
  );
};

export default MasonryGrid;