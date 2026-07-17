import { supabase } from "@/lib/supabaseClient";

// A mapper to translate old base44 table concepts to your new Supabase tables
const tableMap = {
  JobRequest: 'job_requests',
  Notification: 'notifications',
  User: 'users'
};

export const base44 = {
  // 1. Authentication Bridge
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    logout: async (redirectTo) => {
      await supabase.auth.signOut();
      if (redirectTo) window.location.href = redirectTo;
    },
    redirectWithProvider: async (provider) => {
      // Handles OAuth mapping if needed later
    }
  },

  // 2. Database/Entities Bridge (Tricks your 194 references)
  entities: new Proxy({}, {
    get: (target, tableName) => {
      const supabaseTable = tableMap[tableName] || tableName.toLowerCase();
      
      return {
        create: async (payload) => {
          const { data, error } = await supabase.from(supabaseTable).insert([payload]).select();
          if (error) throw error;
          return data[0];
        },
        get: async (id) => {
          const { data, error } = await supabase.from(supabaseTable).select('*').eq('id', id).single();
          if (error) throw error;
          return data;
        },
        // Add update/delete proxy handlers here as you find them
      };
    }
  }),

  // 3. Integration/Email Bridge
  integrations: {
    Core: {
      SendEmail: async (config) => {
        console.log("Email requested via legacy client:", config);
        // Put edge-function or custom email trigger logic here later
      }
    }
  }
};