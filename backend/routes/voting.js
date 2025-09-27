const express = require('express');
const Election = require('../models/Election');
const router = express.Router();

// Verify voter credentials
router.post('/verify-voter', async (req, res) => {
  try {
    const { votingUrl, voterId, voterKey } = req.body;

    const election = await Election.findOne({ votingUrl });
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Find voter in election
    const voter = election.voters.find(
      v => v.voterId === voterId && v.voterKey === voterKey
    );

    if (!voter) {
      return res.status(400).json({ message: 'Invalid voter credentials' });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    res.json({
      message: 'Voter verified successfully',
      voter: {
        name: voter.name,
        voterId: voter.voterId,
      },
    });
  } catch (error) {
    console.error('Voter verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cast vote
router.post('/cast-vote', async (req, res) => {
  try {
    const { votingUrl, voterId, voterKey, nomineeId } = req.body;

    const election = await Election.findOne({ votingUrl });
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Find voter
    const voterIndex = election.voters.findIndex(
      v => v.voterId === voterId && v.voterKey === voterKey
    );

    if (voterIndex === -1) {
      return res.status(400).json({ message: 'Invalid voter credentials' });
    }

    const voter = election.voters[voterIndex];

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Find nominee
    const nomineeIndex = election.nominees.findIndex(
      n => n._id.toString() === nomineeId
    );

    if (nomineeIndex === -1) {
      return res.status(400).json({ message: 'Invalid nominee selected' });
    }

    // Cast vote
    election.nominees[nomineeIndex].voteCount += 1;
    election.voters[voterIndex].hasVoted = true;

    await election.save();

    console.log(`
    ✅ VOTE CAST SUCCESSFULLY!
    Election: ${election.title}
    Voter: ${voter.name} (${voterId})
    Voted for: ${election.nominees[nomineeIndex].name}
    `);

    res.json({
      message: 'Vote cast successfully',
      votedFor: election.nominees[nomineeIndex].name,
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;