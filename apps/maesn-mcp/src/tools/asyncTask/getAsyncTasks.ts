import { z } from 'zod';
import { checkStoredHeaders, fetchErrorMessage, MAESN_API_BASE_URL } from '../../commons';

const DEFAULT_MAX_ITEMS = 100;

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
    page: z
      .number()
      .optional()
      .describe('Page of the task result. Only used by DATEV Rechnungswesen, which returns up to 50,000 entries per page'),
  }).optional(),
  result: z.object({
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Index of the first result item to return from the fetched page (default 0)'),
    maxItems: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe(`Maximum number of result items to return (default ${DEFAULT_MAX_ITEMS}, max 1000). Use with offset to read large results in chunks`),
  }).optional(),
});

// Large async results (e.g. DATEV journal entries) are sliced so they fit into the model's context
function sliceResponseData(responseData: any, offset: number, maxItems: number) {
  const slice = (items: any[]) => ({
    totalItems: items.length,
    offset,
    returnedItems: Math.max(0, Math.min(maxItems, items.length - offset)),
    hasMore: offset + maxItems < items.length,
    items: items.slice(offset, offset + maxItems),
  });

  if (Array.isArray(responseData)) return slice(responseData);
  if (responseData && typeof responseData === 'object') {
    return Object.fromEntries(
      Object.entries(responseData).map(([key, value]) => [
        key,
        Array.isArray(value) ? slice(value) : value,
      ])
    );
  }
  return responseData;
}

export const apiTool = {
  name: 'getAsyncTask',
  description:
    'Get the status and result of an async task by id (e.g. the taskId returned by getJournalEntries for DATEV Rechnungswesen). While the status is IN_PROGRESS or OPEN, call it again later. Once finished, the result is in responseData; large result lists are returned in chunks, so use result.offset to read further items and query.page for the next DATEV page.',
  input: inputSchema,
  run: async ({ headers, path, query, result }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `${MAESN_API_BASE_URL}/accounting/asyncTask/${encodeURIComponent(path.asyncTaskId)}`
    );
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);
    if (query?.page) url.searchParams.append('page', query.page.toString());

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
      const asyncTask = data.data;
      const mapped = {
        status: asyncTask.status,
        information: asyncTask.information,
        pagination: data.meta?.pagination,
        responseData: sliceResponseData(
          asyncTask.responseData,
          result?.offset ?? 0,
          result?.maxItems ?? DEFAULT_MAX_ITEMS
        ),
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
