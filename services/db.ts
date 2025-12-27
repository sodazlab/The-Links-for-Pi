import { supabase, isConfigured } from './supabase';
import { Post, PostStatus } from '../types';
import { MOCK_POSTS } from './mockData';

const LOCAL_STORAGE_KEY = 'pi_links_mock_posts';

const getMockPosts = (): Post[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse mock posts', e);
  }
  // 기본 데이터로 초기화
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_POSTS));
  return MOCK_POSTS;
};

const saveMockPosts = (posts: Post[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

export const db = {
  getApprovedPosts: async (): Promise<Post[]> => {
    if (!isConfigured) {
      const posts = getMockPosts();
      return posts.filter(p => p.status === 'approved');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    
    return (data || []).map((p: any) => ({
      ...p,
      userId: p.user_id,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
      imageUrl: p.image_url,
      language: p.language || 'en'
    }));
  },

  getPostsByStatus: async (status: PostStatus): Promise<Post[]> => {
    if (!isConfigured) {
      const posts = getMockPosts();
      return posts
        .filter(p => p.status === status)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) return [];
    
    return (data || []).map((p: any) => ({
      ...p,
      userId: p.user_id,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
      imageUrl: p.image_url,
      language: p.language || 'en'
    }));
  },

  createPost: async (post: Partial<Post>) => {
    const imageToSave = post.imageUrl || `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`;

    if (!isConfigured) {
      const newPost: Post = {
        id: String(Date.now() + Math.floor(Math.random() * 1000)),
        userId: post.userId || 'anon',
        username: post.username || 'Anonymous',
        title: post.title || 'No Title',
        description: post.description || '',
        url: post.url || '',
        category: post.category || 'other',
        language: post.language || 'en',
        status: 'pending',
        likesCount: 0,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        imageUrl: imageToSave
      };
      
      const currentPosts = getMockPosts();
      saveMockPosts([newPost, ...currentPosts]);
      return { data: [newPost], error: null };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: post.userId,
        username: post.username,
        title: post.title,
        description: post.description,
        url: post.url,
        category: post.category,
        language: post.language || 'en',
        status: 'pending',
        likes_count: 0,
        views_count: 0,
        image_url: imageToSave
      }])
      .select(); 

    return { data, error };
  },

  updatePost: async (postId: string, updates: Partial<Post>) => {
    if (!isConfigured) {
      const posts = getMockPosts();
      const updatedPosts = posts.map(p => 
        String(p.id).trim() === String(postId).trim() ? { ...p, ...updates } : p
      );
      saveMockPosts(updatedPosts);
      return { error: null };
    }

    const { error } = await supabase
      .from('posts')
      .update({
        title: updates.title,
        description: updates.description,
        url: updates.url,
        category: updates.category,
        language: updates.language
      })
      .eq('id', postId);

    return { error };
  },

  deletePost: async (postId: string) => {
    console.log(`[DB] Attempting to delete post ID: ${postId}`);
    
    if (!isConfigured) {
      const posts = getMockPosts();
      const initialCount = posts.length;
      const filtered = posts.filter(p => String(p.id).trim() !== String(postId).trim());
      
      if (initialCount === filtered.length) {
        console.error(`[Mock] Post with ID ${postId} not found. Deletion ignored.`);
        return { error: 'Post not found' };
      }

      saveMockPosts(filtered);
      console.log(`[Mock] Deleted successfully. New count: ${filtered.length}`);
      return { error: null };
    }

    // Supabase 환경: 외래 키 제약 조건 해결을 위해 좋아요 데이터 먼저 삭제
    try {
      await supabase.from('likes').delete().eq('post_id', postId);
    } catch (e) {
      console.warn('[Supabase] Likes cleanup failed (might not exist)', e);
    }

    // 실제 포스트 삭제
    const { error, status } = await supabase.from('posts').delete().eq('id', postId);
    
    if (error) {
      console.error('[Supabase] Delete error:', error);
      return { error };
    }

    // Supabase RLS 정책 때문에 삭제가 거부되었는데 오류는 안 날 수 있음 (204 No Content 반환 시)
    console.log(`[Supabase] Delete request finished. Status: ${status}`);
    return { error: null };
  },

  updatePostStatus: async (id: string, status: PostStatus) => {
    if (!isConfigured) {
      const posts = getMockPosts();
      const updated = posts.map(p => String(p.id).trim() === String(id).trim() ? { ...p, status } : p);
      saveMockPosts(updated);
      return null;
    }

    const { error } = await supabase.from('posts').update({ status }).eq('id', id);
    return error;
  },

  checkUserLike: async (postId: string, userId: string): Promise<boolean> => {
    if (!isConfigured) {
      const key = `like_${userId}_${postId}`;
      return !!localStorage.getItem(key);
    }
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data;
  },

  toggleLike: async (postId: string, userId: string) => {
    if (!isConfigured) {
      const key = `like_${userId}_${postId}`;
      const exists = localStorage.getItem(key);
      const posts = getMockPosts();
      let updatedPosts = [...posts];
      
      const targetId = String(postId).trim();
      if (exists) {
        localStorage.removeItem(key);
        updatedPosts = updatedPosts.map(p => String(p.id).trim() === targetId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p);
      } else {
        localStorage.setItem(key, 'true');
        updatedPosts = updatedPosts.map(p => String(p.id).trim() === targetId ? { ...p, likesCount: p.likesCount + 1 } : p);
      }
      saveMockPosts(updatedPosts);
      return null;
    }
    const { error } = await supabase.rpc('toggle_like', { post_id_input: postId, user_id_input: userId });
    return error;
  },

  incrementView: async (postId: string) => {
    if (!isConfigured) {
      const posts = getMockPosts();
      const targetId = String(postId).trim();
      const updated = posts.map(p => String(p.id).trim() === targetId ? { ...p, viewsCount: p.viewsCount + 1 } : p);
      saveMockPosts(updated);
      return null;
    }
    return await supabase.rpc('increment_view', { post_id_input: postId });
  }
};