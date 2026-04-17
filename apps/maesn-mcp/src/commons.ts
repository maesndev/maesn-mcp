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

export function checkStoredHeaders(headers: any) {
  const apiKey = checkStoredApiKey(headers);
  const accountKey = checkStoredAccountKey(headers);
  return {apiKey, accountKey};
}
