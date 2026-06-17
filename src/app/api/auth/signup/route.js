import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_security_key_12345';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Please enter all fields' },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '30d',
    });

    return NextResponse.json(
      {
        message: 'Signup successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
