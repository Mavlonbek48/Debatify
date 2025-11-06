import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Participant {
  id: string;
  name: string;
  team: string;
  individual_score: number;
}

interface Team {
  id: string;
  team_name: string;
  team_score: number;
}

interface ScoringProps {
  debateId: string;
  participants: Participant[];
  teams: Team[];
  onUpdate: () => void;
}

export const Scoring: React.FC<ScoringProps> = ({
  participants,
  teams,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateParticipantScore = async (participantId: string, newScore: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('participants')
        .update({ individual_score: newScore })
        .eq('id', participantId);

      if (error) throw error;
      setMessage('Score updated successfully');
      onUpdate();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating score:', error);
      setMessage('Failed to update score');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamScore = async (teamId: string, newScore: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ team_score: newScore })
        .eq('id', teamId);

      if (error) throw error;
      setMessage('Team score updated successfully');
      onUpdate();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating team score:', error);
      setMessage('Failed to update team score');
    } finally {
      setLoading(false);
    }
  };

  const forParticipants = participants.filter((p) => p.team === 'for');
  const againstParticipants = participants.filter((p) => p.team === 'against');
  const forTeam = teams.find((t) => t.team_name === 'for');
  const againstTeam = teams.find((t) => t.team_name === 'against');

  return (
    <div className="scoring-container">
      <h2>Scoring</h2>

      {message && <div className="success-message">{message}</div>}

      <div className="scoring-section">
        <h3>Team Scores</h3>
        <div className="teams-scoring">
          {forTeam && (
            <div className="team-score-card">
              <h4>For</h4>
              <div className="score-input">
                <input
                  type="number"
                  min="0"
                  value={forTeam.team_score}
                  onChange={(e) =>
                    updateTeamScore(forTeam.id, parseInt(e.target.value) || 0)
                  }
                  disabled={loading}
                />
                <span>points</span>
              </div>
            </div>
          )}

          {againstTeam && (
            <div className="team-score-card">
              <h4>Against</h4>
              <div className="score-input">
                <input
                  type="number"
                  min="0"
                  value={againstTeam.team_score}
                  onChange={(e) =>
                    updateTeamScore(againstTeam.id, parseInt(e.target.value) || 0)
                  }
                  disabled={loading}
                />
                <span>points</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="scoring-section">
        <h3>Individual Scores</h3>

        <div className="individual-scoring">
          <div className="team-scoring-group">
            <h4>For</h4>
            {forParticipants.map((participant) => (
              <div key={participant.id} className="participant-score">
                <span className="participant-name">{participant.name}</span>
                <div className="score-control">
                  <button
                    onClick={() =>
                      updateParticipantScore(
                        participant.id,
                        Math.max(0, participant.individual_score - 1)
                      )
                    }
                    className="btn btn-small"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span className="score-value">{participant.individual_score}</span>
                  <button
                    onClick={() =>
                      updateParticipantScore(
                        participant.id,
                        participant.individual_score + 1
                      )
                    }
                    className="btn btn-small"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="team-scoring-group">
            <h4>Against</h4>
            {againstParticipants.map((participant) => (
              <div key={participant.id} className="participant-score">
                <span className="participant-name">{participant.name}</span>
                <div className="score-control">
                  <button
                    onClick={() =>
                      updateParticipantScore(
                        participant.id,
                        Math.max(0, participant.individual_score - 1)
                      )
                    }
                    className="btn btn-small"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span className="score-value">{participant.individual_score}</span>
                  <button
                    onClick={() =>
                      updateParticipantScore(
                        participant.id,
                        participant.individual_score + 1
                      )
                    }
                    className="btn btn-small"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
