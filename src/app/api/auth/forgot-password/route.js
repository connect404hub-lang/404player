import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Please enter your email' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'No account with this email exists' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `[CONSOLE] Password reset link sent successfully to ${email}. Mock recovery code: RESET-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
