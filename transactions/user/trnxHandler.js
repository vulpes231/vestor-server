const Transaction = require("../../models/Transaction");

const makeDeposit = async (req, res) => {
  const userId = req.userId;
  const { amount, coin, memo, method } = req.body;
  if (!amount || !method)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      coin,
      memo,
      method,
    };

    console.log(transactionData);

    await Transaction.depositFund(transactionData, userId);
    res.status(200).json({ message: "Deposit initiated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeWithdrawal = async (req, res) => {
  const userId = req.userId;
  const { amount, coin, memo, method, paymentInfo } = req.body;
  if (!amount || !paymentInfo || !method)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      coin,
      memo,
      // receiver,
      method,
      paymentInfo,
    };
    await Transaction.withdrawFund(transactionData, userId);
    res.status(200).json({ message: "Withdrawal initiated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeTransfer = async (req, res) => {
  const userId = req.userId;
  const { amount, memo, sender, receiver } = req.body;
  if (!amount || !sender || !receiver)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      memo,
      sender,
      receiver,
    };
    await Transaction.transferFund(transactionData, userId);
    res
      .status(200)
      .json({ message: `${amount} USD transferred to ${receiver}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserTrnxs = async (req, res) => {
  const userId = req.userId;
  try {
    const userTrnxs = await Transaction.getUserHistory(userId);
    res.status(200).json({ userTrnxs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { makeDeposit, makeWithdrawal, makeTransfer, getUserTrnxs };
