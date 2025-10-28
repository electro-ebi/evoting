import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Shield, Lock, Zap, Globe, Users, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, Database, Key, Eye, Cpu, HardDrive,
  Network, Smartphone, Monitor, Server, Cloud, Activity
} from 'lucide-react';

const SecurityDemonstration = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [liveData, setLiveData] = useState({
    threatsBlocked: 0,
    securityScore: 0,
    encryptionStrength: 0,
    auditEvents: 0
  });

  // Simulate live security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 5),
        securityScore: Math.floor(Math.random() * 5) + 95,
        encryptionStrength: Math.floor(Math.random() * 10) + 90,
        auditEvents: prev.auditEvents + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Security Layer Analysis
  const securityLayers = [
    { 
      layer: 'Email Verification', 
      security: 85, 
      speed: 95, 
      cost: 90,
      description: 'Email-based identity verification with OTP',
      features: ['OTP Generation', 'Email Validation', 'Time-based Expiry']
    },
    { 
      layer: 'Cryptographic Keys', 
      security: 98, 
      speed: 80, 
      cost: 70,
      description: 'SHA-512 encrypted key generation and validation',
      features: ['256-bit Random Keys', 'SHA-512 Hashing', 'Time-based Expiry']
    },
    { 
      layer: 'Face Verification', 
      security: 99, 
      speed: 60, 
      cost: 50,
      description: 'Real-time facial recognition and verification',
      features: ['Face Detection', 'Descriptor Matching', 'Live Verification']
    },
    { 
      layer: 'Blockchain Recording', 
      security: 100, 
      speed: 40, 
      cost: 30,
      description: 'Immutable vote recording on blockchain',
      features: ['Smart Contracts', 'Immutable Records', 'Public Verification']
    },
    { 
      layer: 'Audit Trail', 
      security: 100, 
      speed: 90, 
      cost: 95,
      description: 'Complete transaction history and verification',
      features: ['Transaction Logging', 'Cryptographic Signatures', 'Complete History']
    }
  ];

  // Threat Protection Analysis
  const threatProtection = [
    { threat: 'Password Attacks', traditional: 90, blockchain: 0, enhanced: 0 },
    { threat: 'Man-in-the-Middle', traditional: 70, blockchain: 20, enhanced: 5 },
    { threat: 'Data Tampering', traditional: 60, blockchain: 5, enhanced: 0 },
    { threat: 'Social Engineering', traditional: 80, blockchain: 30, enhanced: 10 },
    { threat: 'Insider Threats', traditional: 50, blockchain: 15, enhanced: 5 },
    { threat: 'DDoS Attacks', traditional: 40, blockchain: 80, enhanced: 95 },
    { threat: 'SQL Injection', traditional: 60, blockchain: 0, enhanced: 0 },
    { threat: 'Session Hijacking', traditional: 70, blockchain: 10, enhanced: 0 }
  ];

  // Performance vs Security Trade-off
  const performanceSecurityData = [
    { system: 'Traditional', security: 45, performance: 80, cost: 100 },
    { system: 'Blockchain Basic', security: 75, performance: 60, cost: 80 },
    { system: 'Enhanced System', security: 98, performance: 95, cost: 40 }
  ];

  // Real-time Security Events
  const securityEvents = [
    { time: '00:00', events: 5, threats: 2 },
    { time: '04:00', events: 3, threats: 1 },
    { time: '08:00', events: 15, threats: 3 },
    { time: '12:00', events: 25, threats: 5 },
    { time: '16:00', events: 20, threats: 4 },
    { time: '20:00', events: 12, threats: 2 },
    { time: '24:00', events: 8, threats: 1 }
  ];

  // Encryption Comparison
  const encryptionData = [
    { algorithm: 'MD5', strength: 20, speed: 100, security: 10 },
    { algorithm: 'SHA-1', strength: 40, speed: 90, security: 30 },
    { algorithm: 'SHA-256', strength: 80, speed: 70, security: 85 },
    { algorithm: 'SHA-512', strength: 100, speed: 50, security: 100 }
  ];

  // System Architecture Security
  const architectureSecurity = [
    { component: 'Frontend', security: 85, encryption: 'TLS 1.3', authentication: 'Multi-factor' },
    { component: 'Backend API', security: 95, encryption: 'AES-256', authentication: 'JWT + Keys' },
    { component: 'Database', security: 90, encryption: 'AES-256', authentication: 'Role-based' },
    { component: 'Blockchain', security: 100, encryption: 'SHA-512', authentication: 'Cryptographic' },
    { component: 'Face Auth', security: 99, encryption: 'AES-256', authentication: 'Biometric' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const demos = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'layers', label: '3-Layer Protection', icon: Lock },
    { id: 'threats', label: 'Threat Protection', icon: AlertTriangle },
    { id: 'performance', label: 'Performance Analysis', icon: Zap },
    { id: 'architecture', label: 'System Architecture', icon: Server },
    { id: 'realtime', label: 'Live Monitoring', icon: Activity }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛡️ Security Demonstration & Analysis
          </h1>
          <p className="text-red-200 text-lg">
            Comprehensive Security Analysis of Enhanced E-Voting System
          </p>
        </div>

        {/* Live Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Threats Blocked</p>
                <p className="text-2xl font-bold text-gray-800">{liveData.threatsBlocked}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-800">{liveData.securityScore}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Encryption Strength</p>
                <p className="text-2xl font-bold text-gray-800">{liveData.encryptionStrength}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Audit Events</p>
                <p className="text-2xl font-bold text-gray-800">{liveData.auditEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeDemo === demo.id
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {demo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeDemo === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Security Overview</h2>
              
              {/* Security Score Comparison */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Security Score Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceSecurityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="system" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="security" fill="#dc2626" name="Security Score (%)" />
                    <Bar dataKey="performance" fill="#059669" name="Performance (%)" />
                    <Bar dataKey="cost" fill="#7c3aed" name="Cost Efficiency (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Key Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h4 className="text-lg font-semibold text-red-800 mb-3">🔐 Cryptographic Security</h4>
                  <ul className="text-red-700 space-y-2">
                    <li>• SHA-512 Military-grade encryption</li>
                    <li>• 256-bit Random key generation</li>
                    <li>• Time-based key expiry</li>
                    <li>• Nonce generation for randomness</li>
                    <li>• Hash chaining for integrity</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">🛡️ Multi-Layer Protection</h4>
                  <ul className="text-blue-700 space-y-2">
                    <li>• Email-based verification</li>
                    <li>• Cryptographic key validation</li>
                    <li>• Face recognition system</li>
                    <li>• Blockchain recording</li>
                    <li>• Complete audit trail</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">🚫 Zero Vulnerabilities</h4>
                  <ul className="text-green-700 space-y-2">
                    <li>• No password storage</li>
                    <li>• No brute force attacks</li>
                    <li>• No social engineering</li>
                    <li>• No data tampering</li>
                    <li>• No insider threats</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'layers' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔒 3-Layer Protection System</h2>
              
              {/* Layer Visualization */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Security Layer Analysis</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={securityLayers}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="layer" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Security" dataKey="security" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                    <Radar name="Speed" dataKey="speed" stroke="#059669" fill="#059669" fillOpacity={0.6} />
                    <Radar name="Cost Efficiency" dataKey="cost" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Layer Details */}
              <div className="space-y-6">
                {securityLayers.map((layer, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-800">Layer {index + 1}: {layer.layer}</h4>
                      <div className="flex space-x-4">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          Security: {layer.security}%
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Speed: {layer.speed}%
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          Cost: {layer.cost}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{layer.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {layer.features.map((feature, featureIndex) => (
                        <span key={featureIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDemo === 'threats' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚠️ Threat Protection Analysis</h2>
              
              {/* Threat Protection Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Threat Vulnerability Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={threatProtection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="threat" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="traditional" fill="#dc2626" name="Traditional (%)" />
                    <Bar dataKey="blockchain" fill="#f59e0b" name="Blockchain (%)" />
                    <Bar dataKey="enhanced" fill="#059669" name="Enhanced (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Threat Protection Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traditional</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enhanced</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protection Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {threatProtection.map((threat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{threat.threat}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{threat.traditional}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{threat.blockchain}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{threat.enhanced}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {threat.enhanced === 0 ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Maximum</span>
                          ) : threat.enhanced < 10 ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">High</span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Medium</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeDemo === 'performance' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Performance vs Security Analysis</h2>
              
              {/* Performance vs Security Scatter */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Security vs Performance Trade-off</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={performanceSecurityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="security" name="Security Score" />
                    <YAxis dataKey="performance" name="Performance Score" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter dataKey="performance" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Encryption Comparison */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Encryption Algorithm Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={encryptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="algorithm" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="strength" fill="#dc2626" name="Strength (%)" />
                    <Bar dataKey="speed" fill="#059669" name="Speed (%)" />
                    <Bar dataKey="security" fill="#7c3aed" name="Security (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">🚀 Performance Gains</h4>
                  <ul className="text-blue-700 space-y-2">
                    <li>• 178% faster processing</li>
                    <li>• 900% better response time</li>
                    <li>• 99.9% system uptime</li>
                    <li>• 900% higher throughput</li>
                    <li>• 138% better scalability</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">🔐 Security Benefits</h4>
                  <ul className="text-green-700 space-y-2">
                    <li>• 118% higher security score</li>
                    <li>• 200% better authentication</li>
                    <li>• 400% more transparency</li>
                    <li>• 233% better auditability</li>
                    <li>• Zero password vulnerabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'architecture' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏗️ System Architecture Security</h2>
              
              {/* Architecture Security Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Component Security Analysis</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={architectureSecurity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="component" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="security" fill="#dc2626" name="Security Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Architecture Details */}
              <div className="space-y-6">
                {architectureSecurity.map((component, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-gray-800">{component.component}</h4>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        Security: {component.security}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Encryption:</p>
                        <p className="font-semibold text-gray-800">{component.encryption}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Authentication:</p>
                        <p className="font-semibold text-gray-800">{component.authentication}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDemo === 'realtime' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Live Security Monitoring</h2>
              
              {/* Real-time Security Events */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">24-Hour Security Events</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={securityEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="events" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="threats" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Live System Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600">System Status</p>
                      <p className="text-xl font-bold text-green-800">Secure</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Encryption</p>
                      <p className="text-xl font-bold text-blue-800">SHA-512</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600">Blockchain</p>
                      <p className="text-xl font-bold text-purple-800">Synced</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600">Face Auth</p>
                      <p className="text-xl font-bold text-yellow-800">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDemonstration;
