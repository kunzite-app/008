const { notarize } = require('electron-notarize');
const { NOT_APPLE_ID, NOT_APPLE_ID_PASS, CI } = process.env;

exports.default = async function notarizing(context) {
  if (!CI) return;

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  return await notarize({
    appPath,
    appBundleId: 'app.kunzite.008',
    appleId: NOT_APPLE_ID,
    appleIdPassword: NOT_APPLE_ID_PASS,
    ascProvider: '5WA5SSW77L'
  });
};
