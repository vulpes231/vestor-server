const Admin = require("../../models/Admin");

const signoutAdmin = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  try {
    await Admin.logoutAdmin(adminId);
    res.clearCookie("jwt");
    res.status(204).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminInfo = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  console.log(adminId);
  try {
    const admin = await Admin.getAdmin(adminId);
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAdminInfo, signoutAdmin };
