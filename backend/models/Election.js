const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  voterId: {
    type: String,
    required: true,
    unique: true,
  },
  voterKey: {
    type: String,
    required: true,
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
});

const NomineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nominees: [NomineeSchema],
  voters: [VoterSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  votingUrl: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Election', ElectionSchema);