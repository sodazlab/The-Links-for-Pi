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
      <div className="max-w-7xl mx-auto py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 md:px-8 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            {title}
          </h2>
          <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:text-purple-300">VIEW ALL</span>
        </div>
        
        {/* 
          Scroll Container 
          - Designed to fit exactly 5 items on a standard 1280px desktop view without cutoff.
          - Math: (230px * 5) + (20px gap * 4) = ~1230px, fitting within max-w-7xl (1280px).
          - Fallback: Smooth scroll for smaller screens.
        */}
        <div className="relative w-full group">
          <div className="flex overflow-x-auto px-6 md:px-8 space-x-5 pb-8 scrollbar-hide snap-x no-scrollbar">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="snap-start flex-shrink-0"
              >
                {/* 
                  Card Wrapper
                  - Width fixed to 230px to ensure 5 columns fit on desktop.
                  - Relative positioning for the badge.
                */}
                <div className="w-[230px] h-[300px] relative">
                  
                  {/* 
                    Rank Badge - MOVED INSIDE
                    Placed absolutely within the card boundary (top-2 left-2). 
                    This eliminates external clipping issues completely.
                  */}
                  <div className="absolute top-2 left-2 z-20 w-7 h-7 rounded-full bg-yellow-500 text-black font-extrabold text-xs flex items-center justify-center border border-[#0f0f12] shadow-md pointer-events-none">
                    {index + 1}
                  </div>
                  
                  <PostCard post={post} variant="standard" className="h-full shadow-lg" />
                </div>
              </div>
            ))}
            
            {/* Spacer to ensure last item has right-padding when scrolled to end */}
            <div className="w-2 flex-shrink-0" />
          </div>
          
          {/* Subtle fade hints for scrolling on smaller screens */}
          <div className="absolute top-0 right-0 h-[calc(100%-2rem)] w-16 bg-gradient-to-l from-[#0f0f12] to-transparent pointer-events-none opacity-0 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <div className="absolute top-0 left-0 h-[calc(100%-2rem)] w-16 bg-gradient-to-r from-[#0f0f12] to-transparent pointer-events-none opacity-0 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalRail;