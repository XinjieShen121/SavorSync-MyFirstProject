import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { postAPI } from '../../services/apiCommunity';
import { getAllPosts, getTrendingPosts, updatePost, deletePost } from '../../services/apiPosts';
import './CommunityPage.css';

interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  category: string;
  type: 'recipe' | 'story';
  author: string;
  authorId?: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: string[];
  comments?: any[];
  createdAt: string;
  isLiked?: boolean;
}

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'my-posts'>('feed');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  // Refresh posts when user returns to the page (e.g., after creating a post)
  useEffect(() => {
    const handleFocus = () => {
      fetchPosts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Refresh posts when returning from create post page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchPosts();
      // Show success message if coming from create post
      if (location.state?.success) {
        setSuccessMessage(location.state.success);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      }
      // Clear the refresh flag
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 'trending':
          response = await getTrendingPosts();
          break;
        case 'my-posts':
          if (user) {
            // For my posts, we'll filter by the current user
            response = await getAllPosts({ author: user.name });
          } else {
            response = { data: { posts: [] } };
          }
          break;
        default:
          // Show all posts in feed
          response = await getAllPosts();
      }
      
      // Extract posts from response
      const postsData = response.data?.posts || [];
      
      // Mark posts as liked by current user
      const postsWithLikeStatus = postsData.map((post: Post) => ({
        ...post,
        isLiked: user ? post.likes?.includes(user.id) : false
      }));
      
      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return;
    }

    try {
      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked 
                  ? post.likes.filter(id => id !== user?.id)
                  : [...post.likes, user?.id || '']
              }
            : post
        )
      );

      // API call
      await postAPI.toggleLike(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update
      fetchPosts();
    }
  };

  const handleEdit = (post: Post) => {
    navigate('/create-post', { 
      state: { 
        editMode: true, 
        post: post 
      } 
    });
  };

  const handleDelete = async (postId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to delete posts');
      return;
    }

    console.log('DELETE: User authentication check:', {
      isAuthenticated,
      user: user ? { id: user.id, name: user.name } : 'No user',
      token: localStorage.getItem('token') ? 'Present' : 'Missing'
    });

    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      console.log('Attempting to delete post:', postId);
      const response = await deletePost(postId);
      console.log('Delete response:', response);
      
      // Remove the post from the list
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setSuccessMessage('Post deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to delete post. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Delete failed: ${errorMessage}`);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/create-post');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="community-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="community-container">
        {/* Header */}
        <div className="community-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="header-content">
            <h1>Community</h1>
            <p>Share recipes and stories with food lovers around the world</p>
          </div>
          {isAuthenticated && (
            <button className="create-post-btn" onClick={handleCreatePost}>
              <i className="bi bi-plus-circle"></i>
              Create Post
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <i className="bi bi-check-circle"></i>
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="community-tabs">
          <button 
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <i className="bi bi-house"></i>
            Feed
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <i className="bi bi-fire"></i>
            Trending
          </button>
          {isAuthenticated && (
            <button 
              className={`tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-posts')}
            >
              <i className="bi bi-person"></i>
              My Posts
            </button>
          )}
        </div>

        {/* Posts Grid */}
        <div className="posts-container">
          {loading ? (
            <div className="loading-state">
              <i className="bi bi-arrow-clockwise spin"></i>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-people"></i>
              <h3>No posts yet</h3>
              <p>Be the first to share a recipe or story!</p>
              {isAuthenticated && (
                <button className="create-first-post-btn" onClick={handleCreatePost}>
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post._id} className="post-card">
                  {post.image && (
                    <div className="post-image">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="post-content">
                    <div className="post-header">
                      <div className="author-info">
                        <img 
                          src={post.authorId?.avatar || '/default-avatar.png'} 
                          alt={post.authorId?.name}
                          className="author-avatar"
                        />
                        <div>
                          <h4 className="author-name">{post.authorId?.name}</h4>
                          <span className="post-date">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`post-type ${post.type}`}>
                        {post.type === 'recipe' ? '🍽️ Recipe' : '📖 Story'}
                      </span>
                    </div>

                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-excerpt">
                      {post.content.length > 150 
                        ? `${post.content.substring(0, 150)}...` 
                        : post.content
                      }
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="post-actions">
                      <button 
                        className={`like-btn ${post.isLiked ? 'liked' : ''}`}
                        onClick={() => handleLike(post._id)}
                      >
                        <i className={`bi ${post.isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        <span>{post.likes.length}</span>
                      </button>
                      
                      <button className="comment-btn">
                        <i className="bi bi-chat"></i>
                        <span>Comment</span>
                      </button>
                      
                      <button className="share-btn">
                        <i className="bi bi-share"></i>
                        <span>Share</span>
                      </button>

                      {/* Edit and Delete buttons - only show for post author */}
                      {isAuthenticated && user && post.authorId?.id === user.id && (
                        <div className="edit-delete-container">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(post)}
                          >
                            <i className="bi bi-pencil"></i>
                            <span>Edit</span>
                          </button>
                          
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(post._id)}
                          >
                            <i className="bi bi-trash"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 