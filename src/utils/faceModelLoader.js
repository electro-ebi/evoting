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


import * as faceapi from 'face-api.js';

/**
 * Robust face model loader with multiple fallback strategies
 */
export class FaceModelLoader {
  constructor() {
    this.modelsLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * Load all required face detection models
   * @returns {Promise<boolean>} - True if all models loaded successfully
   */
  async loadModels() {
    if (this.modelsLoaded) {
      return true;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadModelsWithFallbacks();
    return this.loadingPromise;
  }

  async _loadModelsWithFallbacks() {
    // Use CDN as primary source (most reliable)
    const cdnUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    // Try CDN first
    try {
      console.log('Attempting to load models from CDN...');
      
      const modelPromises = [
        faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(cdnUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(cdnUrl),
        faceapi.nets.faceExpressionNet.loadFromUri(cdnUrl),
        faceapi.nets.ssdMobilenetv1.loadFromUri(cdnUrl)
      ];

      await Promise.all(modelPromises);
      console.log('✅ All models loaded successfully from CDN');
      this.modelsLoaded = true;
      return true;
    } catch (error) {
      console.warn('❌ Failed to load models from CDN:', error.message);
      console.log('Falling back to local models...');
    }

    // Fallback to local paths
    const modelPaths = [
      '/models',
      './models',
      'models',
      '/src/assets/models',
      './src/assets/models'
    ];

    for (const basePath of modelPaths) {
      try {
        console.log(`Attempting to load models from: ${basePath}`);
        
        const modelPromises = [
          faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
          faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
          faceapi.nets.faceRecognitionNet.loadFromUri(basePath),
          faceapi.nets.faceExpressionNet.loadFromUri(basePath),
          faceapi.nets.ssdMobilenetv1.loadFromUri(basePath)
        ];

        await Promise.all(modelPromises);
        console.log(`✅ All models loaded successfully from: ${basePath}`);
        this.modelsLoaded = true;
        return true;
      } catch (error) {
        console.warn(`❌ Failed to load models from ${basePath}:`, error.message);
        continue;
      }
    }

    // Try loading models one by one with more detailed error reporting
    console.log('Trying individual model loading...');
    try {
      await this._loadModelsIndividually();
      this.modelsLoaded = true;
      return true;
    } catch (error) {
      console.error('Individual model loading failed:', error);
    }

    throw new Error('Failed to load face detection models from any path. Please ensure models are in /public/models/ directory.');
  }

  async _loadModelsIndividually() {
    const models = [
      { name: 'tinyFaceDetector', net: faceapi.nets.tinyFaceDetector },
      { name: 'faceLandmark68Net', net: faceapi.nets.faceLandmark68Net },
      { name: 'faceRecognitionNet', net: faceapi.nets.faceRecognitionNet },
      { name: 'faceExpressionNet', net: faceapi.nets.faceExpressionNet },
      { name: 'ssdMobilenetv1', net: faceapi.nets.ssdMobilenetv1 }
    ];

    const cdnUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    const paths = [cdnUrl, '/models', './models', 'models'];

    for (const model of models) {
      let loaded = false;
      
      for (const path of paths) {
        try {
          console.log(`Loading ${model.name} from ${path}...`);
          await model.net.loadFromUri(path);
          console.log(`✅ ${model.name} loaded successfully from ${path}`);
          loaded = true;
          break;
        } catch (error) {
          console.warn(`❌ ${model.name} failed from ${path}:`, error.message);
        }
      }
      
      if (!loaded) {
        throw new Error(`Failed to load ${model.name} from any path`);
      }
    }
  }

  /**
   * Check if models are loaded
   * @returns {boolean}
   */
  isLoaded() {
    return this.modelsLoaded;
  }

  /**
   * Reset the loader state
   */
  reset() {
    this.modelsLoaded = false;
    this.loadingPromise = null;
  }
}

// Create a singleton instance
export const faceModelLoader = new FaceModelLoader();

/**
 * Convenience function to load models
 * @returns {Promise<boolean>}
 */
export const loadFaceModels = () => faceModelLoader.loadModels();

/**
 * Check if models are available
 * @returns {Promise<boolean>}
 */
export const checkModelsAvailability = async () => {
  try {
    const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
    return response.ok;
  } catch (error) {
    console.warn('Models not accessible:', error);
    return false;
  }
};
