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
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_CONFIG from '../utils/apiConfig';

const FaceVerificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchFaceStatus();
  }, [navigate]);

  const fetchFaceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/status'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setFaceStatus(data.data);
      } else {
        toast.error('Failed to load face verification status');
      }
    } catch (error) {
      console.error('Error fetching face status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDisableFaceVerification = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/disable'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Face verification disabled successfully');
        setFaceStatus(prev => ({ ...prev, faceVerificationEnabled: false }));
        setShowDisableConfirm(false);
      } else {
        toast.error(data.message || 'Failed to disable face verification');
      }
    } catch (error) {
      console.error('Error disabling face verification:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToFaceRegistration = () => {
    navigate('/face-registration');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🔐 Face Verification Settings
            </h1>
            <p className="text-gray-600">
              Manage your face verification preferences for secure voting
            </p>
          </div>

          {faceStatus ? (
            <div className="space-y-6">
              {/* Face Registration Status */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📋 Registration Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Face Registered:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      faceStatus.faceRegistered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {faceStatus.faceRegistered ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Verification Enabled:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      faceStatus.faceVerificationEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {faceStatus.faceVerificationEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              {faceStatus.faceRegistered && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">
                    📊 Registration Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-blue-700">Registration Date:</span>
                      <p className="text-blue-600">{formatDate(faceStatus.registrationDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Verification Count:</span>
                      <p className="text-blue-600">{faceStatus.verificationCount || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Last Verification:</span>
                      <p className="text-blue-600">{formatDate(faceStatus.lastVerification)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Information */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                  🔒 Security Information
                </h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Your face data is encrypted and stored securely</li>
                  <li>• Face verification is required for all secure voting activities</li>
                  <li>• You can disable face verification at any time</li>
                  <li>• Face data is never shared with third parties</li>
                  <li>• You can re-register your face if needed</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!faceStatus.faceRegistered ? (
                  <button
                    onClick={goToFaceRegistration}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Register Face
                  </button>
                ) : faceStatus.faceVerificationEnabled ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Disable Face Verification
                  </button>
                ) : (
                  <button
                    onClick={goToFaceRegistration}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Re-enable Face Verification
                  </button>
                )}

                <button
                  onClick={goToDashboard}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Disable Confirmation Modal */}
              {showDisableConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Disable Face Verification?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      This will disable face verification for your account. You'll need to use alternative authentication methods for secure voting.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleDisableFaceVerification}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Disabling...' : 'Yes, Disable'}
                      </button>
                      <button
                        onClick={() => setShowDisableConfirm(false)}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading face verification status...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationSettings;
