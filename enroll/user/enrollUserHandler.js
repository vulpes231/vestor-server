const User = require("../../models/User");

const enrollUser = async (req, res) => {
  const { username, password, email, country } = req.body;
  //   console.log("req.body", req.body);
  if (!username || !password || !email || !country) {
    return res.status(400).json({ message: "Invalid user data!" });
  }
  try {
    const userData = { username, password, email, country };
    const { accessToken, refreshToken } = await User.registerUser(userData);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ message: `User ${username} account created!`, accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollUser };
