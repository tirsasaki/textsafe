create extension if not exists pgcrypto;

create table public.encrypted_messages (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  expires_at timestamptz not null,
  burn_after_reading boolean not null default true,
  created_at timestamptz not null default now(),
  retrieved_at timestamptz null,
  constraint encrypted_messages_expiry_after_creation check (expires_at > created_at),
  constraint encrypted_messages_payload_size check (octet_length(payload::text) <= 140000),
  constraint encrypted_messages_payload_shape check (
    payload ? 'version'
    and payload->>'version' = '1'
    and payload->>'algorithm' = 'AES-256-GCM'
    and payload->>'kdf' = 'PBKDF2-SHA-256'
    and (payload->>'iterations')::integer between 310000 and 1000000
    and jsonb_typeof(payload->'salt') = 'string'
    and jsonb_typeof(payload->'iv') = 'string'
    and jsonb_typeof(payload->'ciphertext') = 'string'
  )
);

create table public.consumed_message_ids (
  id uuid primary key,
  expires_at timestamptz not null
);

create index encrypted_messages_expires_at_idx on public.encrypted_messages (expires_at);
create index encrypted_messages_created_at_idx on public.encrypted_messages (created_at);
create index consumed_message_ids_expires_at_idx on public.consumed_message_ids (expires_at);

alter table public.encrypted_messages enable row level security;
alter table public.consumed_message_ids enable row level security;

revoke all on public.encrypted_messages from anon, authenticated;
revoke all on public.consumed_message_ids from anon, authenticated;

create or replace function public.retrieve_encrypted_message(p_id uuid)
returns table (
  result_status text,
  result_payload jsonb,
  result_expires_at timestamptz,
  result_burn_after_reading boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  secret public.encrypted_messages%rowtype;
begin
  select * into secret
  from public.encrypted_messages
  where id = p_id
  for update;

  if not found then
    if exists (select 1 from public.consumed_message_ids where id = p_id and expires_at > now()) then
      return query select 'consumed'::text, null::jsonb, null::timestamptz, null::boolean;
    else
      return query select 'not_found'::text, null::jsonb, null::timestamptz, null::boolean;
    end if;
    return;
  end if;

  if secret.expires_at <= now() then
    delete from public.encrypted_messages where id = p_id;
    return query select 'expired'::text, null::jsonb, secret.expires_at, secret.burn_after_reading;
    return;
  end if;

  if secret.burn_after_reading then
    insert into public.consumed_message_ids (id, expires_at)
    values (secret.id, secret.expires_at)
    on conflict (id) do nothing;
    delete from public.encrypted_messages where id = p_id;
  else
    update public.encrypted_messages
    set retrieved_at = coalesce(retrieved_at, now())
    where id = p_id;
  end if;

  return query select 'ok'::text, secret.payload, secret.expires_at, secret.burn_after_reading;
end;
$$;

create or replace function public.cleanup_expired_messages()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  delete from public.encrypted_messages where expires_at <= now();
  get diagnostics removed = row_count;
  delete from public.consumed_message_ids where expires_at <= now();
  return removed;
end;
$$;

revoke all on function public.retrieve_encrypted_message(uuid) from public, anon, authenticated;
revoke all on function public.cleanup_expired_messages() from public, anon, authenticated;
grant execute on function public.retrieve_encrypted_message(uuid) to service_role;
grant execute on function public.cleanup_expired_messages() to service_role;
