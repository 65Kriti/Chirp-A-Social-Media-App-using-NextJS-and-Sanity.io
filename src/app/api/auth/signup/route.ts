import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { writeClient } from '@/sanity/client';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '');
    const cleanEmail = email.toLowerCase().trim();

    // Check if Sanity details are set up. If not, simulate success or show error.
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Sanity credentials are not configured. Please set them in your .env.local file.' },
        { status: 500 }
      );
    }

    // Check if user already exists
    const query = `*[_type == "user" && (username == $username || email == $email)][0]`;
    const existingUser = await writeClient.fetch(query, {
      username: cleanUsername,
      email: cleanEmail,
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in Sanity
    const newUser = {
      _type: 'user',
      name,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const createdUser = await writeClient.create(newUser);

    // Sign JWT
    const token = signToken({
      userId: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
    });

    const response = NextResponse.json({
      message: 'Signup successful',
      user: {
        id: createdUser._id,
        name: createdUser.name,
        username: createdUser.username,
        email: createdUser.email,
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
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
