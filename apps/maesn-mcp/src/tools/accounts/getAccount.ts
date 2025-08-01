import { z } from 'zod';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY'),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY'),
  }),
  path: z.object({
    accountId: z.string().describe('The unique id of the account'),
  }),
  query: z.object({
    environmentName: z
      .string()
      .optional()
      .describe("The name of the environment you're trying to access"),
    companyId: z
      .string()
      .optional()
      .describe("The id of the company you're trying to access"),
    rawData: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Set to true if you want to retrieve the raw data from the target system'
      ),
  }).optional(),
});

export const apiTool = {
  name: 'getAccount',
  description: 'Get an account by id',
  input: inputSchema,
  run: async ({ headers, path, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/accounts/${path.accountId}`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);
    if (query?.rawData)
      url.searchParams.append('rawData', query.rawData.toString());

    try {

      const response = await fetch(url.toString(), {
        headers: {
          'X-API-KEY': headers.apiKey,
          'X-ACCOUNT-KEY': headers.accountKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      const account = data.data;
      const mapped = {
        id: account.id,
        balance: account.balance,
        class: account.class,
        code: account.code,
        createdDate: account.createdDate,
        currency: account.currency,
        debitCreditIndicator: account.debitCreditIndicator,
        description: account.description,
        name: account.name,
        number: account.number,
        parentAccountId: account.parentAccountId,
        status: account.status,
        type: account.type,
        updatedDate: account.updatedDate,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mapped, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
};
