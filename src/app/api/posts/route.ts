import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { writeClient } from '@/sanity/client';

// Fetch all posts with author and comments detail
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json({ posts: [] });
    }

    const query = `*[_type == "post"] | order(createdAt desc) {
      _id,
      text,
      image,
      likes,
      createdAt,
      author->{
        _id,
        name,
        username,
        profileImage
      },
      comments[] {
        _key,
        text,
        createdAt,
        author->{
          _id,
          name,
          username,
          profileImage
        }
      }
    }`;

    const posts = await writeClient.fetch(query);
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// Create a new post (with text and optional image)
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

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Sanity credentials missing' }, { status: 500 });
    }

    const formData = await request.formData();
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File | null;

    if (!text && !imageFile) {
      return NextResponse.json({ error: 'Post must contain text or an image.' }, { status: 400 });
    }

    let imageAssetRef = null;

    // If there is an image, upload to Sanity asset repository
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const imageAsset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
        contentType: imageFile.type,
      });
      
      imageAssetRef = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      };
    }

    // Assemble post document
    const newPost: any = {
      _type: 'post',
      text: text || '',
      author: {
        _type: 'reference',
        _ref: decoded.userId,
      },
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    if (imageAssetRef) {
      newPost.image = imageAssetRef;
    }

    const createdPost = await writeClient.create(newPost);

    // Fetch the created post with full referenced author info for rendering
    const fullPostQuery = `*[_type == "post" && _id == $postId][0] {
      _id,
      text,
      image,
      likes,
      createdAt,
      author->{
        _id,
        name,
        username,
        profileImage
      },
      comments[] {
        _key,
        text,
        createdAt,
        author->{
          _id,
          name,
          username,
          profileImage
        }
      }
    }`;

    const populatedPost = await writeClient.fetch(fullPostQuery, { postId: createdPost._id });

    return NextResponse.json({ post: populatedPost });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post.' }, { status: 500 });
  }
}
