'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { urlFor } from '@/sanity/client';

interface PostCardProps {
  post: {
    _id: string;
    text: string;
    image?: any;
    likes?: any[];
    comments?: any[];
    createdAt: string;
    author?: {
      _id: string;
      name: string;
      username: string;
      profileImage?: any;
    };
  };
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [likes, setLikes] = useState<any[]>(post.likes || []);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const hasLiked = likes.some((like: any) => like._ref === currentUserId);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      return `${diffDays}d`;
    } catch (e) {
      return '';
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const optimisticLikes = hasLiked
      ? likes.filter((l) => l._ref !== currentUserId)
      : [...likes, { _ref: currentUserId, _key: 'temp' }];
    setLikes(optimisticLikes);

    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle like');
      setLikes(data.likes || []);
    } catch (err: any) {
      toast.error(err.message || 'Error liking post');
      // Rollback optimistic update
      setLikes(post.likes || []);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, text: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add comment');
      setComments(data.comments || []);
      setCommentText('');
      toast.success('Comment added!');
    } catch (err: any) {
      toast.error(err.message || 'Error adding comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const authorName = post.author?.name || 'Chirper';
  const authorUsername = post.author?.username || 'user';
  const postImageUrl = post.image ? urlFor(post.image) : null;

  return (
    <article className="border-b border-gray-800 bg-gray-950/20 hover:bg-gray-900/10 transition-colors p-4 md:p-5 flex gap-3.5">
      {/* Profile Image (Initials Fallback) */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 select-none">
        {authorName.charAt(0).toUpperCase()}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Header Row */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-white truncate hover:underline cursor-pointer">
            {authorName}
          </span>
          <span className="text-gray-500 truncate">@{authorUsername}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-500">{formatTime(post.createdAt)}</span>
        </div>

        {/* Text */}
        <p className="text-gray-100 text-[14.5px] mt-2 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>

        {/* Image Attachment */}
        {postImageUrl && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/40 relative group cursor-pointer">
            <img
              src={postImageUrl}
              alt="Chirp Attachment"
              className="w-full object-cover max-h-[380px] group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-8 mt-4">
          
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer group focus:outline-none transition-colors duration-150 ${
              hasLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
              <Heart className={`w-4 h-4 transition-transform group-active:scale-125 ${hasLiked ? 'fill-current' : ''}`} />
            </div>
            <span>{likes.length}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer group focus:outline-none transition-colors duration-150 ${
              showComments ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <MessageCircle className="w-4 h-4 transition-transform group-active:scale-125" />
            </div>
            <span>{comments.length}</span>
          </button>

        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-900 flex flex-col gap-3">
            
            {/* Comment Composer */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Post your reply..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-900 border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 mt-1">
                {comments.map((comment) => {
                  const commentAuthorName = comment.author?.name || 'Replier';
                  const commentAuthorUsername = comment.author?.username || 'user';
                  return (
                    <div key={comment._key} className="flex gap-2.5 items-start bg-gray-900/20 border border-gray-900 p-2.5 rounded-xl text-xs">
                      {/* Comment profile initials */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                        {commentAuthorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-200">{commentAuthorName}</span>
                          <span className="text-[10px] text-gray-500">@{commentAuthorUsername}</span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-500">{formatTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-300 mt-0.5 leading-relaxed font-normal">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-[11px] text-center py-2 select-none">No replies yet. Be the first to reply!</p>
            )}

          </div>
        )}

      </div>
    </article>
  );
}
