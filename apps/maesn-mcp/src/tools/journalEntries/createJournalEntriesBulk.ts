import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const dimensionSchema = z.object({
  id: z.string().describe("Identifier of the dimension").optional(),
  name: z.string().describe("Name of the specific dimension").optional(),
});

const taxRateSchema = z.object({
  id: z.string().describe("Identifier of the tax rate").optional(),
  code: z.string().describe("Tax code associated with this tax rate").optional(),
  name: z.string().describe("Name or label of the tax rate").optional(),
  taxRatePercentage: z.string().describe("Percentage of the tax rate").optional(),
});

const journalLineItemSchema = z.object({
  accountId: z.string().describe("Identifier of the account linked to the journal line").optional(),
  accountNumber: z.number().describe("Account number linked to the journal line").optional(),
  currency: z.string().describe("Currency code (ISO 4217) for this journal line").optional(),
  customerId: z.string().describe("Identifier of the customer related to this journal line").optional(),
  description: z.string().describe("Description or memo for the journal line").optional(),
  dimensions: z.array(dimensionSchema).default([]).describe("List of dimensions associated with this journal line").optional(),
  documentNumber: z.string().describe("Document number related to this journal line").optional(),
  exchangeRate: z.number().describe("Exchange rate applied if currency differs from base").optional(),
  supplierId: z.string().describe("Identifier of the supplier related to this journal line").optional(),
  taxRate: taxRateSchema.describe("Tax rate details applied to this journal line").optional(),
  thirdPartyCode: z.string().describe("Code referencing a third party for this journal line").optional(),
  totalGrossAmount: z.number().describe("Total gross amount including taxes for this journal line").optional(),
  totalNetAmount: z.number().describe("Total net amount excluding taxes for this journal line").optional(),
  totalTaxAmount: z.number().describe("Total tax amount applied to this journal line").optional(),
});

const entrySchema = z.object({
  accountId: z.string().describe("Identifier of the main account associated with the journal entry").optional(),
  accountingPeriodId: z.string().describe("Identifier of the accounting period for this entry").optional(),
  currency: z.string().describe("Currency code (ISO 4217) of the entry").optional(),
  debitCreditIndicator: z.string().describe("Indicates whether the entry is a DEBIT or CREDIT").optional(),
  description: z.string().describe("Description or memo of the journal entry").optional(),
  documentId: z.string().describe("Identifier of the document linked to this entry").optional(),
  dueDate: z.string().describe("Date when payment or recognition is due, in ISO 8601 format").optional(),
  journalLineItems: z.array(journalLineItemSchema).default([]).describe("List of line items included in the journal entry").optional(),
  journalCode: z.string().describe("Journal code where the entry is recorded").optional(),
  journalType: z.string().describe("Type of journal, e.g., FIN or TAX").optional(),
  number: z.string().describe("Sequential or unique number assigned to the journal entry").optional(),
  transactionDate: z.string().describe("Transaction date of the journal entry in ISO 8601 format").optional(),
});

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
      companyId: z
        .string()
        .optional()
        .describe("The id of the company you're trying to access"),
    })
    .optional(),
  body: z
    .object({
      accountNumberLength: z.string().describe("Length of the account number in the chart of accounts").optional(),
      chartOfAccount: z.string().describe("Chart of accounts used, e.g., SKR03 or SKR04").optional(),
      entries: z.array(entrySchema).default([]).describe("List of journal entries to be booked in bulk").optional(),
      fiscalYearStartDate: z.string().describe("Start date of the fiscal year in ISO 8601 format").optional(),
    })
    .describe('The data of the journal entries you want to create ').default({}),
});

export const apiTool = {
  name: 'createJournalEntries',
  description: 'Create journal entries in bulk',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/journalEntries/bulk`
    );

    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();

      const journalEntry = data.data;
      const mapped = {
        id: journalEntry.id,
        accountNumberLength: journalEntry.accountNumberLength,
        chartOfAccount: journalEntry.chartOfAccount,
        createdDate: journalEntry.createdDate,
        entries: journalEntry.entries,
        fiscalYearStartDate: journalEntry.fiscalYearStartDate,
        taskId: journalEntry.taskId,
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
