const express = require('express');
const crypto = require('crypto');
const Election = require('../models/Election');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate unique voter credentials
const generateVoterCredentials = () => {
  const voterId = crypto.randomBytes(4).toString('hex').toUpperCase();
  const voterKey = crypto.randomBytes(6).toString('hex').toUpperCase();
  return { voterId, voterKey };
};

// Generate unique voting URL
const generateVotingUrl = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Placeholder email function (using nodemailer placeholder)
const sendVoterCredentials = async (voterEmail, voterName, voterId, voterKey, electionTitle) => {
  // TODO: Implement actual email sending with nodemailer
  console.log(`
  ========================================
  VOTER CREDENTIALS for ${electionTitle}
  ========================================
  Name: ${voterName}
  Email: ${voterEmail}
  Voter ID: ${voterId}
  Voter Key: ${voterKey}
  ========================================
  `);
  return true;
};

// Create Election
router.post('/create-election', auth, async (req, res) => {
  try {
    const { title, description, nominees, voters } = req.body;

    // Generate unique voting URL
    const votingUrl = generateVotingUrl();

    // Process nominees
    const processedNominees = nominees.map(name => ({
      name,
      voteCount: 0,
    }));

    // Process voters and generate credentials
    const processedVoters = voters.map(voter => {
      const { voterId, voterKey } = generateVoterCredentials();
      return {
        name: voter.name,
        email: voter.email,
        voterId,
        voterKey,
        hasVoted: false,
      };
    });

    // Create election
    const election = new Election({
      title,
      description,
      creator: req.user.id,
      nominees: processedNominees,
      voters: processedVoters,
      votingUrl,
    });

    await election.save();

    // Send credentials to voters (placeholder)
    console.log('\n🚀 ELECTION CREATED SUCCESSFULLY! 🚀');
    console.log(`Election: ${title}`);
    console.log(`Voting URL: http://localhost:3000/vote/${votingUrl}`);
    console.log('\n📧 SENDING VOTER CREDENTIALS:\n');

    for (const voter of processedVoters) {
      await sendVoterCredentials(
        voter.email,
        voter.name,
        voter.voterId,
        voter.voterKey,
        title
      );
    }

    res.status(201).json({
      message: 'Election created successfully',
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        votingUrl: `http://localhost:3000/vote/${votingUrl}`,
        nominees: election.nominees,
        votersCount: election.voters.length,
      },
    });
  } catch (error) {
    console.error('Election creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's elections
router.get('/my-elections', auth, async (req, res) => {
  try {
    const elections = await Election.find({ creator: req.user.id })
      .select('title description nominees voters votingUrl createdAt') // Select all needed fields
      .sort({ createdAt: -1 });

    // Transform elections to include voter count and voted count
    const formattedElections = elections.map(election => ({
      _id: election._id,
      title: election.title,
      description: election.description,
      nominees: election.nominees,
      votingUrl: `http://localhost:3000/vote/${election.votingUrl}`,
      votersCount: election.voters.length,
      votedCount: election.voters.filter(voter => voter.hasVoted).length,
      createdAt: election.createdAt
    }));

    res.json({ elections: formattedElections });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election by voting URL (public)
router.get('/vote/:votingUrl', async (req, res) => {
  try {
    const { votingUrl } = req.params;

    const election = await Election.findOne({ votingUrl })
      .select('title description nominees voters.voterId -voters.voterKey -voters.email');

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only return basic election info for voting page
    res.json({
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        nominees: election.nominees.map(nominee => ({
          _id: nominee._id,
          name: nominee.name,
        })),
      },
    });
  } catch (error) {
    console.error('Get voting election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election results
router.get('/results/:electionId', async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId)
      .select('title description nominees voters.hasVoted createdAt');

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const totalVoters = election.voters.length;
    const votedCount = election.voters.filter(voter => voter.hasVoted).length;

    res.json({
      election: {
        title: election.title,
        description: election.description,
        nominees: election.nominees,
        totalVoters,
        votedCount,
        createdAt: election.createdAt,
      },
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an election
router.delete('/:id', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if the user is the creator of the election
    if (election.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this election' });
    }

    await Election.findByIdAndDelete(req.params.id);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;