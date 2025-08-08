import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY').optional(),
  }).optional(),
  query: z
    .object({
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
        .describe('Filter expenses modified after this date in ISO format'),
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
    })
    .optional(),
});

export const apiTool = {
  name: 'getExpenses',
  description: 'Get a list of expenses',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/expenses`
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

      const mapped = data.data.map((expense: any) => ({
        id: expense.id,
        accountCode : expense.accountCode,
        accountId: expense.accountId,
        accountNumber: expense.accountNumber,
        createdDate: expense.createdDate,
        currency: expense.currency,
        customerId: expense.customerId,
        description: expense.description,
        documentId: expense.documentId,
        exchangeRate: expense.exchangeRate,
        expenseLines: expense.expenseLines,
        files: expense.files,
        journalCode: expense.journalCode,
        ledgerName: expense.ledgerName,
        note: expense.note,
        paymentTermId: expense.paymentTermId,
        paymentType: expense.paymentType,
        supplierId: expense.supplierId,
        taskId : expense.taskId,
        type: expense.type,
        totalGrossAmount: expense.totalGrossAmount,
        totalNetAmount: expense.totalNetAmount,
        totalTaxAmount: expense.totalTaxAmount,
        transactionDate: expense.transactionDate,
        updatedDate: expense.updatedDate,
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
