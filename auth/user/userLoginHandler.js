const User = require("../../models/User");

// Login route handler
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please enter both username and password!" });
  }

  try {
    const loginData = { username, password };
    const { accessToken, refreshToken, isProfileComplete, country } =
      await User.loginUser(loginData);

    // Set refresh token in HTTP-only cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with the access token and user data
    res.status(200).json({
      accessToken,
      username,
      isProfileComplete,
      country,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser };
