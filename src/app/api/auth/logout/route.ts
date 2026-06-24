import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
