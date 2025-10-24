import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, adminKey } = await request.json();

    // Check for admin registration key
    const expectedAdminKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!expectedAdminKey) {
      return NextResponse.json(
        { error: 'Admin registration not configured' },
        { status: 500 }
      );
    }

    if (adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin registration key' },
        { status: 403 }
      );
    }

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // Create user profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'admin'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Add to admin_users table
    const { error: adminUserError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
        created_by: authData.user.id // Self-created
      });

    if (adminUserError) {
      console.error('Admin user error:', adminUserError);
      // Don't fail the request for this, but log it
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
