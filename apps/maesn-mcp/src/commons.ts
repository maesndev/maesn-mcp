import { z } from 'zod';

function checkStoredApiKey(headers: any) {
  const fromHeader = headers?.apiKey;
  if (!process.env.API_KEY && !fromHeader) {
    process.stderr.write('API key is missing.');
  }
  return fromHeader ?? process.env.API_KEY ?? '';
}

function checkStoredAccountKey(headers: any) {
  const fromHeader = headers?.accountKey;
  if (!process.env.ACCOUNT_KEY && !fromHeader) {
    process.stderr.write('Account key is missing.');
  }
  return fromHeader ?? process.env.ACCOUNT_KEY ?? '';
}

// Page sizes accepted by the unified API
export const pageLimitSchema = z
  .union([z.literal(5), z.literal(10), z.literal(20), z.literal(50), z.literal(100)])
  .describe('Number of entries per page. Allowed values: 5, 10, 20, 50, 100');

// Includes the API's error body so the model can see why a request was rejected
export async function fetchErrorMessage(response: Response) {
  const body = await response.text().catch(() => '');
  return `Fetch failed with status ${response.status}${body ? `: ${body}` : ''}`;
}

export function checkStoredHeaders(headers: any) {
  const apiKey = checkStoredApiKey(headers);
  const accountKey = checkStoredAccountKey(headers);
  return {apiKey, accountKey};
}
