// https://developer.apple.com/documentation/appstoreconnectapi/generating_tokens_for_api_requests
const jwt = require("jsonwebtoken");
const fs = require("node:fs");
const { importPKCS8 } = require("jose");
const ALGORITHM = "ES256";

const auth = async ({ issuerId, keyId, filePath }) => {
  console.debug(issuerId);
  console.debug(keyId);
  console.debug(filePath);

  const file = fs.readFileSync(filePath, "utf8");
  const secret = await importPKCS8(file, ALGORITHM);

  return jwt.sign(
    {
      iss: issuerId,
      exp: Math.floor(Date.now() / 1000) + 60 * 20,
      aud: "appstoreconnect-v1",
      //   scope: ["GET /v1/apps?filter[platform]=IOS"],
    },
    secret,
    {
      algorithm: ALGORITHM,
      keyid: keyId,
      header: {
        alg: ALGORITHM,
        kid: keyId,
        typ: "JWT",
      },
    }
  );
};

exports.auth = auth;
