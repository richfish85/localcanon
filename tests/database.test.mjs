import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database enforces private ownership, verified accounts and editorial publication', async () => {
  const db = new PGlite();
  const author = '00000000-0000-4000-8000-000000000001';
  const stranger = '00000000-0000-4000-8000-000000000002';
  const editor = '00000000-0000-4000-8000-000000000003';
  const unverified = '00000000-0000-4000-8000-000000000004';
  const draft = { kind:'story', region_id:'bandung', theme:'food', title:'Synthetic permission test', body:'This is synthetic test content, not regional evidence.', scope:'Test location', evidence_kind:'documented', sources:['https://example.com/test'], publish_consent:true };
  const as = async (user, sql, params = []) => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user || '']);
    await db.exec(`set role ${user ? 'authenticated' : 'anon'}`);
    return db.query(sql, params);
  };
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid; $$; grant usage on schema public, auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;`);
    await db.exec(await readFile(new URL('../supabase/migrations/202610010001_community.sql',import.meta.url),'utf8'));
    await db.query(`insert into auth.users(id,email_confirmed_at,raw_user_meta_data) values ($1,now(),'{"display_name":"Synthetic author"}'),($2,now(),'{"display_name":"Synthetic stranger"}'),($3,now(),'{"display_name":"Synthetic editor"}'),($4,null,'{}')`,[author,stranger,editor,unverified]);
    await db.query('insert into private.editors(user_id) values($1)',[editor]);
    assert.equal((await as(null,'select * from public.profiles')).rows.length,0);
    assert.equal((await as(stranger,'select * from public.profiles where id=$1',[author])).rows.length,0);
    assert.equal((await as(stranger,"update public.profiles set display_name='Hijacked' where id=$1 returning id",[author])).rows.length,0);
    await assert.rejects(as(unverified,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)]), /Confirm your email/);
    await assert.rejects(as(null,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)]), /permission denied/);
    const id = (await as(author,'select public.save_contribution($1::jsonb)',[JSON.stringify({...draft,owner_id:stranger,status:'approved'})])).rows[0].save_contribution;
    assert.equal((await as(author,'select owner_id,status from public.contributions')).rows[0].owner_id,author);
    assert.equal((await as(author,'select status from public.contributions')).rows[0].status,'draft');
    await assert.rejects(as(author,"update public.contributions set status='approved' where id=$1",[id]),/permission denied/);
    assert.equal((await as(stranger,'select * from public.contributions')).rows.length,0);
    await assert.rejects(as(stranger,'select public.save_contribution($1::jsonb,$2)',[JSON.stringify(draft),id]),/Only your drafts/);
    await assert.rejects(as(stranger,'select public.submit_contribution($1)',[id]),/cannot be submitted/);
    await as(author,'select public.submit_contribution($1)',[id]);
    assert.equal((await as(null,'select * from public.published_contributions')).rows.length,0);
    await assert.rejects(as(author,'select public.save_contribution($1::jsonb,$2)',[JSON.stringify(draft),id]),/Only your drafts/);
    await assert.rejects(as(stranger,"select public.review_contribution($1,'approved','')",[id]),/Editor access required/);
    await assert.rejects(as(editor,"select public.review_contribution($1,'changes_requested','')",[id]),/useful feedback/);
    await as(editor,"select public.review_contribution($1,'changes_requested','Please clarify geographic scope.')",[id]);
    await as(author,'select public.save_contribution($1::jsonb,$2)',[JSON.stringify(draft),id]);
    await as(author,'select public.submit_contribution($1)',[id]);
    await as(editor,"select public.review_contribution($1,'approved','Sources reviewed for test.')",[id]);
    const published = (await as(null,'select * from public.published_contributions')).rows;
    assert.equal(published.length,1);
    assert.equal(published[0].credit_name,'Synthetic author');
    assert.equal(published[0].review_note,undefined);
    await assert.rejects(as(editor,"select public.review_contribution($1,'approved','')",[id]),/no longer awaiting/);
    await assert.rejects(as(stranger,'select public.withdraw_contribution($1)',[id]),/not found/);
    await as(author,'select public.withdraw_contribution($1)',[id]);
    assert.equal((await as(null,'select * from public.published_contributions')).rows.length,0);
    await as(author,'update public.profiles set is_public=true where id=$1',[author]);
    assert.equal((await as(null,'select * from public.profiles')).rows.length,1);
    await as(author,'update public.profiles set is_public=false where id=$1',[author]);
    assert.equal((await as(null,'select * from public.profiles')).rows.length,0);
    await assert.rejects(as(author,'insert into private.editors(user_id) values($1)',[author]),/permission denied/);
    await assert.rejects(as(author,'select public.save_contribution($1::jsonb)',[JSON.stringify({...draft,sources:['javascript:alert(1)']})]),/check constraint/);
    const missingSource=(await as(author,'select public.save_contribution($1::jsonb)',[JSON.stringify({...draft,sources:[]})])).rows[0].save_contribution;
    await assert.rejects(as(author,'select public.submit_contribution($1)',[missingSource]),/add sources/);
    const noConsent=(await as(author,'select public.save_contribution($1::jsonb)',[JSON.stringify({...draft,publish_consent:false})])).rows[0].save_contribution;
    await assert.rejects(as(author,'select public.submit_contribution($1)',[noConsent]),/publication permission/);
    for(let i=0;i<5;i++) {
      const pendingId=(await as(stranger,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)])).rows[0].save_contribution;
      await as(stranger,'select public.submit_contribution($1)',[pendingId]);
    }
    const cappedId=(await as(stranger,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)])).rows[0].save_contribution;
    await assert.rejects(as(stranger,'select public.submit_contribution($1)',[cappedId]),/five contributions/);
    for(let i=0;i<4;i++) await as(stranger,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)]);
    await assert.rejects(as(stranger,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)]),/wait before creating/);
    const selfId=(await as(editor,'select public.save_contribution($1::jsonb)',[JSON.stringify(draft)])).rows[0].save_contribution;
    await as(editor,'select public.submit_contribution($1)',[selfId]);
    await assert.rejects(as(editor,"select public.review_contribution($1,'approved','')",[selfId]),/another editor/);
  } finally { await db.close(); }
});
