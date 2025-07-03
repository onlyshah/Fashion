export const environment = {
  production: false,
  // For Android Emulator: 10.0.2.2 maps to host machine
  // For physical device: use your computer's IP address
  apiUrl: 'http://10.0.2.2:5000/api',
  socketUrl: 'http://10.0.2.2:5000',
  // Alternative IPs for different scenarios
  fallbackApiUrls: [
    'http://10.0.2.2:5000/api',        // Android emulator (primary)
    'http://192.168.150.111:5000/api', // Current computer IP
    'http://192.168.1.100:5000/api',   // Common home network IP
    'http://192.168.0.100:5000/api',   // Alternative home network IP
    'http://192.168.1.1:5000/api',     // Router IP variant
    'http://localhost:5000/api'        // Fallback for browser testing
  ]
};
