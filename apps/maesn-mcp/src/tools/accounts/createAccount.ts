import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z
    .object({
      apiKey: z
        .string()
        .describe(
          'Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.'
        )
        .optional(),
      accountKey: z
        .string()
        .describe(
          'Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.'
        )
        .optional(),
    })
    .optional(),
  query: z
    .object({
      environmentName: z
        .string()
        .optional()
        .describe("The name of the environment you're trying to access"),
      companyId: z
        .string()
        .optional()
        .describe("The id of the company you're trying to access"),
    })
    .optional(),
  body: z
    .object({
      balance: z.number().describe('The balance of the account').optional(),
      class: z
        .enum(['ASSET', 'EQUITY', 'EXPENSE', 'LIABILITY', 'REVENUE'])
        .describe('The account class')
        .optional(),
      code: z.string().describe('The code of the account').optional(),
      currency: z.string().describe('The currency of the account').optional(),
      description: z
        .string()
        .describe('A short description of the account')
        .optional(),
      name: z.string().describe('The name of the account').optional(),
      number: z.string().describe('The account number').optional(),
      parentAccountId: z
        .string()
        .describe('The id of the parent account')
        .optional(),
      status: z
        .enum(['ACTIVE', 'ARCHIVED'])
        .describe('The status of the account')
        .optional(),
      type: z.string().describe('The type of account').optional(),
    })
    .describe('The data of the account you want to create ')
    .default({}),
});

export const apiTool = {
  name: 'createAccount',
  description: 'Create a general ledger account',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/accounts`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    console.error(body);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
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
