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
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true, // Allow credentials (cookies) to be sent with the request
};

module.exports = { corsOptions };
