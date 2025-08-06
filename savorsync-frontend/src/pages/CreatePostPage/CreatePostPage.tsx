import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { createPost, updatePost, getPost, deletePost } from '../../services/apiPosts';
import './CreatePostPage.css';

interface Post {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  category: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

// Predefined tags for easy selection
const PREDEFINED_TAGS = {
  cuisines: ['Italian', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Indian', 'Mexican', 'Mediterranean'],
  cookingStyles: ['Quick & Easy', 'One Pot', 'Meal Prep', 'Weeknight Dinner', 'Weekend Project'],
  dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein'],
  occasions: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Party Food', 'Comfort Food'],
  difficulty: ['Beginner', 'Intermediate', 'Advanced']
};

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  
  const [post, setPost] = useState<Post>({
    title: '',
    content: '',
    image: '',
    tags: [],
    category: 'recipe',
    author: user?.name || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if we're editing an existing post (from URL params or location state)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('edit');
    
    // Check if we're editing from location state (from Community page)
    const editMode = location.state?.editMode;
    const postData = location.state?.post;
    
    if (editMode && postData) {
      setIsEditing(true);
      setPost(postData);
    } else if (postId) {
      setIsEditing(true);
      loadPost(postId);
    }
  }, [isAuthenticated, navigate, location.state]);

  const loadPost = async (postId: string) => {
    try {
      setIsLoading(true);
      const response = await getPost(postId);
      setPost(response.data);
    } catch (err: any) {
      setError('Failed to load post: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPost(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
        setError(''); // Clear any previous errors
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      const hashtag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
      if (!post.tags.includes(hashtag)) {
        setPost(prev => ({
          ...prev,
          tags: [...prev.tags, hashtag]
        }));
      }
      setHashtagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post.title.trim() || !post.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const postData = {
        ...post,
        author: user?.name || '',
        authorId: user?.id
      };

      let response;
      if (isEditing && post._id) {
        response = await updatePost(post._id, postData);
        setSuccess('Post updated successfully!');
      } else {
        response = await createPost(postData);
        setSuccess('Post created successfully!');
      }

      // Redirect to community page after a short delay
      setTimeout(() => {
        navigate('/community', { state: { refresh: true, success: 'Post created successfully!' } });
      }, 1500);

    } catch (err: any) {
      console.error('Post creation error:', err);
      
      if (err.response?.data?.error) {
        setError('Failed to save post: ' + err.response.data.error);
      } else if (err.message) {
        setError('Failed to save post: ' + err.message);
      } else {
        setError('Failed to save post: Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post._id || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deletePost(post._id);
      setSuccess('Post deleted successfully!');
      setTimeout(() => {
        navigate('/community');
      }, 1500);
    } catch (err: any) {
      setError('Failed to delete post: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/community');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
          <p>Share your culinary experiences with the community</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <i className="bi bi-check-circle"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={post.title}
              onChange={handleInputChange}
              placeholder="Enter your post title..."
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={post.category}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="recipe">Recipe</option>
              <option value="cooking-tip">Cooking Tip</option>
              <option value="restaurant-review">Restaurant Review</option>
              <option value="food-story">Food Story</option>
              <option value="technique">Cooking Technique</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={post.content}
              onChange={handleInputChange}
              placeholder="Share your culinary experience, recipe, or story..."
              required
              rows={8}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="form-file-input"
            />
            {post.image && (
              <div className="image-preview">
                <img src={post.image} alt="Preview" />
                <button
                  type="button"
                  onClick={() => setPost(prev => ({ ...prev, image: '' }))}
                  className="remove-image-btn"
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Tags</label>
            
            {/* Custom Tag Input */}
            <div className="tags-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add custom tags (press Enter to add)"
                className="form-input"
              />
              <button type="button" onClick={handleAddTag} className="add-tag-btn">
                <i className="bi bi-plus"></i>
              </button>
            </div>

            {/* Hashtag Input */}
            <div className="hashtag-input-container">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                placeholder="Add hashtags (e.g., #homemade #delicious)"
                className="form-input"
              />
              <button type="button" onClick={handleAddHashtag} className="add-tag-btn">
                <i className="bi bi-hash"></i>
              </button>
            </div>
            
            {/* Quick Add Tags */}
            <div className="quick-tags">
              <h5>Quick Add:</h5>
              <div className="quick-tag-buttons">
                {PREDEFINED_TAGS.cuisines.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!post.tags.includes(tag)) {
                        setPost(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    className={`quick-tag-btn ${post.tags.includes(tag) ? 'selected' : ''}`}
                    disabled={post.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="quick-tag-buttons">
                {PREDEFINED_TAGS.cookingStyles.slice(0, 4).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!post.tags.includes(tag)) {
                        setPost(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    className={`quick-tag-btn ${post.tags.includes(tag) ? 'selected' : ''}`}
                    disabled={post.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tags Display */}
            {post.tags.length > 0 && (
              <div className="selected-tags">
                <h5>Selected Tags:</h5>
                <div className="tags-list">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="remove-tag-btn"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={isLoading}
              >
                <i className="bi bi-trash"></i>
                Delete
              </button>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="bi bi-hourglass-split"></i>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  {isEditing ? 'Update Post' : 'Create Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage; 