import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Timer } from '../components/Timer';
import { Scoring } from '../components/Scoring';
import { Awards } from '../components/Awards';

interface Debate {
  id: string;
  title: string;
  topic: string;
  debate_date: string;
  status: string;
  number_of_teams: number;
}

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

export const DebateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timer' | 'scoring' | 'awards'>('overview');

  useEffect(() => {
    fetchDebateData();
  }, [id]);

  const fetchDebateData = async () => {
    try {
      const [debateResult, participantsResult, teamsResult] = await Promise.all([
        supabase.from('debates').select('*').eq('id', id).maybeSingle(),
        supabase.from('participants').select('*').eq('debate_id', id),
        supabase.from('teams').select('*').eq('debate_id', id),
      ]);

      if (debateResult.error) throw debateResult.error;
      if (participantsResult.error) throw participantsResult.error;
      if (teamsResult.error) throw teamsResult.error;

      setDebate(debateResult.data);
      setParticipants(participantsResult.data || []);
      setTeams(teamsResult.data || []);
    } catch (error) {
      console.error('Error fetching debate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDebateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('debates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setDebate((prev) => (prev ? { ...prev, status } : null));
    } catch (error) {
      console.error('Error updating debate status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading debate...</div>;
  }

  if (!debate) {
    return <div className="error">Debate not found</div>;
  }

  const forTeam = participants.filter((p) => p.team === 'for');
  const againstTeam = participants.filter((p) => p.team === 'against');

  return (
    <div className="debate-detail">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
        <div className="header-info">
          <h1>{debate.title}</h1>
          <span className={`status-badge status-${debate.status.replace('_', '-')}`}>
            {debate.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <div className="debate-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          Timer
        </button>
        <button
          className={`tab ${activeTab === 'scoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('scoring')}
        >
          Scoring
        </button>
        <button
          className={`tab ${activeTab === 'awards' ? 'active' : ''}`}
          onClick={() => setActiveTab('awards')}
        >
          Awards
        </button>
      </div>

      <div className="debate-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="debate-info">
              <h2>Debate Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Topic:</label>
                  <p>{debate.topic}</p>
                </div>
                <div className="info-item">
                  <label>Date:</label>
                  <p>{new Date(debate.debate_date).toLocaleString()}</p>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <div className="status-controls">
                    <button
                      className={`btn ${debate.status === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateDebateStatus('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button
                      className={`btn ${debate.status === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateDebateStatus('in_progress')}
                    >
                      In Progress
                    </button>
                    <button
                      className={`btn ${debate.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => updateDebateStatus('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="teams-section">
              <h2>Teams</h2>
              <div className="teams-grid">
                <div className="team-card team-for">
                  <h3>For</h3>
                  <div className="team-members">
                    {forTeam.length > 0 ? (
                      forTeam.map((participant) => (
                        <div key={participant.id} className="member-item">
                          {participant.name}
                        </div>
                      ))
                    ) : (
                      <p>No participants</p>
                    )}
                  </div>
                </div>

                <div className="team-card team-against">
                  <h3>Against</h3>
                  <div className="team-members">
                    {againstTeam.length > 0 ? (
                      againstTeam.map((participant) => (
                        <div key={participant.id} className="member-item">
                          {participant.name}
                        </div>
                      ))
                    ) : (
                      <p>No participants</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timer' && <Timer />}

        {activeTab === 'scoring' && (
          <Scoring
            debateId={debate.id}
            participants={participants}
            teams={teams}
            onUpdate={fetchDebateData}
          />
        )}

        {activeTab === 'awards' && (
          <Awards debateId={debate.id} participants={participants} />
        )}
      </div>
    </div>
  );
};
