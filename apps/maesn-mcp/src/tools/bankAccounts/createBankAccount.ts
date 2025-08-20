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
      balance: z
        .number()
        .describe('The balance of the bank account')
        .optional(),
      bankName: z.string().describe('The name of the bank').optional(),
      bic: z.string().describe('The bic of the bank account').optional(),
      currency: z
        .string()
        .describe('The currency of the bank account')
        .optional(),
      description: z
        .string()
        .describe('A short description of the bank account')
        .optional(),
      fileType: z.string().describe('The type of file support').optional(),
      iban: z.string().describe('The iban of the bank account').optional(),
      name: z.string().describe('The name of the bank account').optional(),
      number: z.string().describe('The bank account number').optional(),
      system: z.string().describe('The system of the bank account').optional(),
      status: z
        .enum(['ACTIVE', 'ARCHIVED'])
        .describe('The status of the bank account')
        .optional(),
      type: z.string().describe('The type of bank account').optional(),
    })
    .describe('The data of the bank account you want to create ')
    .default({}),
});

export const apiTool = {
  name: 'createBankAccount',
  description: 'Create a bank account',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/bankAccounts`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-bankAccount-KEY': accountKey,
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

      const bankAccount = data.data;
      const mapped = {
        id: bankAccount.id,
        balance: bankAccount.balance,
        class: bankAccount.class,
        code: bankAccount.code,
        createdDate: bankAccount.createdDate,
        currency: bankAccount.currency,
        debitCreditIndicator: bankAccount.debitCreditIndicator,
        description: bankAccount.description,
        name: bankAccount.name,
        number: bankAccount.number,
        parentbankAccountId: bankAccount.parentbankAccountId,
        status: bankAccount.status,
        type: bankAccount.type,
        updatedDate: bankAccount.updatedDate,
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
