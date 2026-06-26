// ============================================================
// DEVRECRUIT — Configuration Supabase
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL  = 'https://lourmvzgwyacvcdjpjge.supabase.co';
const SUPABASE_ANON = 'sb_publishable_ITSh6yTSqROXFnv8x7O9dw_3gMv_WXg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
