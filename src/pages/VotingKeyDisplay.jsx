/**
 * =====================================================
 * 🗳️ Secure E-Voting System
 * =====================================================
 * 
 * @project     Blockchain-Powered Electronic Voting System
 * @author      Ebi
 * @github      https://github.com/electro-ebi
 * @description A secure, transparent, and tamper-proof voting
 *              system with cryptographic authentication, face
 *              verification, and blockchain integration.
 * 
 * @features    - Multi-layer cryptographic security
 *              - Blockchain vote recording
 *              - Face verification
 *              - Real-time results
 *              - Admin dashboard
 * 
 * @license     MIT
 * @year        2025
 * =====================================================
 */


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Copy, Check, Mail, Clock, Shield, ArrowRight } from 'lucide-react';
import API_CONFIG from '../utils/apiConfig';

const VotingKeyDisplay = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [votingKey, setVotingKey] = useState('');
  const [election, setElection] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch voting key from API or location state
  useEffect(() => {
    const fetchVotingKey = async () => {
      try {
        // First check if key was passed via navigation state
        if (location.state?.votingKey) {
          setVotingKey(location.state.votingKey);
          setElection(location.state.election);
          if (location.state.expiryTime) {
            const expiry = new Date(location.state.expiryTime);
            const now = new Date();
            setTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)));
          }
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API (if user has a key)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email) {
          setError('Please log in to view your voting key');
          setLoading(false);
          return;
        }

        const response = await fetch(
          API_CONFIG.getAPIURL(`/api/secure-voting/get-key/${user.email}/${electionId}`)
        );

        const data = await response.json();
        if (data.success) {
          setVotingKey(data.primaryKey);
          setElection(data.election);
          if (data.expiryTime) {
            const expiry = new Date(data.expiryTime);
            const now = new Date();
            setTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)));
          }
        } else {
          setError(data.message || 'No voting key found');
        }
      } catch (err) {
        console.error('Error fetching voting key:', err);
        setError('Failed to load voting key');
      } finally {
        setLoading(false);
      }
    };

    fetchVotingKey();
  }, [electionId, location.state]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(votingKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy key. Please select and copy manually.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProceedToVoting = () => {
    navigate(`/secure-vote/${electionId}`, {
      state: { votingKey }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your voting key...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">🔐 Your Voting Key</h1>
            <p className="text-blue-100 text-center">Cryptographic Key-Based Authentication</p>
            {election && (
              <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg text-center">
                <h2 className="text-xl font-semibold">{election.title}</h2>
                {election.description && (
                  <p className="text-sm mt-1">{election.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Timer Warning */}
            {timeLeft > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Key Expires Soon</h3>
                    <p className="text-yellow-700">
                      Time remaining: <span className="font-bold text-2xl">{formatTime(timeLeft)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {timeLeft === 0 && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Key Expired</h3>
                    <p className="text-red-700">Please request a new voting key to continue.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Key Display */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-inner mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Your Cryptographic Key
                </h3>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Key
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-black p-6 rounded-lg border-2 border-green-500">
                <code className="text-green-400 font-mono text-lg break-all leading-relaxed tracking-wide">
                  {votingKey}
                </code>
              </div>

              <div className="mt-4 text-gray-300 text-sm">
                <p>💡 <strong>Click "Copy Key"</strong> to copy this key to your clipboard, then paste it in the voting form.</p>
              </div>
            </div>

            {/* Security Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Instructions
              </h4>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Keep this key confidential - do not share it with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>This key is unique to you and this election</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>You will receive a confirmation key after verifying this key</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>All voting activities are cryptographically secured</span>
                </li>
              </ul>
            </div>

            {/* Multi-Layer Security Info */}
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mb-6">
              <h4 className="font-semibold text-purple-900 mb-3">🔒 Multi-Layer Security Features</h4>
              <p className="text-purple-800 text-sm">
                Your vote is protected by multiple cryptographic layers including SHA-512 hashing,
                blockchain verification, and time-based security tokens.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleProceedToVoting}
                disabled={timeLeft === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition"
              >
                Proceed to Voting
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg hover:bg-gray-700 font-semibold shadow-lg transition"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Email Confirmation Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 text-sm text-center">
                📧 This key has also been sent to your registered email address for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingKeyDisplay;
