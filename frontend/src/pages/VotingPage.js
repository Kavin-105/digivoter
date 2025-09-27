import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { electionAPI, votingAPI } from '../services/api';

const VotingPage = () => {
  const { votingUrl } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Voting states
  const [step, setStep] = useState('credentials'); // 'credentials', 'voting', 'success'
  const [credentials, setCredentials] = useState({
    voterId: '',
    voterKey: '',
  });
  const [verifiedVoter, setVerifiedVoter] = useState(null);
  const [selectedNominee, setSelectedNominee] = useState('');
  const [voting, setVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState('');

  useEffect(() => {
    fetchElection();
  }, [votingUrl]);

  const fetchElection = async () => {
    try {
      const response = await electionAPI.getElectionForVoting(votingUrl);
      setElection(response.data.election);
    } catch (error) {
      setError('Election not found or invalid voting URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value.toUpperCase(),
    });
  };

  const verifyCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await votingAPI.verifyVoter({
        votingUrl,
        voterId: credentials.voterId,
        voterKey: credentials.voterKey,
      });
      
      setVerifiedVoter(response.data.voter);
      setStep('voting');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (e) => {
    e.preventDefault();
    if (!selectedNominee) {
      setError('Please select a nominee');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await votingAPI.castVote({
        votingUrl,
        voterId: credentials.voterId,
        voterKey: credentials.voterKey,
        nomineeId: selectedNominee,
      });

      setVoteSuccess(response.data.message);
      setStep('success');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading && !election) {
    return (
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <div>Loading election...</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error && !election) {
    return (
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <Alert variant="danger">{error}</Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        {/* Election Header */}
        <Card className="mb-4">
          <Card.Header>
            <h3>{election?.title}</h3>
          </Card.Header>
          <Card.Body>
            <p>{election?.description}</p>
          </Card.Body>
        </Card>

        {/* Step 1: Enter Credentials */}
        {step === 'credentials' && (
          <Card>
            <Card.Header>
              <h5>Enter Your Voting Credentials</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={verifyCredentials}>
                <Form.Group className="mb-3">
                  <Form.Label>Voter ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="voterId"
                    value={credentials.voterId}
                    onChange={handleCredentialsChange}
                    placeholder="Enter your Voter ID (e.g., A1B2C3D4)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Your unique Voter ID was provided to you via email/console
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Voter Key</Form.Label>
                  <Form.Control
                    type="text"
                    name="voterKey"
                    value={credentials.voterKey}
                    onChange={handleCredentialsChange}
                    placeholder="Enter your Voter Key (e.g., 1A2B3C4D5E6F)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Your unique Voter Key was provided to you via email/console
                  </Form.Text>
                </Form.Group>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Credentials'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}

        {/* Step 2: Cast Vote */}
        {step === 'voting' && (
          <Card>
            <Card.Header>
              <h5>Welcome, {verifiedVoter?.name}!</h5>
              <small className="text-muted">Select your preferred nominee and cast your vote</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={castVote}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Nominee</Form.Label>
                  {election?.nominees.map((nominee) => (
                    <div key={nominee._id} className="mb-2">
                      <Form.Check
                        type="radio"
                        id={nominee._id}
                        name="nominee"
                        value={nominee._id}
                        onChange={(e) => setSelectedNominee(e.target.value)}
                        label={nominee.name}
                      />
                    </div>
                  ))}
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button 
                    type="submit" 
                    variant="success" 
                    disabled={voting || !selectedNominee}
                  >
                    {voting ? 'Casting Vote...' : 'Cast Vote'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setStep('credentials');
                      setError('');
                      setSelectedNominee('');
                    }}
                  >
                    Back to Credentials
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card>
            <Card.Body className="text-center">
              <Alert variant="success">
                <h5>✅ Vote Cast Successfully!</h5>
                <p>{voteSuccess}</p>
              </Alert>
              <p>Thank you for participating in this election, {verifiedVoter?.name}!</p>
              <small className="text-muted">
                Your vote has been securely recorded. You cannot vote again in this election.
              </small>
              <div className="mt-3">
                <Button 
                  href={`/results/${election?.id}`}
                  variant="primary"
                >
                  View Election Results
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Election Info Sidebar */}
        {step !== 'success' && (
          <Card className="mt-4">
            <Card.Header>
              <h6>Election Information</h6>
            </Card.Header>
            <Card.Body>
              <p><strong>Nominees ({election?.nominees.length}):</strong></p>
              <ListGroup variant="flush">
                {election?.nominees.map((nominee) => (
                  <ListGroup.Item key={nominee._id}>
                    {nominee.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default VotingPage;