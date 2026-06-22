export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fmqcjvoemdmghikrzulk.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return {
    url,
    serviceKey,
    anonKey,
    async fetchUser(email: string) {
      const res = await fetch(
        `${url}/rest/v1/User?email=eq.${encodeURIComponent(email)}&limit=1`,
        {
          headers: {
            "apikey": serviceKey || anonKey,
            "Authorization": `Bearer ${serviceKey || anonKey}`,
          },
        }
      );
      if (!res.ok) return null;
      const users = await res.json();
      return users?.[0] || null;
    },
  };
}
