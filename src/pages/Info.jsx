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
import { 
  Shield, TrendingUp, Camera, Settings, Activity, TestTube, 
  Info as InfoIcon, Eye, CheckCircle, Lock
} from 'lucide-react';
import API_CONFIG from '../utils/apiConfig';

const Info = () => {
  const navigate = useNavigate();
  const [faceStatus, setFaceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaceStatus();
  }, []);

  const fetchFaceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(API_CONFIG.getAPIURL('/api/face-auth/status'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setFaceStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching face status:', error);
    } finally {
      setLoading(false);
    }
  };

  const utilityLinks = [
    {
      title: 'Face Registration',
      description: 'Register your face for enhanced security verification',
      icon: Camera,
      path: '/face-registration',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      title: 'Face Settings',
      description: 'Manage your face verification settings and preferences',
      icon: Settings,
      path: '/face-settings',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800'
    },
    {
      title: 'Working Face Registration',
      description: 'Alternative face registration interface',
      icon: CheckCircle,
      path: '/face-register-working',
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-700 hover:to-green-800'
    },
    {
      title: 'Face Diagnostic',
      description: 'Diagnose and test face recognition capabilities',
      icon: Activity,
      path: '/face-diagnostic',
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-700 hover:to-orange-800'
    },
    {
      title: 'Face Test 1',
      description: 'Simple face detection test interface',
      icon: TestTube,
      path: '/face-test',
      color: 'from-cyan-600 to-cyan-700',
      hoverColor: 'hover:from-cyan-700 hover:to-cyan-800'
    },
    {
      title: 'Face Test 2',
      description: 'Advanced face detection test interface',
      icon: Eye,
      path: '/face-test2',
      color: 'from-teal-600 to-teal-700',
      hoverColor: 'hover:from-teal-700 hover:to-teal-800'
    }
  ];

  const performanceLinks = [
    {
      title: 'Performance Dashboard',
      description: 'View system metrics, performance analysis, and comparison charts',
      icon: TrendingUp,
      path: '/performance-dashboard',
      color: 'from-indigo-600 to-purple-600',
      hoverColor: 'hover:from-indigo-700 hover:to-purple-700'
    },
    {
      title: 'Security Demonstration',
      description: 'Explore security features and protection mechanisms',
      icon: Shield,
      path: '/security-demonstration',
      color: 'from-red-600 to-pink-600',
      hoverColor: 'hover:from-red-700 hover:to-pink-700'
    }
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-28 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <InfoIcon className="w-10 h-10" />
            System Information & Utilities
          </h1>
          <p className="text-white/90 text-lg">
            Access system tools, face recognition utilities, and performance metrics
          </p>
        </div>

        {/* Face Verification Status */}
        {!loading && faceStatus && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-600" />
              Face Verification Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  faceStatus.faceRegistered 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {faceStatus.faceRegistered ? '✅ Registered' : '❌ Not Registered'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Face Registration</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  faceStatus.faceVerificationEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {faceStatus.faceVerificationEnabled ? '✅ Enabled' : '⚠️ Disabled'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Verification Status</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-600">
                  {faceStatus.verificationCount || 0}
                </p>
                <p className="text-sm text-gray-600">Verifications</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance & Security Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-7 h-7" />
            Performance & Security Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className={`bg-gradient-to-r ${link.color} ${link.hoverColor} text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="w-12 h-12 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-2">{link.title}</h3>
                      <p className="text-white/90 text-sm">{link.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Face Recognition Utilities Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="w-7 h-7" />
            Face Recognition Utilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilityLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className={`bg-gradient-to-r ${link.color} ${link.hoverColor} text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <Icon className="w-10 h-10" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">{link.title}</h3>
                      <p className="text-white/90 text-sm">{link.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Page</h2>
          <div className="text-gray-700 space-y-3">
            <p>
              This page provides access to various system utilities, face recognition tools, 
              and performance monitoring features that are not part of the main voting workflow.
            </p>
            <p className="font-semibold text-purple-700">Available Features:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Face registration and management tools</li>
              <li>Performance metrics and system analysis</li>
              <li>Security demonstration and testing</li>
              <li>Diagnostic tools for troubleshooting</li>
              <li>Alternative interfaces for face verification</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Note: Face recognition features are optional and not required for the voting process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
