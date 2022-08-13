// https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
require("dotenv").config();
const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  if (!process.env.CSC_NAME) {
    return;
  }
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appBundleId: "com.gg.buzzwords.desktop",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLETEAMID,
  });
};
