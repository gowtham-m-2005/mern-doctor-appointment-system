const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    commissionPercent: { type: Number, default: 10 },
    appName: { type: String, default: "DocBook" },
    appLogo: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
