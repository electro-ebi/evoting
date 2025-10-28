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


import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const MobileFaceVerification = ({
  onVerificationSuccess,
  onVerificationFailure,
  mode = 'register', // 'register' or 'verify'
  storedDescriptor = null,
  threshold = 0.6,
}) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const detectionIntervalRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [debugMetrics, setDebugMetrics] = useState(null);
  const [showDebug, setShowDebug] = useState(true); // Show debug info
  const maxAttempts = 3;

  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('📦 Loading face detection models...');
        setIsLoading(true);
        setError(null);
        
        // Use PUBLIC_URL for correct path in React
        // Add timestamp to bust cache
        const cacheBuster = Date.now();
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        console.log('📁 Model path:', MODEL_URL);
        console.log('🔄 Cache buster:', cacheBuster);
        
        // Load all required models with individual error handling
        console.log('Loading tiny face detector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('✓ Tiny face detector loaded');
        
        console.log('Loading face landmarks...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('✓ Face landmarks loaded');
        
        console.log('Loading face recognition...');
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log('✓ Face recognition loaded');
        
        console.log('Loading face expressions...');
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('✓ Face expressions loaded');
        
        console.log('✅ All face detection models loaded successfully!');
        setModelsLoaded(true);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading models:', err);
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        
        let errorMessage = 'Failed to load face detection models. ';
        if (err.message.includes('fetch')) {
          errorMessage += 'Network error - please check your internet connection and ensure models are in /public/models/ folder.';
        } else if (err.message.includes('404')) {
          errorMessage += 'Model files not found. Please ensure all model files are in /public/models/ directory.';
        } else {
          errorMessage += err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      stopVideo();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Don't auto-start camera - always wait for user interaction
  // This is better for privacy and browser compatibility
  useEffect(() => {
    // No auto-start - user must click button to start camera
  }, [modelsLoaded, cameraReady, isMobile]);

  // Start camera with mobile-optimized settings
  const startVideo = async () => {
    try {
      console.log('📹 Starting camera...');
      setError(null);
      
      // Check for HTTPS requirement on iOS
      if (isMobile && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        setError('⚠️ iOS requires HTTPS for camera access. Please use: https://' + window.location.host + ' or use an Android device.');
        return;
      }

      // Check for mediaDevices support with fallback
      const getUserMedia = navigator.mediaDevices?.getUserMedia || 
                          navigator.getUserMedia || 
                          navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia;

      if (!getUserMedia) {
        // Provide helpful error based on device
        if (isMobile) {
          setError('Camera API not available. Please ensure you are using a modern browser (Chrome on Android, Safari on iOS) and accessing via HTTPS or localhost.');
        } else {
          setError('Camera access not supported on this browser. Please use Chrome, Firefox, Safari, or Edge.');
        }
        return;
      }

      // Mobile-optimized video constraints
      const constraints = {
        video: {
          width: { ideal: isMobile ? 480 : 640, max: 1280 },
          height: { ideal: isMobile ? 360 : 480, max: 720 },
          facingMode: 'user', // Front camera
          frameRate: { ideal: isMobile ? 15 : 24, max: 30 }
        },
        audio: false
      };

      // Try to get user media with modern API first
      let stream;
      if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Fallback for older browsers
        stream = await new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              console.log('✅ Camera started successfully');
              setCameraReady(true);
              setError(null);
              
              // Start face detection
              setTimeout(() => startDetection(), 1000);
            })
            .catch(err => {
              console.error('Video play error:', err);
              setError('Failed to start video playback. Please tap to start camera.');
            });
        };
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = '🚫 Camera permission denied. Please:\n';
        if (isMobile) {
          errorMessage += '1. Tap "Allow" when prompted\n';
          errorMessage += '2. Check browser settings if no prompt appears\n';
          errorMessage += '3. On iOS, go to Settings > Safari > Camera > Allow';
        } else {
          errorMessage += '1. Click "Allow" when prompted\n';
          errorMessage += '2. Check browser address bar for camera icon\n';
          errorMessage += '3. Go to browser settings and allow camera access';
        }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = '📷 No camera found. Please ensure your device has a working camera.';
      } else if (err.name === 'NotSupportedError' || err.name === 'TypeError') {
        errorMessage = '⚠️ Camera not supported. ';
        if (isMobile) {
          errorMessage += 'Please use Chrome (Android) or Safari (iOS) with HTTPS.';
        } else {
          errorMessage += 'Please use a modern browser (Chrome, Firefox, Safari, Edge).';
        }
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = '🔒 Camera is already in use by another application. Please close other apps using the camera.';
      } else {
        errorMessage += err.message || 'Please check your camera and try again.';
      }
      
      setError(errorMessage);
    }
  };

  // Stop video stream
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  // Start face detection
  const startDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Detect faces at regular intervals
    detectionIntervalRef.current = setInterval(async () => {
      await detectFace();
    }, isMobile ? 200 : 100); // Slower on mobile to conserve battery
  }, [isMobile, mode, storedDescriptor, threshold]);

  // Detect face in video stream
  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: isMobile ? 224 : 416, // Smaller input size for mobile
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Clear and update canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const displaySize = { 
        width: videoRef.current.videoWidth, 
        height: videoRef.current.videoHeight 
      };
      
      // Ensure canvas matches video dimensions
      if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
        faceapi.matchDimensions(canvas, displaySize);
      }
      
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Draw face detection box
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        const descriptor = detections[0].descriptor;
        setFaceDetected(true);
        setFaceDescriptor(descriptor);

        // Handle based on mode
        if (mode === 'register') {
          // Registration mode - just capture the descriptor
          const quality = calculateDescriptorQuality(descriptor);
          setConfidence(quality);
          
          console.log('📊 Face Quality:', {
            quality: (quality * 100).toFixed(1) + '%',
            descriptorLength: descriptor.length,
            readyToCapture: quality > 0.4 ? 'YES' : 'NO'
          });
          
          if (quality > 0.4) { // Lowered from 0.7 for better mobile compatibility
            setVerificationStatus('ready');
          }
        } else if (mode === 'verify' && storedDescriptor) {
          // Verification mode - Professional multi-metric comparison
          const matchResult = advancedFaceMatching(descriptor, storedDescriptor);
          
          setConfidence(matchResult.confidence);
          
          const debugInfo = {
            confidence: (matchResult.confidence * 100).toFixed(1) + '%',
            euclideanDistance: matchResult.metrics.euclideanDistance.toFixed(3),
            cosineSimilarity: matchResult.metrics.cosine.toFixed(3),
            isMatch: matchResult.isMatch ? '✅ MATCH' : '❌ NO MATCH',
            euclideanLimit: matchResult.metrics.euclideanDistance <= 0.7 ? 'PASS' : 'FAIL',
            cosineLimit: matchResult.metrics.cosine >= 0.60 ? 'PASS' : 'FAIL'
          };
          console.log('🔍 Face Matching:', debugInfo);
          setDebugMetrics(debugInfo);
          
          if (matchResult.isMatch) {
            setVerificationStatus('success');
            
            // Auto-verify after successful detection
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
            }
            
            setTimeout(() => {
              if (onVerificationSuccess) {
                onVerificationSuccess(descriptor, matchResult.confidence);
              }
            }, 500);
          } else {
            setVerificationStatus('failed');
            const failureInfo = {
              reason: matchResult.metrics.euclideanDistance > 0.7 ? 'Euclidean distance too high' :
                      matchResult.metrics.cosine < 0.60 ? 'Cosine similarity too low' :
                      'Combined confidence too low',
              suggestions: [
                'Ensure same lighting conditions',
                'Face the camera directly',
                'Remove glasses if not worn during registration',
                'Try different angles'
              ],
              metrics: debugInfo
            };
            console.warn('❌ Face match failed:', failureInfo);
            setDebugMetrics(debugInfo);
          }
        }
      } else {
        setFaceDetected(false);
        setVerificationStatus(null);
        setConfidence(0);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  // Professional descriptor quality assessment
  const calculateDescriptorQuality = (descriptor) => {
    if (!descriptor || descriptor.length !== 128) return 0;
    
    // 1. Check descriptor magnitude (well-formed descriptors have reasonable magnitude)
    const magnitude = Math.sqrt(descriptor.reduce((sum, val) => sum + val * val, 0));
    const magnitudeScore = Math.min(magnitude / 10, 1); // Normalize to 0-1
    
    // 2. Check descriptor variance (better quality has good variation)
    const mean = descriptor.reduce((a, b) => a + b, 0) / descriptor.length;
    const variance = descriptor.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / descriptor.length;
    const varianceScore = Math.min(Math.sqrt(variance) * 3, 1);
    
    // 3. Check for non-zero elements (quality descriptors have many active features)
    const nonZeroCount = descriptor.filter(val => Math.abs(val) > 0.01).length;
    const densityScore = nonZeroCount / descriptor.length;
    
    // 4. Check distribution (should not be too uniform or too spiky)
    const std = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? Math.abs(std / mean) : 0;
    const distributionScore = Math.min(coefficientOfVariation / 2, 1);
    
    // Weighted combination of quality metrics
    const qualityScore = (
      magnitudeScore * 0.25 +
      varianceScore * 0.30 +
      densityScore * 0.25 +
      distributionScore * 0.20
    );
    
    return Math.max(0, Math.min(1, qualityScore));
  };

  // Calculate cosine similarity
  const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  };

  // Advanced face matching with multiple metrics
  const advancedFaceMatching = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || 
        descriptor1.length !== 128 || descriptor2.length !== 128) {
      return { isMatch: false, confidence: 0 };
    }

    // 1. Euclidean Distance (most common for face-api.js)
    const euclideanDistance = Math.sqrt(
      descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
    );
    const euclideanSimilarity = 1 / (1 + euclideanDistance);

    // 2. Cosine Similarity (angle between vectors)
    const cosineSim = cosineSimilarity(descriptor1, descriptor2);

    // 3. Manhattan Distance (L1 norm)
    const manhattanDistance = descriptor1.reduce(
      (sum, val, i) => sum + Math.abs(val - descriptor2[i]), 0
    );
    const manhattanSimilarity = 1 / (1 + manhattanDistance);

    // 4. Pearson Correlation (measures linear relationship)
    const mean1 = descriptor1.reduce((a, b) => a + b, 0) / descriptor1.length;
    const mean2 = descriptor2.reduce((a, b) => a + b, 0) / descriptor2.length;
    
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    
    for (let i = 0; i < descriptor1.length; i++) {
      const diff1 = descriptor1[i] - mean1;
      const diff2 = descriptor2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }
    
    const pearson = (denom1 * denom2 > 0) 
      ? numerator / Math.sqrt(denom1 * denom2) 
      : 0;
    const pearsonSimilarity = (pearson + 1) / 2; // Normalize to 0-1

    // Weighted combination optimized for face-api.js descriptors
    const combinedConfidence = (
      euclideanSimilarity * 0.35 +  // Primary metric
      cosineSim * 0.30 +             // Angular similarity
      manhattanSimilarity * 0.20 +   // Alternative distance
      pearsonSimilarity * 0.15       // Correlation
    );

    // Adaptive threshold - MORE LENIENT for mobile testing
    const adaptiveThreshold = threshold * 0.85; // More lenient (was 0.95)
    const isMatch = (
      combinedConfidence >= adaptiveThreshold &&
      euclideanDistance <= 0.7 &&      // Relaxed from 0.6
      cosineSim >= 0.60                // Relaxed from 0.65
    );

    return {
      isMatch,
      confidence: combinedConfidence,
      metrics: {
        euclidean: euclideanSimilarity,
        cosine: cosineSim,
        manhattan: manhattanSimilarity,
        pearson: pearsonSimilarity,
        euclideanDistance,
        manhattanDistance
      }
    };
  };

  // Handle manual capture for registration
  const handleCapture = () => {
    if (!faceDescriptor || faceDescriptor.length !== 128) {
      setError('No valid face detected. Please position your face in the frame.');
      console.error('❌ Invalid descriptor:', { 
        exists: !!faceDescriptor, 
        length: faceDescriptor?.length 
      });
      return;
    }

    if (confidence < 0.3) { // Lowered from 0.5 for better mobile compatibility
      setError('Face quality too low. Please ensure good lighting and face the camera directly.');
      console.error('❌ Quality too low:', { confidence: (confidence * 100).toFixed(1) + '%' });
      return;
    }

    console.log('✅ Capturing face:', {
      confidence: (confidence * 100).toFixed(1) + '%',
      descriptorLength: faceDescriptor.length
    });

    if (onVerificationSuccess) {
      onVerificationSuccess(faceDescriptor, confidence);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setAttempts(attempts + 1);
    setError(null);
    setVerificationStatus(null);
    setConfidence(0);
    
    if (attempts >= maxAttempts - 1) {
      setError('Maximum attempts reached. Please try again later.');
      if (onVerificationFailure) {
        onVerificationFailure('Maximum attempts exceeded');
      }
    } else {
      // Restart camera if not ready, otherwise just restart detection
      if (!cameraReady) {
        startVideo();
      } else {
        startDetection();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {mode === 'register' ? 'Face Registration' : 'Face Verification'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {mode === 'register' 
            ? 'Position your face in the frame and ensure good lighting' 
            : 'Look at the camera for verification'}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading face detection models...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm sm:text-base whitespace-pre-line">{error}</p>
              {attempts < maxAttempts && (
                <button
                  onClick={handleRetry}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Start Camera Button - Shows for all devices */}
      {!isLoading && !error && modelsLoaded && !cameraReady && (
        <div className="mb-6">
          <button
            onClick={startVideo}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Camera className="w-6 h-6" />
            <span>Allow Camera Access</span>
          </button>
          <p className="text-sm text-gray-600 text-center mt-3">
            {isMobile ? 'Tap' : 'Click'} the button above to activate your camera and start face {mode === 'register' ? 'registration' : 'verification'}
          </p>
        </div>
      )}

      {/* Stop/Restart Camera Button - Shows when camera is active */}
      {cameraReady && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => {
              stopVideo();
              setCameraReady(false);
            }}
            className="flex-1 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Stop Camera
          </button>
          <button
            onClick={() => {
              stopVideo();
              setCameraReady(false);
              setTimeout(() => startVideo(), 100);
            }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Restart Camera
          </button>
        </div>
      )}

      {/* Camera View */}
      {!isLoading && !error && cameraReady && (
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-auto"
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }} // Mirror for front camera
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Status Overlay */}
          {cameraReady && (
            <div className="absolute top-4 left-4 right-4">
              {faceDetected ? (
                <div className="bg-green-500 bg-opacity-90 rounded-lg p-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-medium text-sm">Face Detected</span>
                </div>
              ) : (
                <div className="bg-yellow-500 bg-opacity-90 rounded-lg p-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-medium text-sm">Position your face</span>
                </div>
              )}
            </div>
          )}

          {/* Confidence Meter */}
          {faceDetected && confidence > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Quality</span>
                <span className="text-sm font-bold text-gray-900">{(confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    confidence > 0.7 ? 'bg-green-500' : confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Verification Status */}
          {verificationStatus === 'success' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-full p-6 shadow-2xl">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white rounded-full p-6 shadow-2xl">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isLoading && !error && mode === 'register' && cameraReady && (
        <div className="mt-6 space-y-3">
          <button
            onClick={handleCapture}
            disabled={!faceDetected || confidence < 0.3}
            className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition ${
              faceDetected && confidence >= 0.3
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {faceDetected && confidence >= 0.3 ? 'Capture & Register' : 'Detecting Face...'}
          </button>
          
          {faceDetected && confidence < 0.3 && (
            <p className="text-sm text-yellow-600 text-center">
              Quality: {(confidence * 100).toFixed(0)}% - Please improve lighting and face the camera directly
            </p>
          )}
          
          {faceDetected && confidence >= 0.3 && (
            <p className="text-sm text-green-600 text-center">
              ✓ Face detected with {(confidence * 100).toFixed(0)}% quality - Ready to capture!
            </p>
          )}
        </div>
      )}

      {/* Debug Panel - Shows in verification mode */}
      {mode === 'verify' && debugMetrics && showDebug && (
        <div className="mt-4 bg-gray-900 text-white rounded-lg p-4 text-xs font-mono">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">🔍 Detection Metrics</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Match Status:</span>
              <span className={debugMetrics.isMatch.includes('✅') ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {debugMetrics.isMatch}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence:</span>
              <span className="text-yellow-400">{debugMetrics.confidence}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Euclidean Dist:</span>
              <span className={debugMetrics.euclideanLimit === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                {debugMetrics.euclideanDistance} ({debugMetrics.euclideanLimit})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cosine Sim:</span>
              <span className={debugMetrics.cosineLimit === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                {debugMetrics.cosineSimilarity} ({debugMetrics.cosineLimit})
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
              <p>✓ Euclidean must be ≤ 0.7</p>
              <p>✓ Cosine must be ≥ 0.60</p>
              <p>✓ Combined confidence ≥ 51%</p>
            </div>
          </div>
        </div>
      )}

      {/* Show debug button when hidden */}
      {mode === 'verify' && !showDebug && (
        <button
          onClick={() => setShowDebug(true)}
          className="mt-4 w-full py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
        >
          Show Debug Metrics
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Tips for best results:</h3>
        <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
          <li>• Ensure good lighting on your face</li>
          <li>• Remove glasses, hats, or face coverings</li>
          <li>• Position your face in the center of the frame</li>
          <li>• Keep your face steady and look directly at the camera</li>
          {isMobile && <li>• Hold your phone at eye level</li>}
          {mode === 'verify' && <li className="text-blue-700 font-semibold">• Match same conditions as registration (lighting, glasses, etc.)</li>}
        </ul>
      </div>
    </div>
  );
};

export default MobileFaceVerification;
