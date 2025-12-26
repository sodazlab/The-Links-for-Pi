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
        <div className="flex items-center justify-between px-6 md:px-8 pt-8 mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            {title}
          </h2>
          <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:text-purple-300">VIEW ALL</span>
        </div>
        
        {/* 
          Scroll Container 
          - pb-10: Provides space for bottom shadows and hover effects
          - px-6: Outer padding for the rail start/end
        */}
        <div className="relative w-full">
          <div className="flex overflow-x-auto pb-10 px-6 md:px-8 scrollbar-hide snap-x no-scrollbar">
            {posts.map((post, index) => (
              // Wrapper Div: acts as a buffer zone.
              // pl-5 pt-5: Pushes the inner card down/right, creating "internal" space for the absolute badge.
              // This ensures the badge is technically "inside" this div, so overflow-auto won't clip it.
              <div 
                key={post.id} 
                className="snap-start flex-shrink-0 relative pl-5 pt-5 pr-3"
              >
                {/* 
                  Container for Card + Badge 
                  Width reduced to 260px to fit ~5 items on standard 1280px screens 
                */}
                <div className="w-[260px] h-[320px] relative group">
                  
                  {/* Rank Badge: Positioned at the top-left of the WRAPPER's padding area */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 rounded-full bg-yellow-500 text-black font-extrabold text-sm flex items-center justify-center border-2 border-[#0f0f12] shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                    {index + 1}
                  </div>
                  
                  <PostCard post={post} variant="standard" className="h-full shadow-lg" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Fade Overlay - Right side only */}
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0f0f12] via-[#0f0f12]/40 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalRail;