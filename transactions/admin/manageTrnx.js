const Transaction = require("../../models/Transaction");

const createTrnx = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  const { userId, type, amount, coin, date, memo } = req.body;

  console.log(userId);

  if (!userId || !type || !amount || !coin || !date)
    return res.status(400).json({ message: `Incomplete data!` });
  try {
    const transactionData = { type, amount, coin, date, memo };
    await Transaction.createTransaction(transactionData, userId);
    res.status(201).json({ message: "Transaction created." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  try {
    const transactions = await Transaction.getAllTrnxs();
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTrnx = async (req, res) => {
  const { transactionId } = req.params;
  if (!transactionId)
    return res.status(400).json({ message: "Transaction ID required!" });
  try {
    await Transaction.approve(transactionId);
    res.status(200).json({ message: "Transaction approved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectTrnx = async (req, res) => {
  const { transactionId } = req.params;
  if (!transactionId)
    return res.status(400).json({ message: "Transaction ID required!" });
  try {
    await Transaction.reject(transactionId);
    res.status(200).json({ message: "Transaction failed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTrnx, getTransactions, approveTrnx, rejectTrnx };
