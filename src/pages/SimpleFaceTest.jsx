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
import * as faceapi from 'face-api.js';

const SimpleFaceTest = () => {
  const [status, setStatus] = useState('Starting...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const cdnUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        setStatus('Loading TinyFaceDetector from CDN...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl);
        setStatus('✅ TinyFaceDetector loaded');

        setStatus('Loading FaceLandmark68Net from CDN...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(cdnUrl);
        setStatus('✅ FaceLandmark68Net loaded');

        setStatus('Loading FaceRecognitionNet from CDN...');
        await faceapi.nets.faceRecognitionNet.loadFromUri(cdnUrl);
        setStatus('✅ FaceRecognitionNet loaded');

        setStatus('Loading FaceExpressionNet from CDN...');
        await faceapi.nets.faceExpressionNet.loadFromUri(cdnUrl);
        setStatus('✅ FaceExpressionNet loaded');

        setStatus('Loading SSDMobileNetV1 from CDN...');
        await faceapi.nets.ssdMobilenetv1.loadFromUri(cdnUrl);
        setStatus('✅ SSDMobileNetV1 loaded');

        setStatus('🎉 All models loaded successfully from CDN!');
        setModelsLoaded(true);
      } catch (err) {
        setError(err.message);
        setStatus(`❌ Error: ${err.message}`);
        console.error('Model loading error:', err);
      }
    };

    loadModels();
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🔍 Simple Face Model Test
        </h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Status:</h2>
          <p className="text-gray-600">{status}</p>
        </div>

        {error && (
          <div className="bg-red-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-red-700 mb-4">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {modelsLoaded && (
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Success!</h2>
            <p className="text-green-600">All face detection models are loaded and ready to use.</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mr-4"
          >
            🔄 Retry
          </button>
          <button
            onClick={() => window.location.href = '/face-registration'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            🚀 Try Face Registration
          </button>
        </div>

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-700 mb-4">Debug Info:</h3>
          <ul className="text-yellow-600 space-y-2">
            <li>• Models are now loaded from CDN (GitHub)</li>
            <li>• This ensures reliable model loading</li>
            <li>• Check browser console (F12) for detailed messages</li>
            <li>• CDN URL: <code>https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleFaceTest;
