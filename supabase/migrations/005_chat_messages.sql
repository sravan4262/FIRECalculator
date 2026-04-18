-- chat_messages: messages within a session
create table if not exists fire.chat_messages (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references fire.chat_sessions(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  extracted_inputs  jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx on fire.chat_messages(session_id);
