const Settings = require("../models/Settings.model");

const calculateFee = async (doctorFee) => {
  const settings = await Settings.getSettings();
  const commission = (doctorFee * settings.commissionPercent) / 100;
  return {
    doctorFee,
    commission: Math.round(commission * 100) / 100,
    totalFee: Math.round((doctorFee + commission) * 100) / 100,
  };
};

module.exports = { calculateFee };
