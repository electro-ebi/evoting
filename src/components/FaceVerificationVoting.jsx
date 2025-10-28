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


import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import API_CONFIG from '../utils/apiConfig';
import { loadFaceModels, checkModelsAvailability } from '../utils/faceModelLoader';

const FaceVerificationVoting = ({
  onVerificationSuccess,
  onVerificationFailed,
  electionId,
  isRequired = true
}) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [userFaceDescriptor, setUserFaceDescriptor] = useState(null);
  const maxAttempts = 3;

  // Load models and start video
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading face detection models for verification...');
        
        // Check if models are available first
        const modelsAvailable = await checkModelsAvailability();
        if (!modelsAvailable) {
          throw new Error('Face detection models are not accessible. Please ensure models are in /public/models/ directory.');
        }

        // Load models using the robust loader
        await loadFaceModels();
        console.log('All models loaded successfully for verification!');
        startVideo();
      } catch (err) {
        console.error('Error loading models:', err);
        setError(`Failed to load face detection models: ${err.message}. Please check if models are in /public/models/ directory and refresh the page.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  // Start video stream with mobile compatibility
  const startVideo = () => {
    // Check for camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access not supported on this device. Please use a modern browser with camera support.');
      return;
    }

    // Mobile-optimized video constraints
    const constraints = {
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        facingMode: 'user', // Front camera for mobile
        frameRate: { ideal: 15, max: 30 } // Lower frame rate for mobile performance
      },
      audio: false
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.warn('Video autoplay failed:', err);
            // This is normal on mobile, user needs to interact first
          });
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        let errorMessage = 'Could not access camera. ';
        
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please grant camera permissions and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported on this browser. Try Chrome or Safari.';
        } else {
          errorMessage += 'Please ensure you have granted camera permissions.';
        }
        
        setError(errorMessage);
      });
  };

  // Stop video stream
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // Handle video play and face detection
  const onPlay = async () => {
    if (!detectionActive || !videoRef.current || !canvasRef.current || isVerifying) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Clear canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw detections
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // Handle face detection
      if (detections.length > 0) {
        if (!faceDetected) {
          setFaceDetected(true);
        }

        // If we have a user face descriptor, perform verification
        if (userFaceDescriptor && detections.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher([userFaceDescriptor], 0.6);
          const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
          
          setVerificationResult(bestMatch);
          
          // Auto-verify if match is good enough
          if (bestMatch.distance <= 0.6) {
            await performVerification(detections[0].descriptor);
          }
        }
      } else {
        setFaceDetected(false);
        setVerificationResult(null);
      }
    } catch (err) {
      console.error('Error in face detection:', err);
    }

    // Continue detection loop
    if (detectionActive && !isVerifying) {
      setTimeout(() => onPlay(), 100);
    }
  };

  // Perform face verification with backend
  const performVerification = async (faceDescriptor) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/verify'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faceDescriptor: faceDescriptor,
          electionId: electionId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update token with face verification
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        setDetectionActive(false);
        toast.success('Face verification successful!');
        onVerificationSuccess?.(data);
      } else {
        setAttempts(attempts + 1);
        setError(data.message || 'Face verification failed');
        
        if (attempts >= maxAttempts - 1) {
          setError('Maximum verification attempts reached. Please try again later.');
          onVerificationFailed?.(data);
        } else {
          toast.error(`Verification failed. ${maxAttempts - attempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      setError('Network error during verification. Please try again.');
      setAttempts(attempts + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  // Load user's face descriptor for comparison
  useEffect(() => {
    const loadUserFaceDescriptor = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/status'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success && data.data.faceRegistered && data.data.faceDescriptor) {
          setUserFaceDescriptor(data.data.faceDescriptor);
        } else {
          setError('Face not registered. Please register your face first.');
          onVerificationFailed?.({ requiresFaceRegistration: true });
        }
      } catch (error) {
        console.error('Error loading user face descriptor:', error);
        setError('Failed to load face data. Please try again.');
      }
    };

    loadUserFaceDescriptor();
  }, [onVerificationFailed]);

  // Manual verification trigger
  const handleManualVerification = async () => {
    if (!faceDetected) {
      setError('Please ensure your face is detected first.');
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        await performVerification(detections[0].descriptor);
      } else {
        setError('No face detected. Please position your face in the camera view.');
      }
    } catch (error) {
      console.error('Error in manual verification:', error);
      setError('Failed to detect face. Please try again.');
    }
  };

  const retryVerification = () => {
    setError('');
    setAttempts(0);
    setVerificationResult(null);
    setDetectionActive(true);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          🔐 Face Verification Required
        </h3>
        <p className="text-gray-600">
          {isRequired 
            ? 'Please verify your identity to continue with voting'
            : 'Optional face verification for enhanced security'
          }
        </p>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          onPlay={onPlay}
          className="rounded-lg border-2 border-gray-300"
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0"
        />
      </div>

      {isLoading && (
        <div className="text-center">
          <p className="text-gray-600">Loading face detection models...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-purple-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg max-w-md">
          <p className="font-semibold">{error}</p>
          {attempts < maxAttempts && (
            <p className="text-sm mt-2">
              Attempts remaining: {maxAttempts - attempts}
            </p>
          )}
          <button
            onClick={retryVerification}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {verificationResult && (
        <div className={`text-center p-4 rounded-lg max-w-md ${
          verificationResult.distance <= 0.6 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {verificationResult.distance <= 0.6 ? (
            <div>
              <p className="font-semibold">✅ Face Match Found!</p>
              <p className="text-sm mt-1">
                Match confidence: {((1 - verificationResult.distance) * 100).toFixed(1)}%
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">❌ Face Doesn't Match</p>
              <p className="text-sm mt-1">
                Similarity: {((1 - verificationResult.distance) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {faceDetected && !verificationResult && !isVerifying && (
        <div className="text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold mb-3">
              Face detected! Click below to verify your identity.
            </p>
            <button
              onClick={handleManualVerification}
              disabled={isVerifying}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Face'}
            </button>
          </div>
        </div>
      )}

      {isVerifying && (
        <div className="text-center">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              🔄 Verifying your identity...
            </p>
            <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
              <div className="bg-yellow-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      {!isRequired && (
        <div className="text-center">
          <button
            onClick={() => onVerificationFailed?.({ skipped: true })}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Skip Face Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceVerificationVoting;
