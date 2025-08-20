import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const taxRateSchema = z.object({
  id: z.string().optional().describe('Tax rate id'),
  code: z.string().optional().describe('Tax rate code'),
  name: z.string().optional().describe('Tax rate name'),
  taxRatePercentage: z.string().optional().describe('Tax rate percentage'),
});

const dimensionSchema = z.object({
  id: z.string().optional().describe('Dimension id'),
  name: z.string().optional().describe('Dimension name'),
});

const expenseLineSchema = z.object({
  id: z.string().optional().describe('Expense line id'),
  accountCode: z.string().optional().describe('Account code'),
  accountId: z.string().optional().describe('Account id'),
  accountNumber: z.number().optional().describe('Account number'),
  currency: z.string().length(3).optional().describe('Currency code'),
  description: z.string().optional().describe('Expense line description'),
  dimensions: z.array(dimensionSchema).optional().describe('Expense line dimensions'),
  documentNumber: z.string().optional().describe('Document number'),
  exchangeRate: z.string().optional().describe('Exchange rate'),
  itemId: z.string().optional().describe('Item id'),
  taxRate: taxRateSchema.optional().describe('Tax rate details'),
  totalGrossAmount: z.number().optional().describe('Total gross amount'),
  totalNetAmount: z.number().optional().describe('Total net amount'),
});

const inputSchema = z.object({
  headers: z
    .object({
      apiKey: z
        .string()
        .optional()
        .describe(
          'Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.'
        ),
      accountKey: z
        .string()
        .optional()
        .describe(
          'Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.'
        ),
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
      accountCode: z.string().optional().describe('General ledger account code'),
      accountId: z.string().optional().describe('General ledger account id'),
      accountNumber: z.number().optional().describe('General ledger account number'),
      currency: z.string().length(3).optional().describe('Currency code'),
      expenseId: z.string().optional().describe('Unique identifier of the related expense (UUID)'),
      description: z.string().optional().describe('Text description of the expense'),
      documentId: z.string().optional().describe('Document id'),
      exchangeRate: z.string().optional().describe('Exchange rate'),
      expenseLines: z.array(expenseLineSchema).optional().describe('Expense lines'),
      journalCode: z.string().optional().describe('Journal code'),
      ledgerName: z.string().optional().describe('Ledger name'),
      note: z.string().optional().describe('Expense note'),
      paymentTermId: z.string().optional().describe('Payment term id'),
      paymentType: z.string().optional().describe('Payment type'),
      supplierId: z.string().optional().describe('Supplier id'),
      type: z.string().optional().describe('Expense type'),
      totalGrossAmount: z.number().optional().describe('Total gross amount'),
      totalNetAmount: z.number().optional().describe('Total net amount'),
      totalTaxAmount: z.number().optional().describe('Total tax amount'),
      transactionDate: z.string().optional().describe('Transaction date'),
    })
    .describe('The data of the expense you want to create ')
    .default({}),
});

export const apiTool = {
  name: 'createExpense',
  description: 'Create an expense',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/expenses`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    const formData = new FormData();
    formData.append('expense', JSON.stringify(body));

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();

      const expense = data.data;
      const mapped = {
        id: expense.id,
        accountCode: expense.accountCode,
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
        taskId: expense.taskId,
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
