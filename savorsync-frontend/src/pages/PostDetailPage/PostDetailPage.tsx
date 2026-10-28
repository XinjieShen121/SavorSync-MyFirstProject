import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getPost, likePost, unlikePost, addComment, deleteComment, deletePost } from '../../services/apiPosts';
import './PostDetailPage.css';
import { EmptyState, ErrorState, LoadingState, PostSkeleton } from '../../components/ui/States';

interface Comment {
  _id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  category: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  comments: Comment[];
  likeCount: number;
  commentCount: number;
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useUser();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      setNotFound(false);
      const response = await getPost(postId!);
      setPost(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) setNotFound(true);
      else setError("We couldn't load this");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!post) return;

    try {
      let response;
      if (post.likes.includes(user?.id || '')) {
        response = await unlikePost(post._id);
      } else {
        response = await likePost(post._id);
      }

      setPost(prev => prev ? {
        ...prev,
        likes: response.data.likes,
        likeCount: response.data.likeCount
      } : null);
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim() || !post) return;

    try {
      setSubmittingComment(true);
      const response = await addComment(post._id, { content: commentContent });
      
      setPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, response.data.comment],
        commentCount: prev.commentCount + 1
      } : null);
      
      setCommentContent('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    try {
      await deleteComment(post._id, commentId);
      
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId),
        commentCount: prev.commentCount - 1
      } : null);
    } catch (err: any) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleEditPost = () => {
    navigate(`/create-post?edit=${postId}`);
  };

  const handleDeletePost = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setDeletingPost(true);
      await deletePost(post._id);
      navigate('/community');
    } catch (err: any) {
      console.error('Error deleting post:', err);
    } finally {
      setDeletingPost(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditPost = post && user && (post.authorId === user.id);

  // Loading, not-found and error states (design.md 4.7)
  if (loading || error || notFound || !post) {
    return (
      <div className="post-detail-page">
        {loading ? (
          <LoadingState label="Loading post">
            <PostSkeleton />
          </LoadingState>
        ) : error ? (
          <ErrorState onRetry={fetchPost} exit={{ label: 'Back to community', to: '/community' }} />
        ) : (
          <ErrorState
            title="This post isn't here"
            body="It may have been removed. See what others are cooking instead."
            primary={{ label: 'Back to community', to: '/community', variant: 'primary' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {/* Header */}
        <div className="post-detail-header">
          <button className="back-button" onClick={() => navigate('/community')}>
            ← Back to Community
          </button>
          
          {canEditPost && (
            <div className="post-actions">
              <button 
                onClick={handleEditPost}
                className="btn btn--secondary"
                disabled={deletingPost}
              >
                <i className="bi bi-pencil"></i>
                Edit
              </button>
              <button 
                onClick={handleDeletePost}
                className="btn btn--danger"
                disabled={deletingPost}
              >
                <i className="bi bi-trash"></i>
                {deletingPost ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <article className="post-content">
          <header className="post-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <div className="author-info">
                <span className="author-name">{post.author}</span>
                <span className="post-date">{formatDate(post.createdAt)}</span>
              </div>
              <div className="post-category">
                <span className="category-badge">{post.category}</span>
              </div>
            </div>
          </header>

          {post.image && (
            <div className="post-image">
              <img src={post.image} alt={post.title} />
            </div>
          )}

          <div className="post-body">
            <p>{post.content}</p>
          </div>

          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="post-actions-bar">
                         <button 
               onClick={handleLike}
               className={`like-btn ${post.likes.includes(user?.id || '') ? 'liked' : ''}`}
               disabled={!isAuthenticated}
             >
               <i className={`bi ${post.likes.includes(user?.id || '') ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span>{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
            </button>
            
            <div className="comment-count">
              <i className="bi bi-chat"></i>
              <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h3>Comments</h3>
          
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                maxLength={1000}
                className="comment-input"
                disabled={submittingComment}
              />
              <div className="comment-form-actions">
                <span className="char-count">
                  {commentContent.length}/1000
                </span>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={!commentContent.trim() || submittingComment}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please <button onClick={() => navigate('/login')} className="link-btn">log in</button> to add a comment.</p>
            </div>
          )}

          <div className="comments-list">
            {post.comments.length === 0 ? (
              <EmptyState icon="bi-chat" title="No comments yet" body="Be the first to say something." />
            ) : (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">
                    <p>{comment.content}</p>
                  </div>
                                     {(user?.id === comment.authorId || user?.id === post.authorId) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="delete-comment-btn"
                      title="Delete comment"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetailPage; 