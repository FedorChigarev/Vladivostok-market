import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szheohlenmgdxlbdjwcd.supabase.co';
const supabaseKey = 'sb_publishable_810Mow3UpZvkuBZ9Rbb-aA_pJuJhQOV';

export const supabase = createClient(supabaseUrl, supabaseKey);