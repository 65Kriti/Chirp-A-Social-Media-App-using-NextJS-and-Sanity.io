import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { writeClient } from '@/sanity/client';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toLowerCase().trim();

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Sanity credentials are not configured. Please set them in your .env.local file.' },
        { status: 500 }
      );
    }

    // Find user
    const query = `*[_type == "user" && (username == $identifier || email == $identifier)][0]`;
    const user = await writeClient.fetch(query, {
      identifier: cleanIdentifier,
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 400 });
    }

    // Sign JWT
    const token = signToken({
      userId: user._id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
