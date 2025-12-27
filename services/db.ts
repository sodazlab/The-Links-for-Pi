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
    console.error('Failed to parse mock posts from localStorage', e);
  }
  // Initialize and persist if nothing exists
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
    
    if (error) {
      console.error('Error fetching approved posts:', error);
      return [];
    }
    
    return (data || []).map((p: any) => ({
      ...p,
      userId: p.user_id,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
      imageUrl: p.image_url
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

    if (error) {
      console.error(`Error fetching ${status} posts:`, error);
      return [];
    }
    
    return (data || []).map((p: any) => ({
      ...p,
      userId: p.user_id,
      likesCount: p.likes_count,
      viewsCount: p.views_count,
      createdAt: p.created_at,
      imageUrl: p.image_url
    }));
  },

  createPost: async (post: Partial<Post>) => {
    const imageToSave = post.imageUrl || `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`;

    if (!isConfigured) {
      const newPost: Post = {
        id: 'mock-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        userId: post.userId || 'anon',
        username: post.username || 'Anonymous',
        title: post.title || 'No Title',
        description: post.description || '',
        url: post.url || '',
        category: post.category || 'other',
        status: 'pending',
        likesCount: 0,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        imageUrl: imageToSave
      };
      
      const currentPosts = getMockPosts();
      const updatedPosts = [newPost, ...currentPosts];
      saveMockPosts(updatedPosts);
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
        String(p.id) === String(postId) ? { ...p, ...updates } : p
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
        category: updates.category
      })
      .eq('id', postId);

    return { error };
  },

  deletePost: async (postId: string) => {
    console.log(`DB Operation: Deleting post ID ${postId}`);
    if (!isConfigured) {
      const posts = getMockPosts();
      const initialCount = posts.length;
      const filteredPosts = posts.filter(p => String(p.id) !== String(postId));
      
      if (initialCount === filteredPosts.length) {
        console.warn(`Post with ID ${postId} not found in mock storage.`);
      }

      saveMockPosts(filteredPosts);
      console.log(`Mock deletion complete. Post count: ${filteredPosts.length}`);
      return { error: null };
    }

    // Try deleting likes first for referential integrity
    try {
      await supabase.from('likes').delete().eq('post_id', postId);
    } catch (e) {
      console.log('Cleanup likes failed or not needed');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) console.error('Supabase deletion error:', error);
    return { error };
  },

  updatePostStatus: async (id: string, status: PostStatus) => {
    if (!isConfigured) {
      const posts = getMockPosts();
      const updated = posts.map(p => String(p.id) === String(id) ? { ...p, status } : p);
      saveMockPosts(updated);
      return null;
    }

    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', id);
      
    if (error) console.error('Error updating status:', error);
    return error;
  },

  checkUserLike: async (postId: string, userId: string): Promise<boolean> => {
    if (!isConfigured) {
      const key = `like_${userId}_${postId}`;
      return !!localStorage.getItem(key);
    }
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data && !error;
  },

  toggleLike: async (postId: string, userId: string) => {
    if (!isConfigured) {
      const key = `like_${userId}_${postId}`;
      const exists = localStorage.getItem(key);
      const posts = getMockPosts();
      let updatedPosts = [...posts];
      
      if (exists) {
        localStorage.removeItem(key);
        updatedPosts = updatedPosts.map(p => String(p.id) === String(postId) ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p);
      } else {
        localStorage.setItem(key, 'true');
        updatedPosts = updatedPosts.map(p => String(p.id) === String(postId) ? { ...p, likesCount: p.likesCount + 1 } : p);
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
      const updated = posts.map(p => String(p.id) === String(postId) ? { ...p, viewsCount: p.viewsCount + 1 } : p);
      saveMockPosts(updated);
      return null;
    }
    const { error } = await supabase.rpc('increment_view', { post_id_input: postId });
    return error;
  }
};