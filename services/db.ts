import { supabase, isConfigured } from './supabase';
import { Post, PostStatus } from '../types';

export const db = {
  // Fetch all approved posts
  getApprovedPosts: async (): Promise<Post[]> => {
    if (!isConfigured) return [];

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

  // Fetch pending posts for admin
  getPendingPosts: async (): Promise<Post[]> => {
    if (!isConfigured) return [];

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending posts:', error.message || error);
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

  // Create a new post
  createPost: async (post: Partial<Post>) => {
    if (!isConfigured) {
      return { data: null, error: { message: 'Database not configured. Cannot save post.' } };
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
        // image_url: post.imageUrl
      }])
      .select(); // Ensure we get the return data
    
    if (error) {
      console.error('Error creating post:', error.message || error);
    }

    return { data, error };
  },

  // Update post status
  updatePostStatus: async (id: string, status: PostStatus) => {
    if (!isConfigured) return { message: 'Database not configured' };

    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', id);
      
    if (error) console.error('Error updating status:', error.message || error);
    return error;
  },

  // Check if user liked a post
  checkUserLike: async (postId: string, userId: string): Promise<boolean> => {
    if (!isConfigured) return false;

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
    if (!isConfigured) return { message: 'Database not configured' };

    const { error } = await supabase
      .rpc('toggle_like', { post_id_input: postId, user_id_input: userId });
      
    if (error) console.error('Error toggling like:', error.message || error);
    return error;
  },

  // Increment View (RPC)
  incrementView: async (postId: string) => {
    if (!isConfigured) return { message: 'Database not configured' };

    const { error } = await supabase
      .rpc('increment_view', { post_id_input: postId });

    if (error) console.error('Error incrementing view:', error.message || error);
    return error;
  }
};