import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration. Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get farm by slug
export const getFarmBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

// Helper to get products for a farm
export const getFarmProducts = async (farmId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

// Helper to get testimonials for a farm
export const getFarmTestimonials = async (farmId) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

// Helper to get gallery for a farm
export const getFarmGallery = async (farmId) => {
  const { data, error } = await supabase
    .from('site_gallery')
    .select('*')
    .eq('farm_id', farmId)
    .eq('is_active', true)
    .order('order_index')
  
  if (error) throw error
  return data
}

// Helper for Admin: Get farm owned by current user
export const getOwnedFarm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .single();
    
    if (error) return null;
    return data;
}
