import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Participant {
  id: string;
  name: string;
  team: string;
  individual_score: number;
}

interface Award {
  id: string;
  participant_id: string;
  award_type: string;
}

interface AwardsProps {
  debateId: string;
  participants: Participant[];
}

const awardTypes = [
  { value: 'honorable_mention', label: 'Honorable Mention' },
  { value: 'best_speaker', label: 'Best Speaker' },
  { value: 'best_debater', label: 'Best Debater' },
  { value: 'most_creative', label: 'Most Creative Debater' },
];

export const Awards: React.FC<AwardsProps> = ({ debateId, participants }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedAwardType, setSelectedAwardType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAwards();
  }, [debateId]);

  const fetchAwards = async () => {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('debate_id', debateId);

      if (error) throw error;
      setAwards(data || []);
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  };

  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant || !selectedAwardType) return;

    setLoading(true);
    try {
      const existingAward = awards.find(
        (a) =>
          a.participant_id === selectedParticipant && a.award_type === selectedAwardType
      );

      if (existingAward) {
        setMessage('This participant already has this award');
        setTimeout(() => setMessage(''), 2000);
        return;
      }

      const { error } = await supabase.from('awards').insert({
        debate_id: debateId,
        participant_id: selectedParticipant,
        award_type: selectedAwardType,
      });

      if (error) throw error;

      setMessage('Award added successfully');
      setSelectedParticipant('');
      setSelectedAwardType('');
      fetchAwards();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error adding award:', error);
      setMessage('Failed to add award');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAward = async (awardId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('awards').delete().eq('id', awardId);

      if (error) throw error;

      setMessage('Award removed successfully');
      fetchAwards();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error removing award:', error);
      setMessage('Failed to remove award');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantName = (participantId: string) => {
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
  };

  const getAwardLabel = (awardType: string) => {
    return awardTypes.find((a) => a.value === awardType)?.label || awardType;
  };

  const getAwardIcon = (awardType: string) => {
    switch (awardType) {
      case 'honorable_mention':
        return '🏅';
      case 'best_speaker':
        return '🎤';
      case 'best_debater':
        return '🏆';
      case 'most_creative':
        return '💡';
      default:
        return '⭐';
    }
  };

  return (
    <div className="awards-container">
      <h2>Awards and Badges</h2>

      {message && <div className="success-message">{message}</div>}

      <div className="awards-form">
        <h3>Add Award</h3>
        <form onSubmit={handleAddAward}>
          <div className="form-group">
            <label htmlFor="participant">Participant</label>
            <select
              id="participant"
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a participant</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name} ({participant.team})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="awardType">Award Type</label>
            <select
              id="awardType"
              value={selectedAwardType}
              onChange={(e) => setSelectedAwardType(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select an award</option>
              {awardTypes.map((award) => (
                <option key={award.value} value={award.value}>
                  {award.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Award'}
          </button>
        </form>
      </div>

      <div className="awards-list">
        <h3>Awarded Badges</h3>
        {awards.length === 0 ? (
          <p className="empty-message">No awards given yet</p>
        ) : (
          <div className="awards-grid">
            {awards.map((award) => (
              <div key={award.id} className="award-card">
                <div className="award-icon">{getAwardIcon(award.award_type)}</div>
                <div className="award-details">
                  <h4>{getParticipantName(award.participant_id)}</h4>
                  <p>{getAwardLabel(award.award_type)}</p>
                </div>
                <button
                  onClick={() => handleRemoveAward(award.id)}
                  className="btn btn-danger-small"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
