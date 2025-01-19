const Admin = require("../../models/Admin");

const enrollAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) res.status(400).json({ message: "bad request!" });
  try {
    const adminData = { username, password };
    await Admin.createAdmin(adminData);
    res.status(201).json({ message: "Admin created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const authAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) res.status(400).json({ message: "bad request!" });
  console.log(req.body);
  try {
    const loginData = { username, password };
    const { accessToken, refreshToken } = await Admin.loginAdmin(loginData);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken, refreshToken, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authAdmin, enrollAdmin };
