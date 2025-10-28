// src/utils/apiConfig.js
const API_CONFIG = {
  // Get the API base URL dynamically based on current location
  getBaseURL: () => {
    const { protocol, hostname, port } = window.location;

    // If on Cloudflare tunnel (HTTPS access)
    if (hostname.includes('trycloudflare.com')) {
      return "https://easter-dinner-overall-cradle.trycloudflare.com";
    }

    // If on localtunnel (mobile HTTPS access)
    if (hostname.includes('loca.lt')) {
      return "https://young-things-clean.loca.lt";
    }

    // If running on localhost:3000, use localhost:5000 for backend
    if (hostname === "localhost" && port === "3000") {
      return "http://localhost:5000";
    }

    // If running on network IP, always use HTTP for backend (not HTTPS)
    if (
      hostname.match(/^10\.0\.0\.\d+$/) ||
      hostname.match(/^192\.168\.\d+\.\d+$/)
    ) {
      return `http://${hostname}:5000`;
    }

    // Fallback to localhost for any other cases
    return "http://localhost:5000";
  },

  // Get full API URL for axios calls
  getAPIURL: (endpoint) => {
    const baseURL = API_CONFIG.getBaseURL();
    return `${baseURL}${endpoint}`;
  },
};

export default API_CONFIG;
