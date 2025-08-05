function checkStoredApiKey(headers: any) {
  let apiKey = headers.apiKey ?? "";
  if (!process.env.API_KEY && !headers.apiKey) {
    process.stderr.write('API key is missing.');
  }
  if (process.env.API_KEY && !headers.apiKey) {
    apiKey = process.env.API_KEY;
  }
  return apiKey;
}

function checkStoredAccountKey(headers: any) {
  let accountKey = headers.accountKey ?? "";
  if (!process.env.ACCOUNT_KEY && !headers.accountKey) {
    process.stderr.write('Account key is missing.');
  }
  if (process.env.ACCOUNT_KEY && !headers.accountKey) {
    accountKey = process.env.ACCOUNT_KEY;
  }
  return accountKey;
}

export function checkStoredHeaders(headers: any) {
  const apiKey = checkStoredApiKey(headers);
  const accountKey = checkStoredAccountKey(headers);
  return {apiKey, accountKey};
}
