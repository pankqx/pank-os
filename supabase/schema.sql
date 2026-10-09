-- DRAFT — NOT APPLIED, NOT TESTED. Optional persistence for the companion. Visitors never need an account.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character text not null check (character in ('ash','rhea')),
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
create policy "own conversations" on public.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own messages" on public.messages for all
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
