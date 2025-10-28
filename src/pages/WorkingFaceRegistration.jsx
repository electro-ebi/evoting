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
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import API_CONFIG from '../utils/apiConfig';

const WorkingFaceRegistration = () => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const canvasRef = useRef();
  
  const [status, setStatus] = useState('Loading models...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [quality, setQuality] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadModels();
  }, [navigate]);

  const loadModels = async () => {
    try {
      setStatus('📦 Loading face detection models...');
      const MODEL_URL = '/models';
      
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      setStatus('✅ Models loaded! Click button to start camera.');
      setModelsLoaded(true);
    } catch (err) {
      console.error('Model loading error:', err);
      setError('Failed to load models: ' + err.message);
      setStatus('❌ Failed to load models');
    }
  };

  const startCamera = async () => {
    setStartingCamera(true);
    try {
      console.log('🎥 Starting camera...');
      setStatus('📹 Starting camera...');
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      console.log('📹 Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        },
        audio: false
      });

      console.log('✅ Got stream:', stream);
      console.log('📹 Active video tracks:', stream.getVideoTracks().length);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('✅ Set stream to video element');
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded');
            console.log('📹 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            resolve();
          };
        });
        
        // Play the video
        console.log('▶️ Playing video...');
        await videoRef.current.play();
        console.log('✅ Video playing!');
        
        setCameraReady(true);
        setStatus('✅ Camera ready! Position your face.');
        startDetection();
        console.log('✅ Detection started!');
      } else {
        console.error('❌ Video ref is null!');
        throw new Error('Video element not ready');
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      setError('Camera error: ' + err.message);
      setStatus('❌ Camera failed: ' + err.message);
    } finally {
      setStartingCamera(false);
    }
  };

  const startDetection = () => {
    setInterval(async () => {
      if (videoRef.current && canvasRef.current && modelsLoaded) {
        try {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

          const canvas = canvasRef.current;
          const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
          faceapi.matchDimensions(canvas, displaySize);

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detections.length > 0) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            setFaceDetected(true);
            setFaceDescriptor(detections[0].descriptor);
            
            // Calculate quality
            const descriptor = detections[0].descriptor;
            const mean = descriptor.reduce((a, b) => a + b, 0) / descriptor.length;
            const variance = descriptor.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / descriptor.length;
            const q = Math.min(variance * 10, 1);
            setQuality(q);
            
            setStatus(`✅ Face detected! Quality: ${(q * 100).toFixed(0)}%`);
          } else {
            setFaceDetected(false);
            setStatus('👤 Position your face in the camera');
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }
    }, 100);
  };

  const handleRegister = async () => {
    if (!faceDescriptor) {
      toast.error('Please ensure your face is detected');
      return;
    }

    if (quality < 0.5) {
      toast.error('Face quality too low. Please improve lighting.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/register'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ faceDescriptor: Array.from(faceDescriptor) })
      });

      const data = await response.json();

      if (data.success) {
        setRegistered(true);
        toast.success('🎉 Face registered successfully!');
        setStatus('✅ Registration complete!');
      } else {
        toast.error(data.message || 'Registration failed');
        setError(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error during registration');
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Registration Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Your face has been successfully registered for secure voting.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📸 Face Registration
            </h1>
            <p className="text-gray-600">{status}</p>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mt-2">
              Models: {modelsLoaded ? '✅' : '⏳'} | Camera: {cameraReady ? '✅' : '⏳'} | Face: {faceDetected ? '✅' : '❌'}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Start Camera Button */}
          {modelsLoaded && !cameraReady && (
            <div className="text-center mb-6">
              <button
                onClick={startCamera}
                disabled={startingCamera}
                className={`px-8 py-4 rounded-lg font-semibold text-lg shadow-lg ${
                  startingCamera 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {startingCamera ? '⏳ Starting camera...' : '📷 Start Camera'}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                {startingCamera ? 'Please wait, requesting camera permission...' : 'Click to activate camera and begin face detection'}
              </p>
            </div>
          )}

          {/* Camera View - Always render video element when models loaded */}
          {modelsLoaded && (
            <div className="space-y-6" style={{ display: cameraReady ? 'block' : 'none' }}>
              <div className="flex justify-center">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video
                    ref={videoRef}
                    width="640"
                    height="480"
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      transform: 'scaleX(-1)',
                      display: 'block'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: 'scaleX(-1)'
                    }}
                  />
                </div>
              </div>

              {/* Quality Indicator */}
              {faceDetected && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Face Quality:</span>
                    <span className="font-bold text-lg">{(quality * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        quality > 0.7 ? 'bg-green-500' : quality > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${quality * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={!faceDetected || quality < 0.5 || loading}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                  faceDetected && quality >= 0.5 && !loading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Registering...' : faceDetected && quality >= 0.5 ? '✨ Register Face' : '⏳ Detecting...'}
              </button>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">💡 Tips:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Remove glasses or hats</li>
                  <li>• Look directly at the camera</li>
                  <li>• Keep your face steady</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkingFaceRegistration;
