import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const electionAPI = {
  createElection: (electionData) => api.post('/elections/create-election', electionData),
  getMyElections: () => api.get('/elections/my-elections'),
  getElectionForVoting: (votingUrl) => api.get(`/elections/vote/${votingUrl}`),
  getElectionResults: (electionId) => api.get(`/elections/results/${electionId}`),
  deleteElection: (electionId) => api.delete(`/elections/${electionId}`),
};

export const votingAPI = {
  verifyVoter: (credentials) => api.post('/voting/verify-voter', credentials),
  castVote: (voteData) => api.post('/voting/cast-vote', voteData),
};

export default api;