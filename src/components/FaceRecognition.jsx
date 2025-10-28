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


import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadFaceModels, checkModelsAvailability } from '../utils/faceModelLoader';

const FaceRecognition = ({
  onFaceDetected,
  onVerificationComplete,
  verificationMode = false,
  faceDescriptorToVerify,
  threshold = 0.6,
}) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading face detection models...');
        
        // Check if models are available first
        const modelsAvailable = await checkModelsAvailability();
        if (!modelsAvailable) {
          throw new Error('Face detection models are not accessible. Please ensure models are in /public/models/ directory.');
        }

        // Load models using the robust loader
        await loadFaceModels();
        console.log('All models loaded successfully!');
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

  // Handle video play
  const onPlay = async () => {
    if (!detectionActive || !videoRef.current || !canvasRef.current) return;

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
          onFaceDetected?.(detections[0].descriptor);
        }

        // If in verification mode and we have a face to verify against
        if (verificationMode && faceDescriptorToVerify && detections.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher([faceDescriptorToVerify], threshold);
          const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
          
          setVerificationResult(bestMatch);
          onVerificationComplete?.(bestMatch.distance <= threshold);
        }
      } else {
        setFaceDetected(false);
      }
    } catch (err) {
      console.error('Error in face detection:', err);
    }

    // Continue detection loop
    if (detectionActive) {
      setTimeout(() => onPlay(), 100);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
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
          <p>Loading face detection models...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-purple-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 text-blue-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {verificationMode && verificationResult && (
        <div className={`text-center p-3 rounded-lg ${
          verificationResult.distance <= threshold 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {verificationResult.distance <= threshold ? (
            <p>✅ Face verified successfully!</p>
          ) : (
            <p>❌ Face doesn't match. Please try again.</p>
          )}
          <p className="text-xs mt-1">
            Match confidence: {(1 - verificationResult.distance).toFixed(2) * 100}%
          </p>
        </div>
      )}

      {!verificationMode && faceDetected && (
        <div className="text-green-600 bg-green-50 p-2 rounded-lg text-center">
          Face detected! Hold still for verification...
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
