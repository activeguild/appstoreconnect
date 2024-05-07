// https://api.appstoreconnect.apple.com/v1/appClipAdvancedExperienceImages
// https://developer.apple.com/go/?id=api-generating-tokens
// https://developer.apple.com/documentation/appstoreconnectapi/uploading_assets_to_app_store_connect
const config = require("dotenv").config();
const fs = require("node:fs");
const { auth } = require("./connect.cjs");

const main = async (args) => {
  const token = await auth(args);
  const imageFile = fs.readFileSync("./artimer_1800x1200.png");

  // アセットの予約をする
  const responseImages = await fetch(
    "https://api.appstoreconnect.apple.com/v1/appClipAdvancedExperienceImages",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            fileName: "artimer_1800x1200.png",
            fileSize: imageFile.byteLength,
          },
          type: "appClipAdvancedExperienceImages",
        },
      }),
    }
  );
  const dataImages = await responseImages.json();

  // Upload the image
  const { method, url, length, offset, requestHeaders } =
    dataImages.data.attributes.uploadOperations[0];
  const base64String = Buffer.from(imageFile);
  const uploadResponse = await fetch(url, {
    method,
    headers: {
      Authorization: requestHeaders[1].value,
      "Content-Type": "image/png",
    },
    body: base64String,
  });
  const uploadData = await uploadResponse.text();

  const responseUploadImages = await fetch(
    `https://api.appstoreconnect.apple.com/v1/appClipAdvancedExperienceImages/${dataImages.data.id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            sourceFileChecksum: "bd37de2a545dd826d9a897ee558320df",
            uploaded: true,
          },
          type: "appClipAdvancedExperienceImages",
          id: dataImages.data.id,
        },
      }),
    }
  );

  const dataUploadImages = await responseUploadImages.json();
};

if (
  config.parsed.ISSUER_ID &&
  config.parsed.KEY_ID &&
  config.parsed.FILE_PATH
) {
  main({
    issuerId: config.parsed.ISSUER_ID,
    keyId: config.parsed.KEY_ID,
    filePath: config.parsed.FILE_PATH,
  });
}
