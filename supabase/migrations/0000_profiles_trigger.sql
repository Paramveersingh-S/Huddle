-- Function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, subscription_tier, ai_scans_used_this_period, current_streak, longest_streak)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'user_' || split_part(new.id::text, '-', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'New Huddle User'),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    0,
    0,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
