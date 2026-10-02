import { z } from 'zod';
import { checkStoredHeaders, fetchErrorMessage, pageLimitSchema } from '../../commons';

const mapJournalEntry =(journalEntry: any) => ({
  id: journalEntry.id,
  number: journalEntry.number,
  transactionDate: journalEntry.transactionDate,
  debitCreditIndicator: journalEntry.debitCreditIndicator,
  accountId: journalEntry.accountId,
  accountingPeriodId: journalEntry.accountingPeriodId,
  accountingReason: journalEntry.accountingReason,
  additionalInformation: journalEntry.additionalInformation,
  advancePayment: journalEntry.advancePayment,
  currency: journalEntry.currency,
  exchangeRate: journalEntry.exchangeRate,
  description: journalEntry.description,
  documentId: journalEntry.documentId,
  dueDate: journalEntry.dueDate,
  deliveryDate: journalEntry.deliveryDate,
  taxAssignmentDate: journalEntry.taxAssignmentDate,
  files: journalEntry.files,
  isProvisional: journalEntry.isProvisional,
  isReversal: journalEntry.isReversal,
  journalCode: journalEntry.journalCode,
  journalType: journalEntry.journalType,
  journalLineItems: journalEntry.journalLineItems,
  recordType: journalEntry.recordType,
  version: journalEntry.version,
  createdDate: journalEntry.createdDate,
  updatedDate: journalEntry.updatedDate,
});

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
  query: z
    .object({
      pagination: z
        .object({
          page: z.number().optional().describe('Page number'),
          limit: pageLimitSchema.optional(),
        })
        .optional()
        .describe('Pagination options'),
      lastModifiedAt: z
        .string()
        .optional()
        .describe('Filter journal entries modified after this date in ISO format'),
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
      fiscalYear: z.string().optional().describe('Filter journal entries by fiscal year'),
      fiscalYearStartDate: z
        .string()
        .optional()
        .describe('Start date of the fiscal year in ISO format (e.g. 2024-01-01). Required for DATEV Rechnungswesen'),
      transactionDateFrom: z
        .string()
        .optional()
        .describe('Only return journal entries with a transaction date after this date in ISO format'),
    })
    .optional(),
});

export const apiTool = {
  name: 'getJournalEntries',
  description:
    'Get a list of journal entries. For DATEV Rechnungswesen, query.fiscalYearStartDate is required and the request is asynchronous: it returns a taskId, then call getAsyncTask with that taskId (and the same companyId) until the status is finished to get the journal entries.',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/journalEntries`
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
    if (query?.fiscalYear) url.searchParams.append('fiscalYear', query.fiscalYear);
    if (query?.fiscalYearStartDate)
      url.searchParams.append('fiscalYearStartDate', query.fiscalYearStartDate);
    if (query?.transactionDateFrom)
      url.searchParams.append('transactionDateFrom', query.transactionDateFrom);

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

      // Async target systems (e.g. DATEV Rechnungswesen) answer with a taskId instead of the entries
      const taskId = data.data?.taskId ?? data.taskId;
      if (!Array.isArray(data.data) && taskId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  taskId,
                  message:
                    'The journal entries are being retrieved asynchronously. Call getAsyncTask with this taskId (and the same companyId) until the status is SUCCESS or FINISHED; the journal entries are returned in its responseData.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (query?.rawData || !Array.isArray(data.data)) {
        return {
          content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }],
        };
      }

      const mapped = data.data.map(mapJournalEntry);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { pagination: data.meta?.pagination, data: mapped },
              null,
              2
            ),
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
