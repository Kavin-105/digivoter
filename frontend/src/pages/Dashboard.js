import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { electionAPI } from '../services/api';

const Dashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingElection, setDeletingElection] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await electionAPI.getMyElections();
      setElections(response.data.elections);
    } catch (error) {
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }
    
    setDeletingElection(electionId);
    try {
      await electionAPI.deleteElection(electionId);
      setElections(elections.filter(election => election._id !== electionId));
    } catch (error) {
      setError('Failed to delete election');
    } finally {
      setDeletingElection(null);
    }
  };

  // Professional styling
  const styles = {
    dashboardContainer: {
      padding: '2rem',
      minHeight: 'calc(100vh - 80px)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: '#f8fafc',
      color: '#1e293b'
    },
    headerSection: {
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    headerTitle: {
      color: '#0f172a',
      fontWeight: '600',
      fontSize: '1.875rem',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem',
      fontWeight: '400',
      margin: '0'
    },
    createBtn: {
      padding: '0.75rem 1.5rem',
      fontWeight: '600',
      borderRadius: '0.375rem',
      border: 'none',
      fontSize: '0.875rem',
      backgroundColor: '#1d4ed8',
      color: 'white',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    loadingSpinner: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      gap: '1rem'
    },
    loadingText: {
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    emptyStateCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      textAlign: 'center',
      padding: '3rem 2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: '0.6'
    },
    emptyTitle: {
      color: '#0f172a',
      marginBottom: '0.5rem',
      fontSize: '1.25rem',
      fontWeight: '600'
    },
    emptyText: {
      color: '#64748b',
      marginBottom: '2rem',
      fontSize: '0.875rem',
      lineHeight: '1.6'
    },
    electionsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    electionsTitle: {
      color: '#0f172a',
      fontWeight: '600',
      fontSize: '1.25rem',
      margin: '0'
    },
    electionsCount: {
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    electionCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      height: '100%',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      cursor: 'default'
    },
    electionCardHeader: {
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      padding: '1rem 1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem'
    },
    electionTitle: {
      color: '#0f172a',
      fontWeight: '600',
      margin: '0',
      fontSize: '1rem',
      lineHeight: '1.5',
      flex: '1'
    },
    electionStatus: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontWeight: '500',
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: 'none',
      whiteSpace: 'nowrap'
    },
    electionCardBody: {
      padding: '1.25rem'
    },
    electionDescription: {
      color: '#64748b',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      fontSize: '0.875rem'
    },
    electionStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statItem: {
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default'
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#0f172a',
      lineHeight: '1.2',
      display: 'block'
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginTop: '0.25rem',
      fontWeight: '600'
    },
    statSubtext: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      marginTop: '0.25rem'
    },
    electionActions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    actionBtn: {
      borderRadius: '0.375rem',
      fontWeight: '600',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '0.5rem 0.75rem',
      fontSize: '0.75rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      color: '#374151',
      flex: '1',
      minWidth: 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.375rem',
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    copyBtn: {
      borderColor: '#2563eb',
      color: '#2563eb'
    },
    resultsBtn: {
      borderColor: '#059669',
      color: '#059669'
    },
    deleteBtn: {
      borderColor: '#dc2626',
      color: '#dc2626',
      backgroundColor: '#fef2f2'
    },
    alertStyle: {
      borderRadius: '0.375rem',
      fontWeight: '500',
      margin: '0 0 2rem 0',
      border: '1px solid #fecaca',
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    createNewSection: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid #e2e8f0'
    }
  };

  if (loading) {
    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.loadingSpinner}>
          <Spinner animation="border" style={{ color: '#2563eb' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p style={styles.loadingText}>Loading your elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Add CSS for hover effects */}
      <style jsx>{`
        .create-btn:hover {
          background-color: #1e40af !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        .create-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .election-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-color: #cbd5e1 !important;
        }
        
        .action-btn-copy:hover {
          background-color: #eff6ff !important;
          border-color: #1d4ed8 !important;
          color: #1e40af !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1) !important;
        }
        
        .action-btn-results:hover {
          background-color: #ecfdf5 !important;
          border-color: #047857 !important;
          color: #065f46 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2), 0 2px 4px -1px rgba(5, 150, 105, 0.1) !important;
        }
        
        .action-btn-delete:hover {
          background-color: #fee2e2 !important;
          border-color: #b91c1c !important;
          color: #991b1b !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2), 0 2px 4px -1px rgba(220, 38, 38, 0.1) !important;
        }
        
        .action-btn-copy:active,
        .action-btn-results:active,
        .action-btn-delete:active {
          transform: translateY(0) !important;
        }
        
        .stat-item:hover {
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
        }
        
        .empty-state-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-color: #cbd5e1 !important;
        }
        
        /* Focus states for accessibility */
        .create-btn:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .action-btn-copy:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .action-btn-results:focus {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
        
        .action-btn-delete:focus {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }
        
        /* Smooth transitions for all interactive elements */
        .create-btn, .election-card, .action-btn-copy, .action-btn-results, .action-btn-delete, .stat-item, .empty-state-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Header Section */}
      <div style={styles.headerSection}>
        <h1 style={styles.headerTitle}>Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user.name}. Manage your elections and monitor voting activity.</p>
      </div>

      {error && (
        <Alert variant="danger" style={styles.alertStyle} dismissible onClose={() => setError('')}>
          Failed to load elections. Please try refreshing the page.
        </Alert>
      )}

      {elections.length === 0 ? (
        <Card style={{...styles.emptyStateCard}} className="empty-state-card">
          <Card.Body>
            <div style={styles.emptyIcon}>🗳️</div>
            <h3 style={styles.emptyTitle}>No Elections Created</h3>
            <p style={styles.emptyText}>
              Get started by creating your first election. Set up secure online voting with customizable options and real-time results tracking.
            </p>
            <Button href="/create-election" style={styles.createBtn} className="create-btn">
              Create Election
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div style={styles.electionsHeader}>
            <h2 style={styles.electionsTitle}>Elections</h2>
            <span style={styles.electionsCount}>
              {elections.length} {elections.length === 1 ? 'election' : 'elections'}
            </span>
          </div>
          
          <Row>
            {elections.map((election) => (
              <Col lg={6} xl={4} key={election._id} style={{marginBottom: '1.5rem'}}>
                <Card style={styles.electionCard} className="election-card">
                  <Card.Header style={styles.electionCardHeader}>
                    <h4 style={styles.electionTitle}>{election.title}</h4>
                    <Badge style={styles.electionStatus}>Active</Badge>
                  </Card.Header>
                  <Card.Body style={styles.electionCardBody}>
                    <p style={styles.electionDescription}>{election.description}</p>
                    
                    <div style={styles.electionStats}>
                      <div style={styles.statItem} className="stat-item">
                        <span style={styles.statNumber}>{election.nominees.length}</span>
                        <div style={styles.statLabel}>Candidates</div>
                      </div>
                      <div style={styles.statItem} className="stat-item">
                        <span style={styles.statNumber}>{election.votersCount || 0}</span>
                        <div style={styles.statLabel}>Total Voters</div>
                        <div style={styles.statSubtext}>
                          {election.votedCount || 0} voted
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.electionActions}>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        style={{...styles.actionBtn, ...styles.copyBtn}}
                        className="action-btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(election.votingUrl);
                          alert('Voting URL copied to clipboard');
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        href={`/results/${election._id}`}
                        variant="outline-success" 
                        size="sm"
                        style={{...styles.actionBtn, ...styles.resultsBtn}}
                        className="action-btn-results"
                      >
                        View Results
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        style={{...styles.actionBtn, ...styles.deleteBtn}}
                        className="action-btn-delete"
                        onClick={() => handleDeleteElection(election._id)}
                        disabled={deletingElection === election._id}
                      >
                        {deletingElection === election._id ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={styles.createNewSection}>
            <Button href="/create-election" style={styles.createBtn} className="create-btn">
              Create New Election
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;