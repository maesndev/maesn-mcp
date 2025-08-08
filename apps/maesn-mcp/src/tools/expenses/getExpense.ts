import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY').optional(),
  }).optional(),
  path: z.object({
    expenseId: z.string().describe('The unique id of the expense'),
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
  name: 'getExpense',
  description: 'Get a expense by id',
  input: inputSchema,
  run: async ({ headers, path, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/expenses/${path.expenseId}`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);
    if (query?.rawData)
      url.searchParams.append('rawData', query.rawData.toString());

    try {

      const {apiKey, accountKey} = checkStoredHeaders(headers);

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
      const expense = data.data;
      const mapped = {
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
