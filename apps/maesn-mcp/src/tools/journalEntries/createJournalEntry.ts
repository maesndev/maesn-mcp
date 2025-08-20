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
  currency: z.string().describe("Currency code (ISO 4217) used for the journal line").optional(),
  customerId: z.string().describe("Identifier of the customer related to this journal line").optional(),
  debitCreditIndicator: z.enum(['CREDIT', 'DEBIT']).describe("Indicates it the account is a credit or a debit account").optional(),
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
      accountId: z.string().describe("Identifier of the main account associated with the journal entry").optional(),
      accountingPeriodId: z.string().describe("Identifier of the accounting period for this journal entry").optional(),
      currency: z.string().describe("Currency code (ISO 4217) of the journal entry").optional(),
      description: z.string().describe("Description or memo of the journal entry").optional(),
      documentId: z.string().describe("Identifier of the document linked to this journal entry").optional(),
      journalLineItems: z.array(journalLineItemSchema).default([]).describe("List of line items included in the journal entry").optional(),
      journalCode: z.string().describe("Journal code where the entry is recorded").optional(),
      journalType: z.string().describe("Type of journal, e.g., FIN or TAX").optional(),
      number: z.string().describe("Sequential or unique number assigned to the journal entry").optional(),
      transactionDate: z.string().describe("Transaction date of the journal entry in ISO 8601 format").optional(),
    })
    .describe('The data of the journal entry you want to create ').default({}),
});

export const apiTool = {
  name: 'createJournalEntry',
  description: 'Create a journal entry',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/journalEntries`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    const formData = new FormData();
    formData.append('journal_entry', JSON.stringify(body));

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

      const journalEntry = data.data;
      const mapped = {
        id: journalEntry.id,
        addresses: journalEntry.addresses,
        companyName: journalEntry.companyName,
        contactType: journalEntry.contactType,
        contactPersons: journalEntry.contactPersons,
        documentId: journalEntry.documentId,
        emailAddresses: journalEntry.emailAddresses,
        number: journalEntry.number,
        phoneNumbers: journalEntry.phoneNumbers,
        projectId: journalEntry.projectId,
        updatedDate: journalEntry.updatedDate,
        vatId: journalEntry.vatId,
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
