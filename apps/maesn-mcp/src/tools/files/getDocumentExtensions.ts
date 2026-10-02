import { z } from 'zod';
import { checkStoredHeaders, fetchErrorMessage } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
  query: z
    .object({
      companyId: z
        .string()
        .optional()
        .describe("The id of the company you're trying to access"),
    })
    .optional(),
});

export const apiTool = {
  name: 'getDocumentExtensions',
  description:
    'Get the file extensions (e.g. pdf, jpg) that the target system accepts for document uploads',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/files/documentExtensions`
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
        throw new Error(await fetchErrorMessage(response));
      }

      const data = await response.json();
      const mapped = {
        allowedFileExtensions: data.data?.allowed_file_extensions ?? [],
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
