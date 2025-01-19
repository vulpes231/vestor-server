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
  const {
    firstname,
    lastname,
    street,
    apt,
    city,
    state,
    zip,
    phone,
    dob,
    employment,
    tax,
    mailing,
    marital,
    id,
  } = req.body;
  if (
    !firstname ||
    !lastname ||
    !street ||
    !city ||
    !state ||
    !zip ||
    !phone ||
    !dob ||
    !employment ||
    !tax ||
    !mailing ||
    !marital ||
    !id
  )
    return res.status(400).json({ message: "Incomplete Data" });
  const userId = req.userId;
  try {
    const userData = {
      firstname,
      lastname,
      street,
      apt,
      city,
      state,
      zip,
      phone,
      dob,
      employment,
      tax,
      mailing,
      marital,
      id,
    };
    await User.editUser(userId, userData);
    res.status(200).json({ message: `Profile updated.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutClient = async (req, res) => {
  const userId = req.userId;

  try {
    await User.logoutUser(userId);
    res.clearCookie("jwt");
    res.status(204).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword)
    return res
      .status(400)
      .json({ message: "Enter password and new password!" });

  const userId = req.userId;
  try {
    const passwordData = { password, newPassword };
    await User.changePassword(userId, passwordData);
    res.status(204).json({ message: "Password updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmail = async (req, res) => {
  const userId = req.userId;
  const { email } = req.body;
  if (!email) res.status(400).json({ message: "Email required!" });
  try {
    const user = await User.findById(userId);
    user.email = email;
    await user.save();
    res.status(200).json({ message: "Email updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchUser,
  updateEmail,
  updateUser,
  logoutClient,
  updatePassword,
};
