import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileFaceVerification from '../components/MobileFaceVerification';
import { toast } from 'react-toastify';
import API_CONFIG from '../utils/apiConfig';

const FaceRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [, setRegistrationComplete] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    // Check if user is logged in
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
        setRegistrationComplete(true);
        setStep(4); // Show completion step
      }
    } catch (error) {
      console.error('Error checking face status:', error);
    }
  };

  const handleFaceDetected = (descriptor) => {
    if (descriptor && descriptor.length === 128) {
      setFaceDescriptor(descriptor);
      setError('');
    } else {
      setError('Invalid face descriptor. Please try again.');
    }
  };

  const registerFace = async () => {
    if (!faceDescriptor) {
      setError('Please ensure your face is detected before registering.');
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
        body: JSON.stringify({
          faceDescriptor: Array.from(faceDescriptor) // Convert to array
        })
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationComplete(true);
        setStep(4);
        toast.success('Face registered successfully!');
      } else {
        setError(data.message || 'Failed to register face');
        setAttempts(attempts + 1);
        
        if (attempts >= maxAttempts - 1) {
          setError('Maximum registration attempts reached. Please try again later.');
          setStep(5); // Show error step
        }
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setError('Network error. Please check your connection and try again.');
      setAttempts(attempts + 1);
    } finally {
      setLoading(false);
    }
  };

  const retryRegistration = () => {
    setStep(1);
    setError('');
    setAttempts(0);
    setFaceDescriptor(null);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🔐 Face Verification Registration
            </h1>
            <p className="text-gray-600">
              Register your face for secure voting authentication
            </p>
          </div>

          {/* Step 1: Instructions */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">
                  📋 Registration Instructions
                </h3>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Ensure good lighting and face the camera directly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Remove glasses, hats, or face coverings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Look directly at the camera and hold still</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Wait for face detection before proceeding</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Face Registration
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Face Detection */}
          {step === 2 && (
            <div className="space-y-6">
              <MobileFaceVerification
                mode="register"
                onVerificationSuccess={(descriptor, confidence) => {
                  setFaceDescriptor(descriptor);
                  setError('');
                  // Auto-advance to step 3 after successful capture
                  setTimeout(() => setStep(3), 500);
                }}
                onVerificationFailure={(message) => {
                  setError(message);
                }}
              />

              <div className="text-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  ← Back to Instructions
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Registration Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🔒 Confirm Face Registration
                </h3>
                <p className="text-gray-600 mb-6">
                  Your face has been detected. Click below to complete the registration.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Important Security Notice
                </h4>
                <ul className="text-yellow-700 space-y-2">
                  <li>• Your face data will be encrypted and stored securely</li>
                  <li>• Face verification will be required for all voting activities</li>
                  <li>• You can disable face verification in settings if needed</li>
                  <li>• This registration is one-time only</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={registerFace}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Retake Photo
                </button>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-red-800">{error}</p>
                  {attempts < maxAttempts && (
                    <p className="text-sm text-red-600 mt-2">
                      Attempts remaining: {maxAttempts - attempts}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Registration Complete */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-semibold text-green-800 mb-4">
                  Registration Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your face has been successfully registered for secure voting.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-4">
                  ✅ What's Next?
                </h4>
                <ul className="text-green-700 space-y-2">
                  <li>• Face verification will be required for all voting activities</li>
                  <li>• You can now participate in secure elections</li>
                  <li>• Manage your face verification settings in your profile</li>
                  <li>• Contact support if you need to re-register</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={goToDashboard}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={goToSettings}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Settings
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Error State */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-2xl font-semibold text-red-800 mb-4">
                  Registration Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  We encountered issues registering your face. Please try again.
                </p>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-4">
                  🔧 Troubleshooting Tips
                </h4>
                <ul className="text-red-700 space-y-2">
                  <li>• Ensure good lighting conditions</li>
                  <li>• Remove glasses, hats, or face coverings</li>
                  <li>• Look directly at the camera</li>
                  <li>• Try a different browser or device</li>
                  <li>• Check camera permissions</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={retryRegistration}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={goToDashboard}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;