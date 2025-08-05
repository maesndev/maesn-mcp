import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY').optional(),
  }).optional(),
  query: z.object({
    pagination: z
      .object({
        page: z.number().optional().describe('Page number'),
        limit: z
          .number()
          .optional()
          .describe('Number of entries per page you want returned'),
      })
      .optional()
      .describe('Pagination options'),
    lastModifiedAt: z
      .string()
      .optional()
      .describe('Filter customers modified after this date in ISO format'),
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
    email: z.string().optional().describe('Filter customers by email'),
    name: z.string().optional().describe('Filter customers by name'),
    number: z.string().optional().describe('Filter customers by number'),
  }).optional(),
});

export const apiTool = {
  name: 'getCustomers',
  description: 'Get a list of customers',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/customers`
    );
    if (query?.pagination) {
      if (query.pagination.page)
        url.searchParams.append('page', query.pagination.page.toString());
      if (query?.pagination.limit)
        url.searchParams.append('limit', query.pagination.limit.toString());
    }
    if (query?.lastModifiedAt)
      url.searchParams.append('lastModifiedAt', query.lastModifiedAt);
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);
    if (query?.rawData)
      url.searchParams.append('rawData', query.rawData.toString());
    if (query?.email) url.searchParams.append('email', query.email);
    if (query?.name) url.searchParams.append('name', query.name);
    if (query?.number) url.searchParams.append('number', query.number);

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

      const mapped = data.data.map((customer: any) => ({
        id: customer.id,
        addresses: customer.addresses,
        companyName: customer.companyName,
        contactType: customer.contactType,
        contactPersons: customer.contactPersons,
        documentId: customer.documentId,
        emailAddresses: customer.emailAddresses,
        number: customer.number,
        phoneNumbers: customer.phoneNumbers,
        projectId: customer.projectId,
        updatedDate: customer.updatedDate,
        vatId: customer.vatId,
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
