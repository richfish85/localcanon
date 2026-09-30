begin;
-- These synthetic identities exist only inside this rolled-back transaction.
insert into auth.users(id,email_confirmed_at,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000101',now(),'{"display_name":"Synthetic author"}'),
('00000000-0000-4000-8000-000000000102',now(),'{"display_name":"Synthetic stranger"}'),
('00000000-0000-4000-8000-000000000103',now(),'{"display_name":"Synthetic editor"}');
insert into private.editors(user_id) values('00000000-0000-4000-8000-000000000103');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000101',true);
select public.save_contribution('{"kind":"story","region_id":"bandung","theme":"food","title":"Synthetic permission check","body":"Synthetic test content only; no regional claim is made.","scope":"Test scope","evidence_kind":"firsthand","sources":[],"publish_consent":true}') as draft_created;
select public.submit_contribution((select id from public.contributions where owner_id=auth.uid()));
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000102',true);
select count(*)=0 as unrelated_user_cannot_read_draft from public.contributions;
do $$ begin if exists(select 1 from public.contributions) then raise exception 'Draft privacy failed'; end if; end $$;
reset role;
set local role anon;
select count(*)=0 as public_cannot_read_pending from public.published_contributions;
do $$ begin if exists(select 1 from public.published_contributions) then raise exception 'Pending content exposed'; end if; end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000103',true);
select public.review_contribution((select id from public.contributions where owner_id='00000000-0000-4000-8000-000000000101'),'approved','Synthetic test approval.');
reset role;
set local role anon;
select count(*)=1 as approved_work_is_public from public.published_contributions where contributor_id='00000000-0000-4000-8000-000000000101';
do $$ begin if (select count(*) from public.published_contributions where contributor_id='00000000-0000-4000-8000-000000000101')<>1 then raise exception 'Publication missing'; end if; end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000101',true);
select public.withdraw_contribution((select id from public.contributions where owner_id=auth.uid()));
reset role;
set local role anon;
select count(*)=0 as withdrawn_work_removed from public.published_contributions where contributor_id='00000000-0000-4000-8000-000000000101';
do $$ begin if exists(select 1 from public.published_contributions where contributor_id='00000000-0000-4000-8000-000000000101') then raise exception 'Withdrawal failed'; end if; end $$;
reset role;
rollback;
