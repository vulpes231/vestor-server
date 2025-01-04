const User = require("../../models/User");

const fetchUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.getUser(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { fullname, email } = req.body;
  const userId = req.userId;
  try {
    const userData = { fullname, email };
    const user = await User.editUser(userId, userData);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { fetchUser, updateUser };
