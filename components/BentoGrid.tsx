import React from 'react';
import PostCard from '../pages/PostCard';
import { Post } from '../types';

interface BentoGridProps {
  posts: Post[];
}

const BentoGrid: React.FC<BentoGridProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  // We assume we have at least 4-5 posts for the bento grid
  const primary = posts[0];
  const secondary = posts.slice(1, 5);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Weekly Best
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">
        {/* Main Hero Card - Takes up 2x2 space on desktop */}
        {primary && (
          <div className="col-span-1 md:col-span-2 md:row-span-2 h-[300px] md:h-full">
            <PostCard post={primary} variant="featured" className="h-full" />
          </div>
        )}

        {/* Smaller Cards */}
        {secondary.map((post, index) => (
          <div key={post.id} className="col-span-1 md:col-span-1 md:row-span-1 h-[250px] md:h-full">
            <PostCard post={post} variant="standard" className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BentoGrid;