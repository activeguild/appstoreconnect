// https://developer.apple.com/go/?id=api-generating-tokens
// https://developer.apple.com/documentation/appstoreconnectapi/app_store/app_clips_and_app_clip_experiences/advanced_app_clip_experiences
const config = require("dotenv").config();
const fs = require("node:fs");
const { auth } = require("./connect.cjs");

const ALGORITHM = "ES256";

const main = async (args) => {
  const token = await auth(args);

  // Get Apps
  const responseApps = await fetch(
    "https://api.appstoreconnect.apple.com/v1/apps",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const dataApps = await responseApps.json();
  const app = dataApps.data.find((app) => app.attributes.name === "usdzviewer");
  const responseRelationships = await fetch(
    app.relationships.appClips.links.self,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Register App Clip
  const dataRelationships = await responseRelationships.json();
  const responseExperiences = await fetch(
    "https://api.appstoreconnect.apple.com/v1/appClipAdvancedExperiences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            action: "OPEN",
            defaultLanguage: "JA",
            isPoweredBy: false,
            link: "https://instant-node.vercel.app/order/2",
          },
          relationships: {
            appClip: {
              data: dataRelationships.data[0],
            },
            headerImage: {
              data: {
                id: "7efb8e89-c7ae-42bd-a98f-d9a4ae2ec074",
                type: "appClipAdvancedExperienceImages",
              },
            },
            localizations: {
              data: [
                {
                  id: "JA",
                  type: "appClipAdvancedExperienceLocalizations",
                },
              ],
            },
          },
          type: "appClipAdvancedExperiences",
        },
        included: [
          {
            type: "appClipAdvancedExperienceLocalizations",
            id: "JA",
            attributes: {
              language: "JA",
              title: "ar-timer",
              subtitle: "Display timer in world",
            },
          },
        ],
      }),
    }
  );
  const dataExperiences = await responseExperiences.json();
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
