import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/settings/maintenance - Get public maintenance status
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get settings - no auth required for this public endpoint
    const { data: settings, error } = await supabase
      .from('settings')
      .select('maintenance_mode, maintenance_message')
      .limit(1)
      .single();

    if (error) {
      // Return default if no settings
      return NextResponse.json({ 
        maintenance_mode: false,
        maintenance_message: 'We are currently undergoing maintenance.'
      });
    }

    return NextResponse.json({
      maintenance_mode: settings?.maintenance_mode || false,
      maintenance_message: settings?.maintenance_message || 'We are currently undergoing maintenance.'
    });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    return NextResponse.json({ 
      maintenance_mode: false 
    });
  }
}
