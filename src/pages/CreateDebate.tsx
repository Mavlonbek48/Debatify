import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const CreateDebate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [debateDate, setDebateDate] = useState('');
  const [numberOfTeams] = useState(2);
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestedTopics();
  }, []);

  const fetchSuggestedTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('debate_topics')
        .select('topic')
        .limit(5);

      if (error) throw error;
      setSuggestedTopics(data?.map((t) => t.topic) || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 2) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const filledParticipants = participants.filter((p) => p.trim() !== '');

    if (filledParticipants.length < 2) {
      setError('Please add at least 2 participants');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }

    try {
      const { data: debateData, error: debateError } = await supabase
        .from('debates')
        .insert({
          organizer_id: user.id,
          title,
          topic,
          debate_date: debateDate,
          number_of_teams: numberOfTeams,
          status: 'upcoming',
        })
        .select()
        .single();

      if (debateError) throw debateError;

      const halfPoint = Math.ceil(filledParticipants.length / 2);
      const shuffledParticipants = [...filledParticipants].sort(() => Math.random() - 0.5);

      const participantInserts = shuffledParticipants.map((name, index) => ({
        debate_id: debateData.id,
        name,
        team: index < halfPoint ? 'for' : 'against',
      }));

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      const { error: teamsError } = await supabase.from('teams').insert([
        { debate_id: debateData.id, team_name: 'for', team_score: 0 },
        { debate_id: debateData.id, team_name: 'against', team_score: 0 },
      ]);

      if (teamsError) throw teamsError;

      navigate(`/debates/${debateData.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create debate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-debate">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
        <h1>Create New Debate</h1>
      </header>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Debate Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Spring 2024 Championship"
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter debate topic or select from suggestions"
            />
            {suggestedTopics.length > 0 && (
              <div className="topic-suggestions">
                <p>Suggested topics:</p>
                <div className="suggestions-list">
                  {suggestedTopics.map((suggestedTopic, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => setTopic(suggestedTopic)}
                      disabled={loading}
                    >
                      {suggestedTopic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="debateDate">Date and Time</label>
            <input
              id="debateDate"
              type="datetime-local"
              value={debateDate}
              onChange={(e) => setDebateDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Participants</label>
            <p className="form-help">Add participants who will be randomly assigned to teams</p>
            {participants.map((participant, index) => (
              <div key={index} className="participant-input">
                <input
                  type="text"
                  value={participant}
                  onChange={(e) => updateParticipant(index, e.target.value)}
                  placeholder={`Participant ${index + 1} name`}
                  disabled={loading}
                />
                {participants.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="btn btn-danger-small"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addParticipant}
              className="btn btn-secondary"
              disabled={loading}
            >
              Add Participant
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Creating...' : 'Create Debate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
