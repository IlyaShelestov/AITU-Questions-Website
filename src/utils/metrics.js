const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'aitu-questions-website'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create a counter for tracking request counts by endpoint
const endpointRequestCounter = new promClient.Counter({
  name: 'endpoint_requests_total',
  help: 'Total number of requests per endpoint',
  labelNames: ['endpoint', 'method']
});

// Create a counter for tracking general HTTP requests
const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Create a gauge for tracking unique IP addresses
const uniqueIPs = new promClient.Gauge({
  name: 'unique_ip_addresses',
  help: 'Number of unique IP addresses accessing the website'
});

// Set to track unique IPs
const ipSet = new Set();

// Register the custom metrics
register.registerMetric(endpointRequestCounter);
register.registerMetric(requestCounter);
register.registerMetric(uniqueIPs);

// Create a middleware to count requests and track unique IPs
const metricsMiddleware = (req, res, next) => {
  // Track the request
  res.on('finish', () => {
    // Get the endpoint path - use the route path if available, otherwise use the URL path
    const endpoint = req.route ? req.route.path : req.path;
    
    // Increment the endpoint-specific counter
    endpointRequestCounter.inc({ 
      endpoint: endpoint, 
      method: req.method 
    });
    
    // Increment the general request counter
    requestCounter.inc({ 
      method: req.method, 
      route: endpoint, 
      status_code: res.statusCode 
    });
    
    // Track unique IP
    const ip = req.ip || req.connection.remoteAddress;
    if (ip && !ipSet.has(ip)) {
      ipSet.add(ip);
      uniqueIPs.set(ipSet.size);
    }
  });
  
  next();
};

// Function to reset unique IPs (can be called periodically if needed)
const resetUniqueIPs = () => {
  ipSet.clear();
  uniqueIPs.set(0);
};

module.exports = {
  register,
  metricsMiddleware,
  resetUniqueIPs,
  // Export these for direct use in other parts of the application if needed
  endpointRequestCounter,
  requestCounter,
  uniqueIPs
};