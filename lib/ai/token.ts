import { createAiCache } from "./cache";

const IAM_URL = "https://iam.cloud.ibm.com/identity/token";
const TOKEN_TTL_MS = 55 * 60 * 1000;
const tokenCache = createAiCache<string>("watsonx-token");

export async function getIamToken(apiKey: string): Promise<string> {
  return tokenCache.remember(apiKey, TOKEN_TTL_MS, async () => {
    const response = await fetch(IAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`IAM token exchange failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data.access_token as string;
  });
}
