const User = require("../../models/User");

const enrollUser = async (req, res) => {
  const { username, password, email, pin, fullname } = req.body;
  //   console.log("req.body", req.body);
  if (!username || !password || !email || !pin || !fullname) {
    return res.status(400).json({ message: "Invalid user data!" });
  }
  try {
    const userData = { username, password, email, pin, fullname };
    await User.registerUser(userData);
    res.status(200).json({ message: `User ${username} account created!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollUser };
