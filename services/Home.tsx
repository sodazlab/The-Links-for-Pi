import React, { useMemo, useState, useEffect } from 'react';
import BentoGrid from '../components/BentoGrid';
import HorizontalRail from '../components/HorizontalRail';
import MasonryGrid from '../components/MasonryGrid';
import { db } from '../services/db';
import { Post, PostCategory } from '../types';
import { useLanguage } from '../services/languageContext';
import { Loader2, Grid, Play, Instagram, FileText, Link as LinkIcon, Layers, AtSign } from 'lucide-react';

// Custom X Logo for Filter Bar
const XLogoIcon = ({ size = 14 }: { size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    aria-hidden="true" 
    width={size} 
    height={size} 
    className="fill-current"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');

  const CATEGORIES: { id: PostCategory | 'all'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t('home.cats.all'), icon: Grid },
    { id: 'youtube', label: 'YouTube', icon: Play },
    { id: 'x', label: 'X', icon: XLogoIcon },
    { id: 'threads', label: 'Threads', icon: AtSign },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'article', label: t('home.cats.article'), icon: FileText },
    { id: 'other', label: t('home.cats.other'), icon: LinkIcon },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await db.getApprovedPosts();
      setPosts(data);
      setLoading(false);
    };
    
    fetchPosts();
  }, []);
  
  // First filter by category
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return posts;
    return posts.filter(p => p.category === activeCategory);
  }, [posts, activeCategory]);

  // Then sort for specific sections based on the filtered list
  
  // 1. Weekly Best: Likes -> Views -> Newest
  const heroPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount; // 1순위: 좋아요
      if (b.viewsCount !== a.viewsCount) return b.viewsCount - a.viewsCount; // 2순위: 조회수
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 3순위: 최신순
    }).slice(0, 5);
  }, [filteredPosts]);

  // 2. Hall of Fame: Views -> Likes -> Newest
  const famePosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (b.viewsCount !== a.viewsCount) return b.viewsCount - a.viewsCount; // 1순위: 조회수
      if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount; // 2순위: 좋아요
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 3순위: 최신순
    }).slice(0, 10);
  }, [filteredPosts]);

  // 3. Fresh Feeds: Newest -> Likes
  const freshPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.likesCount - a.likesCount;
    });
  }, [filteredPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Category Filter Bar */}
      <div className="sticky top-16 z-40 bg-[#0f0f12]/90 backdrop-blur-md border-b border-white/5 py-4 mb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as PostCategory | 'all')}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <Layers className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white">{t('home.no_posts')}</h3>
          <p className="text-gray-400 mt-2">{t('home.no_posts_desc')}</p>
          <button 
            onClick={() => setActiveCategory('all')}
            className="mt-6 px-6 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition"
          >
            {t('home.clear_filter')}
          </button>
        </div>
      ) : (
        <>
          <section className="animate-fade-in-up">
            <BentoGrid posts={heroPosts} />
          </section>
          
          <section className="mt-8 animate-fade-in-up delay-100">
            <HorizontalRail title="" posts={famePosts} />
          </section>
          
          <section className="mt-8 animate-fade-in-up delay-200">
            <MasonryGrid posts={freshPosts} />
          </section>
        </>
      )}
    </div>
  );
};

export default Home;