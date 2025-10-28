import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '../utils/apiConfig';
import FaceVerificationVoting from '../components/FaceVerificationVoting';
import { Clock, Copy, Check } from 'lucide-react';

const SecureVoting = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const autoRequestedRef = useRef(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [primaryKey, setPrimaryKey] = useState('');
  const [confirmationKey, setConfirmationKey] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusHint, setStatusHint] = useState('');
  const [election, setElection] = useState(null);
  const [faceVerificationRequired, setFaceVerificationRequired] = useState(false);
  const [faceVerificationComplete, setFaceVerificationComplete] = useState(false);
  const [faceVerificationData, setFaceVerificationData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // Timer for key expiry
  const [timerActive, setTimerActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const keyInputRef = useRef(null);

  // Fetch election details
  const fetchElectionDetails = useCallback(async () => {
    try {
      const response = await fetch(API_CONFIG.getAPIURL(`/api/elections/${electionId}`));
      const data = await response.json();
      setElection(data);
    } catch (error) {
      console.error('Error fetching election:', error);
    }
  }, [electionId]);

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch(API_CONFIG.getAPIURL(`/api/candidates/election/${electionId}`));
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  }, [electionId]);

  useEffect(() => {
    fetchElectionDetails();
    fetchCandidates();
  }, [fetchElectionDetails, fetchCandidates]);

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerActive(false);
            setMessage('❌ Your voting key has expired. Please request a new one.');
            setStep(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft]);

  // If redirected back from Vote.jsx with confirmation, show Step 4
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('confirmed') === '1') {
      setStep(4);
      setMessage('✅ Vote submitted successfully! Confirmation sent to your email.');
    }
  }, [location.search]);

  // If voting key is passed via navigation state, pre-fill and go to step 2
  useEffect(() => {
    if (location.state?.votingKey) {
      setPrimaryKey(location.state.votingKey);
      setStep(2);
      setTimeLeft(300); // Start 5-minute timer
      setTimerActive(true);
    }
  }, [location.state]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(primaryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSelectKey = () => {
    if (keyInputRef.current) {
      keyInputRef.current.select();
    }
  };

  // Prefill email from logged-in user
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.email) setEmail(u.email);
      }
    } catch {}
  }, []);

  // Auto-request key once when email is known and we are on Step 1
  useEffect(() => {
    if (step === 1 && email && !autoRequestedRef.current) {
      autoRequestedRef.current = true;
      requestVotingKey();
    }
  }, [step, email]);

  // Step 1: Request voting key
  const requestVotingKey = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');
    setStatusHint('');

    try {
      const response = await fetch(API_CONFIG.getAPIURL('/api/secure-voting/request-key'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          electionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to key display page where user can copy the key
        navigate(`/voting-key/${electionId}`, {
          state: {
            election,
            expiryTime: data.keyExpiry
          }
        });
      } else {
        setMessage(`❌ ${data.message}`);
        // If election inactive or user missing, provide a hint
        if (data.message?.toLowerCase().includes('not currently active')) {
          setStatusHint('Tip: Set accurate Start/End Date & Time for this election in Admin > Create Election.');
        }
        // If key already generated, redirect to key display page
        if (data.message?.toLowerCase().includes('already generated')) {
          navigate(`/voting-key/${electionId}`, {
            state: { election }
          });
        }
      }
    } catch (error) {
      setMessage('❌ Error requesting voting key');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify voting key
  const verifyVotingKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_CONFIG.getAPIURL('/api/secure-voting/verify-key'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryKey,
          electionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConfirmationKey(data.confirmationKey);
        setMessage('✅ Voting key verified. Proceeding to candidate selection...');
        // Skip face verification - go directly to step 3
        setStep(3);
        setTimeLeft(300); // Reset timer for confirmation key (5 minutes)
        setTimerActive(true);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error verifying voting key');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit vote
  const submitVote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_CONFIG.getAPIURL('/api/secure-voting/submit-vote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationKey,
          electionId,
          candidateId: selectedCandidate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Vote submitted successfully! Confirmation sent to your email.');
        setStep(4);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error submitting vote');
    } finally {
      setLoading(false);
    }
  };

  // Face verification handlers
  const handleFaceVerificationSuccess = (data) => {
    setFaceVerificationComplete(true);
    setFaceVerificationData(data);
    setMessage('✅ Face verification successful! Proceeding to candidate selection...');
    setStep(3); // Move to candidate selection
  };

  const handleFaceVerificationFailed = (error) => {
    if (error.requiresFaceRegistration) {
      setMessage('❌ Face not registered. Please register your face first.');
      setStep(1); // Go back to start
    } else {
      setMessage('❌ Face verification failed. Please try again.');
      setStep(2); // Go back to key verification
    }
  };

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">🔐 Secure Voting System</h1>
            <p className="text-blue-100">Multi-layer cryptographic security</p>
            {election && (
              <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
                <h2 className="text-xl font-semibold">{election.title}</h2>
                <p className="text-sm">{election.description}</p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    {stepNumber}
                  </div>
                  <div className="ml-2 text-sm">
                    {stepNumber === 1 && 'Request Key'}
                    {stepNumber === 2 && 'Verify Key'}
                    {stepNumber === 3 && 'Cast Vote'}
                    {stepNumber === 4 && 'Confirmed'}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 h-1 ml-4 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Step 1: Request Voting Key */}
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Step 1: Request Voting Key</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">🔐 Security Features</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Cryptographic key-based authentication</li>
                  <li>• Multi-layer verification process</li>
                  <li>• Blockchain-secured voting</li>
                  <li>• Email-based key delivery</li>
                </ul>
                {statusHint && (
                  <div className="mt-3 text-sm text-blue-800">{statusHint}</div>
                )}
              </div>
              <form onSubmit={requestVotingKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your registered email"
                    required
                  />
                  {!email && (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const stored = localStorage.getItem('user');
                          if (stored) {
                            const u = JSON.parse(stored);
                            if (u?.email) setEmail(u.email);
                          }
                        } catch {}
                      }}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Use my account email
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Requesting Key...' : 'Request Voting Key'}
                </button>
                <button
                  type="button"
                  onClick={() => requestVotingKey()}
                  disabled={loading || !email}
                  className="w-full border border-blue-300 text-blue-700 py-3 px-6 rounded-lg hover:bg-blue-50 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Working...' : 'Start Secure Voting (One-Click)'}
                </button>
                <div className="mt-4 text-sm text-blue-800">
                  Tip: If you're logged in, you can use the "Start Secure Voting" button above to request a key using your account email.
                </div>
              </form>
            </div>
          )}

            {/* Step 2: Verify Voting Key */}
            {step === 2 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Step 2: Verify Voting Key</h3>
                <div className="bg-yellow-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">📧 Check Your Email</h4>
                  <p className="text-yellow-700">
                    A voting key has been sent to your email. Enter the 64-character key below.
                  </p>
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-yellow-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Key expires in: {formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
                <form onSubmit={verifyVotingKey} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voting Key (64 characters)
                    </label>
                    <input
                      ref={keyInputRef}
                      type="text"
                      value={primaryKey}
                      onChange={(e) => setPrimaryKey(e.target.value)}
                      onClick={handleSelectKey}
                      placeholder="Paste your 64-character voting key here"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50 hover:bg-white transition"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Check your email for the voting key, or click "View My Key" below
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Verifying...' : 'Verify Key'}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestVotingKey()}
                    disabled={loading || !email}
                    className="w-full border border-yellow-300 text-yellow-700 py-3 px-6 rounded-lg hover:bg-yellow-50 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Sending...' : 'Resend Key'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/voting-key/${electionId}`, { state: { election } })}
                    className="w-full border border-blue-300 text-blue-700 py-3 px-6 rounded-lg hover:bg-blue-50 font-semibold"
                  >
                    📧 View My Key
                  </button>
                </form>
              </div>
            )}

            {/* Step 2.5: Face Verification */}
            {step === 2.5 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Step 2.5: Face Verification</h3>
                <div className="bg-purple-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-purple-800 mb-2">🔐 Identity Verification Required</h4>
                  <p className="text-purple-700">
                    For secure voting, please verify your identity using face recognition.
                  </p>
                </div>
                
                <FaceVerificationVoting
                  onVerificationSuccess={handleFaceVerificationSuccess}
                  onVerificationFailed={handleFaceVerificationFailed}
                  electionId={electionId}
                  isRequired={true}
                />

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep(2)}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    ← Back to Key Verification
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Cast Vote */}
            {step === 3 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Step 3: Cast Your Vote</h3>
                <div className="bg-green-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Key Verified</h4>
                  <p className="text-green-700">
                    Your voting key has been verified. Select your candidate and submit your vote.
                  </p>
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-green-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
                <form onSubmit={submitVote} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Your Candidate
                    </label>
                    <div className="space-y-3">
                      {candidates.map((candidate) => (
                        <label key={candidate.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="candidate"
                            value={candidate.id}
                            checked={selectedCandidate === candidate.id}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            className="mr-4 text-blue-600"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">{candidate.name}</div>
                            <div className="text-sm text-gray-600">{candidate.party}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !selectedCandidate}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Submitting Vote...' : 'Submit Vote'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 4: Vote Confirmed */}
            {step === 4 && (
              <div className="text-center">
                <div className="bg-green-100 p-8 rounded-lg">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-4">Vote Successfully Submitted!</h3>
                  <p className="text-green-700 mb-6">
                    Your vote has been cryptographically secured and recorded on the blockchain.
                    A confirmation email has been sent to your email address.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Security Features Applied:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✅ Cryptographic key verification</li>
                      <li>✅ Blockchain recording</li>
                      <li>✅ Immutable vote record</li>
                      <li>✅ Complete audit trail</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureVoting;
