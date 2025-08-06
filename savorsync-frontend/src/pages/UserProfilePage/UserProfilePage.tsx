import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { userSocialAPI, postAPI } from '../../services/apiCommunity';
import './UserProfilePage.css';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  cuisine?: string;
  type: 'recipe' | 'story';
  likes: string[];
  createdAt: string;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, toggleFollow } = useUser();
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.followers.includes(currentUser.id));
    }
  }, [user, currentUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await userSocialAPI.getUserProfile(userId!);
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/community');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await userSocialAPI.getUserPosts(userId!);
      setPosts(response.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await toggleFollow(userId!);
      setIsFollowing(!isFollowing);
      
      // Update local user state
      if (user) {
        setUser(prev => prev ? {
          ...prev,
          followers: isFollowing 
            ? prev.followers.filter(id => id !== currentUser?.id)
            : [...prev.followers, currentUser?.id || '']
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwnProfile = currentUser && user && currentUser.id === user._id;

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="error-container">
          <h2>User not found</h2>
          <button onClick={() => navigate('/community')}>Back to Community</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/community')}>
            ← Back to Community
          </button>
          
          <div className="profile-info">
            <div className="profile-avatar">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name}
              />
            </div>
            
            <div className="profile-details">
              <h1 className="profile-name">{user.name}</h1>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              <p className="profile-joined">Joined {formatDate(user.createdAt)}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.followers.length}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{user.following.length}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
              
              {!isOwnProfile && isAuthenticated && (
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  <i className={`bi ${isFollowing ? 'bi-person-check-fill' : 'bi-person-plus'}`}></i>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <i className="bi bi-file-text"></i>
            Posts ({posts.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            <i className="bi bi-people"></i>
            Followers ({user.followers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <i className="bi bi-person-check"></i>
            Following ({user.following.length})
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'posts' && (
            <div className="posts-section">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-file-text"></i>
                  <h3>No posts yet</h3>
                  <p>{isOwnProfile ? 'Start sharing your recipes and stories!' : 'This user hasn\'t posted anything yet.'}</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <div key={post._id} className="post-card">
                      {post.image && (
                        <div className="post-image">
                          <img src={post.image} alt={post.title} />
                        </div>
                      )}
                      
                      <div className="post-content">
                        <div className="post-header">
                          <span className={`post-type ${post.type}`}>
                            {post.type === 'recipe' ? '🍽️ Recipe' : '📖 Story'}
                          </span>
                          <span className="post-date">{formatDate(post.createdAt)}</span>
                        </div>

                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">
                          {post.content.length > 100 
                            ? `${post.content.substring(0, 100)}...` 
                            : post.content
                          }
                        </p>

                        {post.cuisine && (
                          <span className="post-cuisine">{post.cuisine}</span>
                        )}

                        <div className="post-stats">
                          <span className="likes-count">
                            <i className="bi bi-heart"></i>
                            {post.likes.length} likes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="followers-section">
              <FollowersList userId={userId!} type="followers" />
            </div>
          )}

          {activeTab === 'following' && (
            <div className="following-section">
              <FollowersList userId={userId!} type="following" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Followers/Following List Component
interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, type }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;
      
      if (type === 'followers') {
        response = await userSocialAPI.getFollowers(userId);
      } else {
        response = await userSocialAPI.getFollowing(userId);
      }
      
      setUsers(response.users);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {type}...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-people"></i>
        <h3>No {type} yet</h3>
        <p>This user doesn't have any {type} yet.</p>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {users.map((user) => (
        <div key={user._id} className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
          <img 
            src={user.avatar || '/default-avatar.png'} 
            alt={user.name}
            className="user-avatar"
          />
          <div className="user-info">
            <h4 className="user-name">{user.name}</h4>
            {user.bio && <p className="user-bio">{user.bio}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfilePage; 