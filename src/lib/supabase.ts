import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
        };
      };
      debates: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          topic: string;
          debate_date: string;
          number_of_teams: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          topic: string;
          debate_date: string;
          number_of_teams?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          topic?: string;
          debate_date?: string;
          number_of_teams?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          debate_id: string;
          name: string;
          team: string;
          individual_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          name: string;
          team: string;
          individual_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          name?: string;
          team?: string;
          individual_score?: number;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          debate_id: string;
          team_name: string;
          team_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          team_name: string;
          team_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          team_name?: string;
          team_score?: number;
          created_at?: string;
        };
      };
      awards: {
        Row: {
          id: string;
          debate_id: string;
          participant_id: string;
          award_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          participant_id: string;
          award_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          participant_id?: string;
          award_type?: string;
          created_at?: string;
        };
      };
      debate_topics: {
        Row: {
          id: string;
          topic: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic?: string;
          category?: string;
          created_at?: string;
        };
      };
    };
  };
};
