import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    // handle sign in event
    supabaseClient.auth.startAutoRefresh();
  } else if (event === 'SIGNED_OUT') {
    // handle sign out event
    supabaseClient.auth.stopAutoRefresh();
  } /*else if (event === 'TOKEN_REFRESHED') {
    // handle token refreshed event
    console.log('token refreshed');
  } else if (event === 'INITIAL_SESSION') {
    // handle initial session
  } else if (event === 'PASSWORD_RECOVERY') {
    // handle password recovery event
  } else if (event === 'USER_UPDATED') {
    // handle user updated event
  }*/
});