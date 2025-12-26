import { supabase, isConfigured } from './supabase';
import { Post, PostStatus } from '../types';
import { MOCK_POSTS } from './mockData';

// Helper for Mock Mode persistence
const LOCAL_STORAGE_KEY = 'pi_links_mock_posts';

const getMockPosts = (): Post[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to parse mock posts', e);
  }
  // Initialize with default mocks if empty or error
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_POSTS));
  return MOCK_POSTS;
};

const saveMockPosts = (posts: Post[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

export const db = {
  // Fetch all approved posts
  getApprovedPosts: async (): Promise<Post[]> => {
    if (!isConfigured) {
      // Mock Mode
      const posts = getMockPosts();
      return posts.filter(p => p.status === 'approved');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error.message || error);
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

  // Fetch posts by specific status (Admin usage)
  getPostsByStatus: async (status: PostStatus): Promise<Post[]> => {
    if (!isConfigured) {
      // Mock Mode
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
      console.error(`Error fetching ${status} posts:`, error.message || error);
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

  // Fetch pending posts (Deprecated in favor of getPostsByStatus, kept for backward compat if needed)
  getPendingPosts: async (): Promise<Post[]> => {
    return db.getPostsByStatus('pending');
  },

  // Create a new post
  createPost: async (post: Partial<Post>) => {
    // Generate a placeholder image if none provided
    const imageToSave = post.imageUrl || `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`;

    if (!isConfigured) {
      // Mock Mode: Save to local storage
      const newPost: Post = {
        id: 'mock-' + Date.now(),
        userId: post.userId || 'anon',
        username: post.username || 'Anonymous',
        title: post.title || 'No Title',
        description: post.description || '',
        url: post.url || '',
        category: post.category || 'other',
        status: 'pending', // Default to pending
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
      .select(); // Ensure we get the return data
    
    if (error) {
      console.error('Error creating post:', error.message || error);
    }

    return { data, error };
  },

  // Update an existing post
  updatePost: async (postId: string, updates: Partial<Post>) => {
    if (!isConfigured) {
      // Mock Mode
      const posts = getMockPosts();
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, ...updates } : p
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

    if (error) console.error('Error updating post:', error.message);
    return { error };
  },

  // Delete a post
  deletePost: async (postId: string) => {
    if (!isConfigured) {
      // Mock Mode
      const posts = getMockPosts();
      const filteredPosts = posts.filter(p => p.id !== postId);
      saveMockPosts(filteredPosts);
      return { error: null };
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) console.error('Error deleting post:', error.message);
    return { error };
  },

  // Update post status
  updatePostStatus: async (id: string, status: PostStatus) => {
    if (!isConfigured) {
      // Mock Mode
      const posts = getMockPosts();
      const updated = posts.map(p => p.id === id ? { ...p, status } : p);
      saveMockPosts(updated);
      return null; // no error
    }

    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', id);
      
    if (error) console.error('Error updating status:', error.message || error);
    return error;
  },

  // Check if user liked a post
  checkUserLike: async (postId: string, userId: string): Promise<boolean> => {
    if (!isConfigured) {
      // Mock Mode: Simple localstorage check
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

  // Toggle Like (RPC)
  toggleLike: async (postId: string, userId: string) => {
    if (!isConfigured) {
      // Mock Mode: Toggle local state
      const key = `like_${userId}_${postId}`;
      const exists = localStorage.getItem(key);
      
      const posts = getMockPosts();
      let updatedPosts = [...posts];
      
      if (exists) {
        localStorage.removeItem(key);
        // Decrement mock count
        updatedPosts = updatedPosts.map(p => p.id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p);
      } else {
        localStorage.setItem(key, 'true');
        // Increment mock count
        updatedPosts = updatedPosts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p);
      }
      saveMockPosts(updatedPosts);
      return null;
    }

    // Try RPC first (best for concurrency)
    const { error } = await supabase
      .rpc('toggle_like', { post_id_input: postId, user_id_input: userId });
      
    if (error) {
        console.error('Error toggling like (RPC):', error.message);
        // Fallback: If RPC fails (e.g., function not created), try manual insert/delete
        // This is less safe for concurrency but works for basic setups
        const { data: existingLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existingLike) {
            await supabase.from('likes').delete().eq('id', existingLike.id);
            await supabase.rpc('decrement_likes', { post_id_input: postId }).catch(() => {
                 // manual update if rpc missing
                 // This part is tricky without rpc, so we just log
                 console.warn("Could not decrement likes count without RPC");
            });
        } else {
            await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
             await supabase.rpc('increment_likes', { post_id_input: postId }).catch(() => {
                 console.warn("Could not increment likes count without RPC");
            });
        }
    }
    return error;
  },

  // Increment View (RPC)
  incrementView: async (postId: string) => {
    if (!isConfigured) {
      // Mock Mode
      const posts = getMockPosts();
      const updated = posts.map(p => p.id === postId ? { ...p, viewsCount: p.viewsCount + 1 } : p);
      saveMockPosts(updated);
      return null;
    }

    const { error } = await supabase
      .rpc('increment_view', { post_id_input: postId });

    if (error) {
         console.error('Error incrementing view:', error.message || error);
         // Fallback if RPC is missing
         // We generally don't manually update views from client to avoid spam, so we just ignore if RPC fails
    }
    return error;
  }
};