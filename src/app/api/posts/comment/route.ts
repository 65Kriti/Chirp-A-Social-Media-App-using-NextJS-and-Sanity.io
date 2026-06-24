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

    const { postId, text } = await request.json();

    if (!postId || !text || text.trim() === '') {
      return NextResponse.json({ error: 'Post ID and comment text are required.' }, { status: 400 });
    }

    const newComment = {
      _key: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      author: {
        _type: 'reference',
        _ref: decoded.userId,
      },
      createdAt: new Date().toISOString(),
    };

    // Patch the post document to append the new comment
    await writeClient
      .patch(postId)
      .setIfMissing({ comments: [] })
      .append('comments', [newComment])
      .commit();

    // Fetch the updated post's comment list with author details populated
    const commentsQuery = `*[_type == "post" && _id == $postId][0].comments[] {
      _key,
      text,
      createdAt,
      author->{
        _id,
        name,
        username,
        profileImage
      }
    }`;

    const comments = await writeClient.fetch(commentsQuery, { postId });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add comment.' }, { status: 500 });
  }
}
