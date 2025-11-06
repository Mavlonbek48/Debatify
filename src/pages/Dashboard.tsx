import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Debate {
  id: string;
  title: string;
  topic: string;
  debate_date: string;
  status: string;
  number_of_teams: number;
}

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .order('debate_date', { ascending: true });

      if (error) throw error;
      setDebates(data || []);
    } catch (error) {
      console.error('Error fetching debates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Debatify</h1>
        <div className="header-actions">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleSignOut} className="btn btn-secondary">
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="content-header">
          <h2>My Debates</h2>
          <button
            onClick={() => navigate('/debates/create')}
            className="btn btn-primary"
          >
            Create New Debate
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading debates...</div>
        ) : debates.length === 0 ? (
          <div className="empty-state">
            <p>No debates yet. Create your first debate to get started!</p>
          </div>
        ) : (
          <div className="debates-grid">
            {debates.map((debate) => (
              <div
                key={debate.id}
                className="debate-card"
                onClick={() => navigate(`/debates/${debate.id}`)}
              >
                <div className="debate-card-header">
                  <h3>{debate.title}</h3>
                  <span className={`status-badge ${getStatusColor(debate.status)}`}>
                    {debate.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="debate-topic">{debate.topic}</p>
                <div className="debate-card-footer">
                  <span className="debate-date">{formatDate(debate.debate_date)}</span>
                  <span className="debate-teams">{debate.number_of_teams} teams</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
