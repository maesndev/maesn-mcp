import { z } from 'zod';
import { checkStoredHeaders, fetchErrorMessage, pageLimitSchema, MAESN_API_BASE_URL } from '../../commons';

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
      fiscalYearStartDate: z
        .string()
        .optional()
        .describe(
          'Start date of the fiscal year in ISO format (e.g. 2024-01-01). Returns the trial balance of the fiscal year starting on this date. Required for DATEV Rechnungswesen and Sage Active'
        ),
      accountNumber: z
        .string()
        .optional()
        .describe('Filter the trial balance by account number (e.g. 270000). Supported by DATEV Rechnungswesen'),
      accountCode: z
        .string()
        .optional()
        .describe('Filter the trial balance by account code. Supported by Sage Active'),
      lastModifiedAt: z
        .string()
        .optional()
        .describe('Filter entries modified after this date in ISO format'),
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
  name: 'getTrialBalance',
  description:
    'Get the trial balance (balance per account, with opening balance, debit/credit totals and, for DATEV Rechnungswesen, monthly values). For DATEV Rechnungswesen, query.fiscalYearStartDate is required.',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `${MAESN_API_BASE_URL}/accounting/trialBalance`
    );
    if (query?.pagination) {
      if (query.pagination.page)
        url.searchParams.append('page', query.pagination.page.toString());
      if (query?.pagination.limit)
        url.searchParams.append('limit', query.pagination.limit.toString());
    }
    if (query?.fiscalYearStartDate)
      url.searchParams.append('fiscalYearStartDate', query.fiscalYearStartDate);
    if (query?.accountNumber)
      url.searchParams.append('accountNumber', query.accountNumber);
    if (query?.accountCode)
      url.searchParams.append('accountCode', query.accountCode);
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
        throw new Error(await fetchErrorMessage(response));
      }

      const data = await response.json();

      if (query?.rawData) {
        return {
          content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }],
        };
      }

      const mapped = data.data.map((entry: any) => ({
        accountNumber: entry.accountNumber,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        openingBalance: entry.openingBalance,
        balance: entry.balance,
        totalDebitAmount: entry.totalDebitAmount,
        totalCreditAmount: entry.totalCreditAmount,
        monthlyValues: entry.monthlyValues,
        createdDate: entry.createdDate,
        updatedDate: entry.updatedDate,
      }));

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
