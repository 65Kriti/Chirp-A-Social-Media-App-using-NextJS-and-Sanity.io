import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { client } from '@/sanity/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Retrieve full user profile from Sanity
    const query = `*[_type == "user" && _id == $userId][0]{
      _id,
      name,
      username,
      email,
      bio,
      profileImage,
      createdAt
    }`;

    const user = await client.fetch(query, { userId: decoded.userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
