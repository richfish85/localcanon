import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const client = url && key ? createClient(url, key, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, storageKey: 'localcanon-auth' },
}) : null;

function checked({ data, error }) { if (error) throw error; return data; }
export const communityApi = client ? {
  async session() { return checked(await client.auth.getSession()).session; },
  async signUp(email, password, displayName) { return checked(await client.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: new URL(import.meta.env.BASE_URL, location.origin).href + '#account' } })); },
  async signIn(email, password) { return checked(await client.auth.signInWithPassword({ email, password })); },
  async signOut() { checked(await client.auth.signOut()); },
  async resend(email) { checked(await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, location.origin).href + '#account' } })); },
  async recover(email) { checked(await client.auth.resetPasswordForEmail(email, { redirectTo: new URL(import.meta.env.BASE_URL, location.origin).href + '#account/reset' })); },
  async reset(password) { checked(await client.auth.updateUser({ password })); },
  async profile(id) { return checked(await client.from('profiles').select('*').eq('id', id).single()); },
  async publicProfile(id) { return checked(await client.from('profiles').select('id,display_name,bio,region_id,connection,website,is_public').eq('id', id).eq('is_public', true).maybeSingle()); },
  async saveProfile(id, data) { return checked(await client.from('profiles').update(data).eq('id', id).select().single()); },
  async isEditor() { return checked(await client.rpc('is_editor')); },
  async contributions(id) { return checked(await client.from('contributions').select('*').eq('owner_id', id).order('updated_at', { ascending: false }).limit(100)); },
  async contribution(id) { return checked(await client.from('contributions').select('*').eq('id', id).single()); },
  async save(payload, id = null) { return checked(await client.rpc('save_contribution', { payload, target_id: id })); },
  async submit(id) { return checked(await client.rpc('submit_contribution', { target_id: id })); },
  async withdraw(id) { return checked(await client.rpc('withdraw_contribution', { target_id: id })); },
  async queue() { return checked(await client.from('contributions').select('*').eq('status', 'pending').order('submitted_at').limit(100)); },
  async review(id, decision, feedback) { return checked(await client.rpc('review_contribution', { target_id: id, decision, feedback })); },
  async published(regionId, theme) {
    let query = client.from('published_contributions').select('*').eq('region_id', regionId).order('published_at', { ascending: false }).limit(50);
    if (theme !== 'all') query = query.eq('theme', theme);
    return checked(await query);
  },
} : null;
