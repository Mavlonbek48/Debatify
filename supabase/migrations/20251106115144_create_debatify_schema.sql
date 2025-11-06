/*
  # Debatify Database Schema

  ## Overview
  This migration creates the complete database schema for Debatify, a debate management platform.

  ## New Tables

  ### 1. `profiles`
  User profiles for debate organizers
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `debates`
  Core debate events
  - `id` (uuid, primary key) - Unique debate identifier
  - `organizer_id` (uuid) - References profiles(id)
  - `title` (text) - Debate title
  - `topic` (text) - Debate topic/motion
  - `debate_date` (timestamptz) - Scheduled date and time
  - `number_of_teams` (integer) - Number of teams (default: 2)
  - `status` (text) - Debate status: 'upcoming', 'in_progress', 'completed'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `participants`
  Individual debate participants
  - `id` (uuid, primary key) - Unique participant identifier
  - `debate_id` (uuid) - References debates(id)
  - `name` (text) - Participant name
  - `team` (text) - Team assignment: 'for' or 'against'
  - `individual_score` (integer) - Individual performance score
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `teams`
  Team information and scores
  - `id` (uuid, primary key) - Unique team identifier
  - `debate_id` (uuid) - References debates(id)
  - `team_name` (text) - Team name: 'for' or 'against'
  - `team_score` (integer) - Team total score
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `awards`
  Awards and badges given to participants
  - `id` (uuid, primary key) - Unique award identifier
  - `debate_id` (uuid) - References debates(id)
  - `participant_id` (uuid) - References participants(id)
  - `award_type` (text) - Award type: 'honorable_mention', 'best_speaker', 'best_debater', 'most_creative'
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. `debate_topics`
  Pre-generated debate topics for suggestions
  - `id` (uuid, primary key) - Unique topic identifier
  - `topic` (text) - Debate topic/motion
  - `category` (text) - Topic category
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Organizers can only access their own debates and related data
  - Public read access for debate topics

  ## Important Notes
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps are automatically set with default values
  3. Foreign keys ensure referential integrity
  4. Cascading deletes maintain data consistency
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create debates table
CREATE TABLE IF NOT EXISTS debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  topic text NOT NULL,
  debate_date timestamptz NOT NULL,
  number_of_teams integer DEFAULT 2,
  status text DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE debates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view own debates"
  ON debates FOR SELECT
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can insert own debates"
  ON debates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own debates"
  ON debates FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own debates"
  ON debates FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
  name text NOT NULL,
  team text NOT NULL,
  individual_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view debate participants"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = participants.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert debate participants"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = participants.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update debate participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = participants.debate_id
      AND debates.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = participants.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete debate participants"
  ON participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = participants.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  team_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view debate teams"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = teams.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert debate teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = teams.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update debate teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = teams.debate_id
      AND debates.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = teams.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete debate teams"
  ON teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = teams.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

-- Create awards table
CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  award_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view debate awards"
  ON awards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = awards.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert debate awards"
  ON awards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = awards.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete debate awards"
  ON awards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = awards.debate_id
      AND debates.organizer_id = auth.uid()
    )
  );

-- Create debate_topics table
CREATE TABLE IF NOT EXISTS debate_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE debate_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view debate topics"
  ON debate_topics FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample debate topics
INSERT INTO debate_topics (topic, category) VALUES
  ('Social media does more harm than good', 'technology'),
  ('School uniforms should be mandatory', 'education'),
  ('Climate change is the greatest threat to humanity', 'environment'),
  ('Artificial intelligence will benefit society', 'technology'),
  ('Video games promote violence', 'society'),
  ('Remote work is better than office work', 'workplace'),
  ('Free college education should be provided to all', 'education'),
  ('Animals should not be kept in zoos', 'ethics'),
  ('Space exploration is worth the cost', 'science'),
  ('Democracy is the best form of government', 'politics')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debates table
DROP TRIGGER IF EXISTS update_debates_updated_at ON debates;
CREATE TRIGGER update_debates_updated_at
  BEFORE UPDATE ON debates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
