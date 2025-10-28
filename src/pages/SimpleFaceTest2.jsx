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

const SimpleFaceTest2 = () => {
  const [status, setStatus] = useState('Initializing...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('📦 Loading models...');
        console.log('Starting to load models...');
        
        const MODEL_URL = '/models';
        console.log('Model URL:', MODEL_URL);
        
        // Test if models are accessible
        const testResponse = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
        console.log('Test fetch response:', testResponse.status);
        
        if (!testResponse.ok) {
          throw new Error('Models not accessible at /models/');
        }
        
        setStatus('📦 Loading tiny face detector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setStatus('📦 Loading face landmarks...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setStatus('📦 Loading face recognition...');
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        setStatus('✅ All models loaded!');
        setModelsLoaded(true);
        console.log('All models loaded successfully!');
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load models: ' + err.message);
        setStatus('❌ Failed to load models');
      }
    };

    loadModels();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setStatus('📹 Starting camera...');
      console.log('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraStarted(true);
          setStatus('✅ Camera started!');
          console.log('Camera started successfully');
          
          // Start face detection
          startDetection();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera error: ' + err.message);
      setStatus('❌ Camera failed');
    }
  };

  // Face detection loop
  const startDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setInterval(async () => {
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
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        if (detections.length > 0) {
          setStatus(`✅ ${detections.length} face(s) detected!`);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 100);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧪 Simple Face Detection Test</h1>
      
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        backgroundColor: error ? '#fee' : modelsLoaded ? '#efe' : '#fef',
        borderRadius: '5px',
        border: '2px solid ' + (error ? '#faa' : modelsLoaded ? '#afa' : '#ffa')
      }}>
        <strong>Status:</strong> {status}
      </div>
      
      {error && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          backgroundColor: '#fee',
          borderRadius: '5px',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {modelsLoaded && !cameraStarted && (
        <button 
          onClick={startCamera}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          📷 Start Camera
        </button>
      )}
      
      {cameraStarted && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <video 
            ref={videoRef}
            width="640" 
            height="480"
            style={{ 
              border: '2px solid #007bff',
              borderRadius: '5px',
              transform: 'scaleX(-1)' 
            }}
          />
          <canvas 
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'scaleX(-1)'
            }}
          />
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>This is a simplified test component. Check browser console (F12) for detailed logs.</p>
        <p>Models path: /models/</p>
        <p>Models: Tiny Face Detector, Face Landmarks, Face Recognition, Face Expression</p>
      </div>
    </div>
  );
};

export default SimpleFaceTest2;
