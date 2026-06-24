'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Image, X, Loader2, Feather, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from './PostCard';

interface FeedProps {
  currentUser: {
    id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    profileImage?: any;
  } | null;
}

export default function Feed({ currentUser }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Composer states
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async (showToast = false) => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
      setPosts(data.posts || []);
      if (showToast) toast.success('Feed updated!');
    } catch (e: any) {
      console.error(e);
      toast.error('Could not load posts.');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append('text', text.trim());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      toast.success('Chirp shared!');
      setText('');
      removeImage();
      
      // Prepend the new post directly into state for instant UI response
      if (data.post) {
        setPosts((prevPosts) => [data.post, ...prevPosts]);
      } else {
        fetchPosts();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish Chirp');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl sm:border-r border-gray-800 h-screen overflow-y-auto flex flex-col pb-16 sm:pb-0">
      
      {/* Top Header */}
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between z-10">
        <h1 className="text-lg font-bold text-white tracking-wide">Home</h1>
        <button 
          onClick={async () => {
            if (isRefreshing) return;
            setIsRefreshing(true);
            await fetchPosts(true);
            setTimeout(() => {
              setIsRefreshing(false);
            }, 850);
          }} 
          disabled={isLoadingPosts || isRefreshing}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-900 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Composer (Visible only to authenticated users) */}
      {currentUser && (
        <form onSubmit={handleCreatePost} className="p-4 border-b border-gray-800 flex gap-3.5 bg-gray-950/40">
          {/* Profile Initials */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 select-none">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            {/* Textarea */}
            <textarea
              id="post-composer-textarea"
              placeholder="What's happening?"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent border-none text-white text-base placeholder-gray-500 focus:outline-none resize-none py-1.5 leading-normal"
            />

            {/* Image Preview Container */}
            {imagePreview && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-800 max-h-[300px] bg-gray-900/60">
                <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-[300px]" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-gray-950/80 hover:bg-gray-900 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Composer Action Toolbar */}
            <div className="flex items-center justify-between border-t border-gray-900 pt-3 mt-2">
              <div className="flex items-center">
                {/* File input triggers via icon */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-400 hover:text-blue-350 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                  title="Upload Image"
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>

              {/* Publish CTA */}
              <button
                type="submit"
                disabled={isPosting || (!text.trim() && !imageFile)}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chirping...
                  </>
                ) : (
                  <>
                    <Feather className="w-3.5 h-3.5" />
                    Chirp
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Posts Feed Area */}
      <div className="flex-1 flex flex-col">
        {isLoadingPosts ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-500 text-sm">Gathering latest chirps...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUserId={currentUser?.id || ''} 
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4 text-gray-500">
              <Feather className="w-8 h-8" />
            </div>
            <p className="text-gray-200 font-bold text-lg">Your feed is quiet</p>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Be the first one to start a conversation by posting a new Chirp!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
