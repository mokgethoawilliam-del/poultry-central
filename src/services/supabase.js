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

// STORAGE HELPERS
// Upload image to site-assets bucket
export const uploadShopAsset = async (file, farmId, type) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${farmId}/${type}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('site-assets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('site-assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading asset:', error);
        throw error;
    }
}

// Delete image from site-assets bucket
export const deleteOldAsset = async (url) => {
    try {
        if (!url) return;
        // Extract file path from public URL
        // Example: https://.../storage/v1/object/public/site-assets/farmId/type_random.jpg
        const pathParts = url.split('site-assets/');
        if (pathParts.length < 2) return;
        
        const filePath = pathParts[1];
        const { error } = await supabase.storage
            .from('site-assets')
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting old asset:', error);
    }
}
