import React from 'react';
import PostCard from './PostCard';
import { Post } from '../types';
import { Trophy } from 'lucide-react';

interface HorizontalRailProps {
  title: string;
  posts: Post[];
}

const HorizontalRail: React.FC<HorizontalRailProps> = ({ title, posts }) => {
  return (
    <div className="w-full py-8 border-t border-b border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            {title}
          </h2>
          <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:text-purple-300">VIEW ALL</span>
        </div>
        
        <div className="relative">
          <div className="flex overflow-x-auto space-x-4 pb-6 scrollbar-hide snap-x no-scrollbar">
            {posts.map((post, index) => (
              <div key={post.id} className="snap-start flex-shrink-0 w-[280px] h-[320px] relative">
                {/* Rank Badge */}
                <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center border-2 border-[#0f0f12]">
                  {index + 1}
                </div>
                <PostCard post={post} variant="standard" className="h-full" />
              </div>
            ))}
          </div>
          
          {/* Fade Effect on the right */}
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0f0f12] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalRail;
