const generateOTP = () => {
  const length = 6;
  const characters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  let otpCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otpCode += characters[randomIndex];
  }

  return otpCode;
};

function calculatePercentageChange(amount, profitOrLoss) {
  if (amount === 0) return 0;
  return (profitOrLoss / amount) * 100;
}

module.exports = { generateOTP, calculatePercentageChange };
