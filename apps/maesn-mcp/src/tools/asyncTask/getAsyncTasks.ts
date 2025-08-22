import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
  path: z.object({
    asyncTaskId: z.string().describe('The unique id of the asyncTask'),
  }),
  query: z.object({
    companyId: z
      .string()
      .optional()
      .describe("The id of the company you're trying to access"),
  }).optional(),
});

export const apiTool = {
  name: 'getAsyncTask',
  description: 'Get a asyncTask by id',
  input: inputSchema,
  run: async ({ headers, path, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/asyncTask/${path.asyncTaskId}`
    );
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

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
      const asyncTask = data.data;
      const mapped = {
        status: asyncTask.status,
        information: asyncTask.information,
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
