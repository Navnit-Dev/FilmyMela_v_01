import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PATCH - Update a single section
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminError || !['SuperAdmin', 'Admin'].includes(adminData?.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    const { name, section_type, filter_value, is_active, max_items } = body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (section_type !== undefined) {
      updates.push(`section_type = $${paramCount++}`);
      values.push(section_type);
    }
    if (filter_value !== undefined) {
      updates.push(`filter_value = $${paramCount++}`);
      values.push(filter_value);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (max_items !== undefined) {
      updates.push(`max_items = $${paramCount++}`);
      values.push(max_items);
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const { data: result, error: updateError } = await supabase
      .from('home_sections')
      .update({
        ...(name !== undefined && { name }),
        ...(section_type !== undefined && { section_type }),
        ...(filter_value !== undefined && { filter_value }),
        ...(is_active !== undefined && { is_active }),
        ...(max_items !== undefined && { max_items }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    if (!result) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a section
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminError || !['SuperAdmin', 'Admin'].includes(adminData?.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    const { data: result, error: deleteError } = await supabase
      .from('home_sections')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (deleteError) throw deleteError;
    
    if (!result) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
