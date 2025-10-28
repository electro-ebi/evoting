import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileFaceVerification from '../components/MobileFaceVerification';
import { CheckCircle, AlertCircle, Home, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import API_CONFIG from '../utils/apiConfig';

const ImprovedFaceRegistration = () => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if face is already registered
    checkFaceStatus();
  }, [navigate]);

  const checkFaceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/status'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.data.faceRegistered) {
        setIsRegistered(true);
        toast.info('Face already registered');
      }
    } catch (error) {
      console.error('Error checking face status:', error);
    }
  };

  const handleVerificationSuccess = async (descriptor, confidence) => {
    if (!descriptor || descriptor.length !== 128) {
      setError('Invalid face descriptor. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/register'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ faceDescriptor: Array.from(descriptor) })
      });

      const data = await response.json();

      if (data.success) {
        setIsRegistered(true);
        toast.success('🎉 Face registered successfully!');
      } else {
        setError(data.message || 'Failed to register face');
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setError('Network error. Please check your connection and try again.');
      toast.error('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationFailure = (message) => {
    setError(message);
    toast.error(message);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Face Already Registered!
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Your face verification is active and ready to use.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-8">
                <h3 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">
                  ✅ What You Can Do
                </h3>
                <ul className="text-left text-gray-700 space-y-2 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Participate in secure elections with face verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Manage verification settings in your profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>View verification statistics and history</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/face-settings')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  <Settings className="w-5 h-5" />
                  Face Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
              🔐 Register Your Face
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Secure your voting with biometric authentication
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm sm:text-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Face Verification Component */}
          <div className="mb-6">
            <MobileFaceVerification
              mode="register"
              onVerificationSuccess={handleVerificationSuccess}
              onVerificationFailure={handleVerificationFailure}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">
                Registering your face... Please wait.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 sm:mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold text-yellow-800 mb-3 text-sm sm:text-base">
              🔒 Security & Privacy
            </h3>
            <ul className="text-yellow-700 space-y-2 text-xs sm:text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your face data is encrypted and stored securely</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Face verification will be required for voting</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can disable verification anytime in settings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your biometric data never leaves our secure servers</span>
              </li>
            </ul>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Skip for now and go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedFaceRegistration;
