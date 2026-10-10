-- Expand editorial scope without changing ownership, consent, review or privacy rules.
begin;

alter table public.profiles drop constraint profiles_region_id_check;
alter table public.profiles add constraint profiles_region_id_check
  check (region_id in ('bandung', 'kanazawa', 'melbourne'));

alter table public.contributions drop constraint contributions_region_id_check;
alter table public.contributions add constraint contributions_region_id_check
  check (region_id in ('bandung', 'kanazawa', 'melbourne'));

alter table public.contributions drop constraint contributions_theme_check;
alter table public.contributions add constraint contributions_theme_check
  check (theme in ('people','food','music','dance','language','fashion','beliefs','craft','events','art','places'));

commit;
