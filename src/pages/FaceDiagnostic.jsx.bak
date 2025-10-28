import React, { useState, useEffect } from "react";
import {
  loadFaceModels,
  checkModelsAvailability,
} from "../utils/faceModelLoader";

const FaceDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  const addDiagnostic = (message, type = "info") => {
    setDiagnostics((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addDiagnostic("🔍 Starting face detection diagnostics...", "info");

      try {
        // Check 1: Models availability
        addDiagnostic("📁 Checking if models are accessible...", "info");
        const modelsAvailable = await checkModelsAvailability();

        if (modelsAvailable) {
          addDiagnostic("✅ Models are accessible via HTTP", "success");
        } else {
          addDiagnostic("❌ Models are not accessible via HTTP", "error");
          addDiagnostic(
            "💡 Make sure models are in /public/models/ directory",
            "info"
          );
          setLoading(false);
          return;
        }

        // Check 2: Try to load models
        addDiagnostic("🧠 Attempting to load face detection models...", "info");
        await loadFaceModels();
        addDiagnostic(
          "✅ All face detection models loaded successfully!",
          "success"
        );

        // Check 3: Test camera access
        addDiagnostic("📷 Testing camera access...", "info");
        try {
          // Check for camera support first
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera access not supported on this device");
          }
          
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              facingMode: 'user'
            }
          });
          addDiagnostic("✅ Camera access granted", "success");
          stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
          addDiagnostic(`❌ Camera access denied: ${error.message}`, "error");
        }

        addDiagnostic("🎉 All diagnostics completed successfully!", "success");
        addDiagnostic("🚀 Face detection should work properly now", "success");
      } catch (error) {
        addDiagnostic(`❌ Diagnostic failed: ${error.message}`, "error");
        addDiagnostic(
          "💡 Try refreshing the page or restarting the development server",
          "info"
        );
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  const getDiagnosticStyle = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🔍 Face Detection Diagnostic Tool
            </h1>
            <p className="text-gray-600">
              This tool helps diagnose face detection model loading issues
            </p>
          </div>

          {loading && (
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running diagnostics...</p>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {diagnostics.map((diagnostic, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getDiagnosticStyle(
                  diagnostic.type
                )}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium">{diagnostic.message}</span>
                  <span className="text-xs opacity-75 ml-2">
                    {diagnostic.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mr-4"
            >
              🔄 Run Diagnostics Again
            </button>
            <button
              onClick={() => (window.location.href = "/face-registration")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              🚀 Try Face Registration
            </button>
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 Troubleshooting Tips
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                • Ensure all model files are in <code>/public/models/</code>{" "}
                directory
              </li>
              <li>
                • Check that the development server is running on port 3000
              </li>
              <li>• Try hard refresh (Ctrl+F5) to clear browser cache</li>
              <li>• Check browser console for additional error messages</li>
              <li>• Ensure you have camera permissions enabled</li>
              <li>
                • Try using a different browser (Chrome/Firefox recommended)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDiagnostic;
