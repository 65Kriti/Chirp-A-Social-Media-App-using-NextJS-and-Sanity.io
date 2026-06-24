import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { writeClient } from '@/sanity/client';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required.' }, { status: 400 });
    }

    // Get current likes for the post
    const postQuery = `*[_type == "post" && _id == $postId][0] { likes }`;
    const post = await writeClient.fetch(postQuery, { postId });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likes = post.likes || [];
    const userId = decoded.userId;

    // Check if user already liked the post
    const alreadyLiked = likes.some((like: any) => like._ref === userId);

    if (alreadyLiked) {
      // Remove the user's reference from the likes array
      // In GROQ, we can filter them out or patch using unset
      const updatedLikes = likes.filter((like: any) => like._ref !== userId);
      await writeClient.patch(postId).set({ likes: updatedLikes }).commit();
    } else {
      // Add the user's reference to the likes array
      await writeClient
        .patch(postId)
        .setIfMissing({ likes: [] })
        .append('likes', [{ _type: 'reference', _ref: userId, _key: Math.random().toString(36).substring(2, 9) }])
        .commit();
    }

    // Return the updated likes array
    const updatedPost = await writeClient.fetch(postQuery, { postId });
    return NextResponse.json({ likes: updatedPost.likes || [] });
  } catch (error: any) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle like.' }, { status: 500 });
  }
}
