/*
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export function checkStoredApiKey(headers: any) {
  if (!process.env.API_KEY && !headers.apiKey) {
    console.error('API key is missing.');
  }
  if (process.env.API_KEY && !headers.apiKey) {
    headers.apiKey = process.env.API_KEY;
  }
  return headers.apiKey;
}

export function checkStoredAccountKey(headers: any) {
  if (!process.env.ACCOUNT_KEY && !headers.accountKey) {
    console.error('API key is missing.');
  }
  if (process.env.ACCOUNT_KEY && !headers.accountKey) {
    headers.accountKey = process.env.ACCOUNT_KEY;
  }
  return headers.accountKey;
}


 */
