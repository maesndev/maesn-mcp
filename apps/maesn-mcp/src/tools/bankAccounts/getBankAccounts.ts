import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY').optional(),
  }).optional(),
  query: z.object({
    lastModifiedAt: z
      .string()
      .optional()
      .describe('Filter accounts modified after this date in ISO format'),
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
      .describe(
        'Set to true if you want to retrieve the raw data from the target system'
      ),
  }).optional(),
});

export const apiTool = {
  name: 'getBankAccounts',
  description: 'Get a list of bank accounts',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/bankAccounts`
    );

    if (query?.lastModifiedAt)
      url.searchParams.append('lastModifiedAt', query.lastModifiedAt);
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);
    if (query?.rawData)
      url.searchParams.append('rawData', query.rawData.toString());

    const {apiKey, accountKey} = checkStoredHeaders(headers);

    try {

      const response = await fetch(url.toString(), {
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();

      const mapped = data.data.map((account: any) => ({
        id: account.id,
        balance: account.balance,
        bankName: account.bankName,
        bic: account.bic,
        createdDate: account.createdDate,
        currency: account.currency,
        description: account.description,
        fileType: account.fileType,
        iban: account.iban,
        name: account.name,
        number: account.number,
        system: account.system,
        status: account.status,
        type: account.type,
        updatedDate: account.updatedDate,
      }));

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
