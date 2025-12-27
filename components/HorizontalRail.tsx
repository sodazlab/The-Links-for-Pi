import React from 'react';
import PostCard from '../pages/PostCard';
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
        <div className="flex items-center justify-between px-6 md:px-8 mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5" />
            {title}
          </h2>
          <span className="text-xs text-purple-400 font-semibold cursor-pointer hover:text-purple-300">VIEW ALL</span>
        </div>
        
        {/* 
          Robust Scroll Container Architecture
          1. py-10: Massive vertical buffer. Ensures hover scales & shadows are NEVER clipped.
          2. gap-6: Comfortable spacing between items.
          3. snap-x: Forces clean alignment after scrolling.
          4. scroll-pl-8: Ensures the first item aligns with the page layout when snapped.
        */}
        <div className="relative group w-full">
          
          <div className="
            flex overflow-x-auto 
            gap-6 
            px-6 md:px-8 
            pb-12 pt-4 
            snap-x snap-mandatory 
            scrollbar-hide 
            scroll-smooth
          ">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="snap-start flex-shrink-0 relative"
              >
                {/* 
                  Card Wrapper 
                  - Responsive width: 260px on mobile, 280px on desktop for better readability.
                  - Independent of container width calculations.
                */}
                <div className="w-[260px] md:w-[280px] h-[320px] relative">
                  
                  {/* Rank Badge - Safely positioned inside the card area */}
                  <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-yellow-500 text-black font-extrabold text-sm flex items-center justify-center border border-[#0f0f12] shadow-lg pointer-events-none">
                    {index + 1}
                  </div>
                  
                  <PostCard post={post} variant="standard" className="h-full shadow-lg" />
                </div>
              </div>
            ))}
            
            {/* End Spacer: Prevents the last item from being flush against the viewport edge */}
            <div className="w-2 md:w-4 flex-shrink-0" />
          </div>
          
          {/* 
            Gradient Masks 
            - Provides a visual cue that there is more content.
            - Softens the "hard cut" of the off-screen items.
          */}
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f0f12] via-[#0f0f12]/60 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0f0f12] to-transparent pointer-events-none z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalRail;