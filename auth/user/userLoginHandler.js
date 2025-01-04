const User = require("../../models/User");

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Enter username and password!" });
  }
  try {
    const loginData = { username, password };
    const { accessToken, refreshToken } = await User.loginUser(loginData);
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser };
