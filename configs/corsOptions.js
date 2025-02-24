const { allowedOrigins } = require("./allowedOrigin");

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Check for allowed origins (either specific origins or no origin for local testing)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  withCredentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ["Access-Control-Allow-Origin"],
};

module.exports = { corsOptions };
