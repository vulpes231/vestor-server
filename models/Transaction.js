const { default: mongoose } = require("mongoose");
const User = require("./User");
const Wallet = require("./Wallet");
const { format } = require("date-fns");
const { sendMail } = require("../utils/mailer");

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
    },
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    method: {
      type: String,
    },
    coin: {
      type: String,
    },
    status: {
      type: String,
    },
    date: {
      type: String,
    },
    memo: {
      type: String,
    },
    walletType: {
      type: String,
    },
    sender: {
      type: String,
    },
    receiver: {
      type: String,
    },
    paymentInfo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.statics.createTransaction = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }
    const userWallets = await Wallet.find({ ownerId: user._id });
    if (userWallets.length < 0) {
      throw new Error("You have no active wallets");
    }

    const depositAccount = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === "deposit"
    );
    if (!depositAccount) {
      throw new Error("User has no deposit wallet");
    }

    let paymentInfo;
    if (transactionData.method === "bank") {
      // Validate bank info exists
      if (
        !user.bankDepositInfo ||
        !user.bankDepositInfo.bankName ||
        !user.bankDepositInfo.account
      ) {
        throw new Error("User bank deposit information is incomplete");
      }
      paymentInfo = `${user.bankDepositInfo.bankName} (Account: ${user.bankDepositInfo.account})`;
    } else {
      // Crypto deposit - validate wallet info exists
      if (!user.walletDepositInfo) {
        throw new Error("User wallet deposit information not found");
      }

      const coinAddressMap = {
        btc: user.walletDepositInfo.btc,
        ethArb: user.walletDepositInfo.ethArb,
        ethErc: user.walletDepositInfo.ethErc,
        usdtErc: user.walletDepositInfo.usdtErc,
        usdtTrc: user.walletDepositInfo.usdtTrc,
      };

      // Get the address for the specified coin
      const coinKey = transactionData.coin
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase();
      paymentInfo = coinAddressMap[coinKey];

      if (!paymentInfo) {
        throw new Error(`No deposit address found for ${transactionData.coin}`);
      }
    }

    const newTransaction = {
      owner: user._id,
      email: user.email,
      type: "deposit",
      amount: Number(transactionData.amount),
      coin: transactionData.coin,
      memo: transactionData.memo || "Funds deposit",
      status: "pending",
      date: transactionData.date || format(new Date(), "EEE d MMM, yyyy"),
      method: transactionData.method,
      paymentInfo: paymentInfo,
    };

    await Transaction.create(newTransaction);
    console.log("Balance after", depositAccount.balance);

    return newTransaction;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.depositFund = async function (
  transactionData,
  userId
) {
  try {
    // Validate input
    if (!transactionData || !userId) {
      throw new Error("Transaction data and user ID are required");
    }

    const requiredFields =
      transactionData.method === "bank"
        ? ["method", "amount"]
        : ["method", "amount", "coin"];
    for (const field of requiredFields) {
      if (!transactionData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Find user
    const user = await User.findById(userId).select(
      "+bankDepositInfo +walletDepositInfo"
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Determine payment info based on method
    let paymentInfo;
    if (transactionData.method === "bank") {
      // Validate bank info exists
      if (
        !user.bankDepositInfo ||
        !user.bankDepositInfo.bankName ||
        !user.bankDepositInfo.account
      ) {
        throw new Error("User bank deposit information is incomplete");
      }
      paymentInfo = `${user.bankDepositInfo.bankName} (Account: ${user.bankDepositInfo.account})`;
    } else {
      // Crypto deposit - validate wallet info exists
      if (!user.walletDepositInfo) {
        throw new Error("User wallet deposit information not found");
      }

      const coinAddressMap = {
        btc: user.walletDepositInfo.btc,
        ethArb: user.walletDepositInfo.ethArb,
        ethErc: user.walletDepositInfo.ethErc,
        usdtErc: user.walletDepositInfo.usdtErc,
        usdtTrc: user.walletDepositInfo.usdtTrc,
      };

      // Get the address for the specified coin
      const coinKey = transactionData.coin
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase();
      paymentInfo = coinAddressMap[coinKey];

      if (!paymentInfo) {
        throw new Error(`No deposit address found for ${transactionData.coin}`);
      }
    }

    // Create transaction record
    const depositTrnx = {
      owner: user._id,
      email: user.email,
      type: "deposit",
      amount: Number(transactionData.amount),
      coin: transactionData.coin,
      memo: transactionData.memo || "Funds deposit",
      status: "pending",
      date: format(new Date(), "EEE d MMM, yyyy"),
      method: transactionData.method,
      paymentInfo: paymentInfo,
    };

    // Validate transaction data before saving
    const transaction = new Transaction(depositTrnx);
    await transaction.validate();

    // Save transaction
    const createdTransaction = await Transaction.create(depositTrnx);
    return createdTransaction;
  } catch (error) {
    console.error("Deposit fund error:", error);
    throw new Error(`Transaction creation failed: ${error.message}`);
  }
};

transactionSchema.statics.withdrawFund = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }

    if (!user.canWithdraw) {
      throw new Error("Unable to perform action. Try again later");
    }
    const parsedAmt = parseFloat(transactionData.amount);
    const userWallets = await Wallet.find({ ownerId: user._id });
    if (userWallets.length < 0) {
      throw new Error("You have no active wallets");
    }
    // console.log(userWallets);

    const withdrawAccount = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === "deposit"
    );
    if (!withdrawAccount) {
      throw new Error("Invalid withdraw from wallet");
    }

    if (withdrawAccount.balance < parsedAmt) {
      throw new Error("Insufficient balance!");
    }

    console.log("Balance before", withdrawAccount.balance);

    withdrawAccount.balance -= parsedAmt;
    await withdrawAccount.save();
    const currentDate = format(new Date(), "EEE d MMM, yyyy");

    const message = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Request Confirmation</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 1px solid #eaeaea;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .logo {
                color: #2d3748;
                font-size: 24px;
                font-weight: bold;
                text-decoration: none;
            }
            .content {
                padding: 0 0 20px 0;
            }
            .footer {
                border-top: 1px solid #eaeaea;
                padding-top: 20px;
                font-size: 12px;
                color: #777777;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #2d3748;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 4px;
                margin: 15px 0;
            }
            .highlight {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <a href="#" class="logo">Vestor Markets.</a>
        </div>
        
        <div class="content">
            <h2 style="color: #2d3748; margin-top: 0;">Withdrawal Request Received</h2>
            
            <p>Dear ${user.name || "Valued Customer"},</p>
            
            <p>We have received your withdrawal request with the following details:</p>
            
            <div class="highlight">
                <p><strong>Cryptocurrency:</strong> ${transactionData.coin}</p>
                <p><strong>Amount:</strong> ${parseFloat(
                  transactionData.amount
                )}</p>
                <p><strong>Status:</strong> Processing</p>
            </div>
            
            <p>Your transaction is currently being processed by our team. You will receive another email notification once your withdrawal has been approved and processed.</p>
            
            <p>If you did not initiate this request, please contact our support team immediately.</p>
            
            <a href="#" class="button">View Transaction Details</a>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Vestor Markets. All rights reserved.</p>
            <p>
                <a href="#" style="color: #2d3748; text-decoration: none;">Privacy Policy</a> | 
                <a href="#" style="color: #2d3748; text-decoration: none;">Terms of Service</a>
            </p>
        </div>
    </body>
    </html>
    `;

    const subject = "Vestor Market - Withdrawal Requested";

    await sendMail(user.email, subject, message);

    const newWithdrawal = {
      owner: user._id,
      type: "withdraw",
      email: user.email,
      amount: transactionData.amount,
      coin: transactionData.coin,
      memo: transactionData.memo || "Withdrawal",
      // receiver: transactionData.receiver,
      sender: withdrawAccount.walletName.toLowerCase(),
      status: "pending",
      date: currentDate,
      method: transactionData.method,
      paymentInfo: transactionData.paymentInfo || null,
    };
    await Transaction.create(newWithdrawal);
    console.log("Balance after", withdrawAccount.balance);

    return newWithdrawal;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.transferFund = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }
    const parsedAmt = parseFloat(transactionData.amount);
    const userWallets = await Wallet.find({ ownerId: user._id });
    if (userWallets.length < 0) {
      throw new Error("You have no active wallets");
    }
    // console.log(userWallets);

    const withdrawAccount = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === transactionData.sender
    );
    if (!withdrawAccount) {
      throw new Error("Invalid from wallet");
    }
    if (withdrawAccount.balance < parsedAmt) {
      throw new Error("Insufficient balance!");
    }

    const receiver = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === transactionData.receiver
    );
    if (!receiver) {
      throw new Error("Invalid to wallet");
    }

    withdrawAccount.balance -= parsedAmt;
    await withdrawAccount.save();

    receiver.balance += parsedAmt;
    await receiver.save();

    const newTransfer = {
      owner: user._id,
      type: "transfer",
      email: user.email,
      amount: transactionData.amount,
      coin: transactionData.coin || "Wallet",
      memo: transactionData.memo || "Transfer",
      sender: withdrawAccount.walletName.toLowerCase(),
      receiver: receiver.walletName.toLowerCase(),
      status: "completed",
      method: "wallet",
    };
    await Transaction.create(newTransfer);
    console.log("Balance after", withdrawAccount.balance);

    return newTransfer;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.getUserHistory = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }
    const userTrnxs = await Transaction.find({ owner: user._id });
    if (userTrnxs.length < 0) {
      throw new Error("You have no transactions.");
    }
    return userTrnxs;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.getAllTrnxs = async function () {
  try {
    const transactions = await Transaction.find();
    if (transactions.length < 0) {
      throw new Error("You have no transactions.");
    }
    return transactions;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.approve = async function (transactionId) {
  try {
    const transactionInfo = await Transaction.findById(transactionId);
    if (!transactionInfo) {
      throw new Error("Transaction not found!");
    }

    const user = await User.findOne({ _id: transactionInfo.owner });
    if (!user) {
      throw new Error("User not found!");
    }

    if (transactionInfo.type === "deposit") {
      const userWallets = await Wallet.find({ ownerId: transactionInfo.owner });

      const depositWallet = userWallets.find(
        (wallet) => wallet.walletName === "Deposit"
      );

      depositWallet.balance += transactionInfo.amount;
      await depositWallet.save();

      const subject = "Deposit Confirmation";
      const message = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deposit Confirmation | Vestor </title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 1px solid #eaeaea;
                padding-bottom: 20px;
                margin-bottom: 20px;
                text-align: center;
            }
            .logo {
                color: #2d3748;
                font-size: 24px;
                font-weight: bold;
                text-decoration: none;
            }
            .content {
                padding: 0 0 20px 0;
            }
            .footer {
                border-top: 1px solid #eaeaea;
                padding-top: 20px;
                font-size: 12px;
                color: #777777;
                text-align: center;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #4f46e5;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: bold;
            }
            .highlight-box {
                background-color: #f8fafc;
                border-left: 4px solid #4f46e5;
                padding: 16px;
                margin: 20px 0;
                border-radius: 0 4px 4px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <a href="#" class="logo">Vestor</a>
        </div>
        
        <div class="content">
            <h2 style="color: #2d3748; margin-top: 0;">Hi ${user.username},</h2>
            
            <p>We're pleased to inform you that your deposit has been successfully processed.</p>
            
            <div class="highlight-box">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">Amount Deposited: ${transactionInfo.amount} USD</p>
            </div>
            
            <p>The funds are now available in your Vestor account. You can view your updated balance and transaction details by logging into your account.</p>
            
            <center>
                <a href="#" class="button">Login to Your Account</a>
            </center>
            
            <p>If you have any questions about this transaction or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Vestor Team</p>
        </div>
        
        <div class="footer">
            <p>© 2025 Vestor Markets. All rights reserved.</p>
            <p>
                <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
                <a href="#" style="color: #4f46e5; text-decoration: none;">Terms of Service</a> |
                <a href="#" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
            </p>
            <p>Vestor Financial Services, 123 Investment Street, New York, NY</p>
        </div>
    </body>
    </html>
    `;
      const email = user.email;

      await sendMail(email, subject, message);
    }

    transactionInfo.status = "completed";
    await transactionInfo.save();
    return transactionInfo;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.reject = async function (transactionId) {
  try {
    const transactionInfo = await Transaction.findById(transactionId);
    if (!transactionInfo) {
      throw new Error("Transaction not found!");
    }

    const user = await User.findOne({ _id: transactionInfo.owner });
    if (!user) {
      throw new Error("User not found!");
    }

    const subject = "Deposit Confirmation";
    const message = ` 
      <h2> Hi ${user.username} </h2>
      <p> Your deposit of ${transactionInfo.amount} USD has failed. Login to your account for further information. </p>

      <small>Vestor &copy; 2025.</small>
    `;
    const email = user.email;

    await sendMail(email, subject, message);

    transactionInfo.status = "failed";
    await transactionInfo.save();
    return transactionInfo;
  } catch (error) {
    throw error;
  }
};

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
