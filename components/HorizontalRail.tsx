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
    <div className="w-full border-t border-b border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            {title}
          </h2>
          <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:text-purple-300">VIEW ALL</span>
        </div>
        
        {/* 
          Scroll Container Area 
          - Removed negative margins that caused boundary clipping issues.
          - py-12 (48px): Provides massive vertical safe area for badges (-12px) + Hover Scale + Shadows.
          - pl-6 / md:pl-8: Ensures the first card's badge (-left-3) is visually inside the screen.
          - space-x-6: More breathing room between cards.
        */}
        <div className="relative w-full">
          <div className="flex overflow-x-auto py-12 px-6 md:px-8 space-x-6 scrollbar-hide snap-x no-scrollbar">
            {posts.map((post, index) => (
              <div key={post.id} className="snap-start flex-shrink-0 w-[280px] h-[340px] relative mt-2 ml-2">
                {/* Rank Badge - Positioned absolutely relative to this wrapper */}
                <div className="absolute -top-4 -left-4 z-30 w-9 h-9 rounded-full bg-yellow-500 text-black font-extrabold text-sm flex items-center justify-center border-4 border-[#0f0f12] shadow-lg">
                  {index + 1}
                </div>
                
                {/* Post Card */}
                <PostCard post={post} variant="standard" className="h-full shadow-xl" />
              </div>
            ))}
          </div>
          
          {/* Fade Overlay - Visual cue for scrolling */}
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0f0f12] via-[#0f0f12]/50 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalRail;