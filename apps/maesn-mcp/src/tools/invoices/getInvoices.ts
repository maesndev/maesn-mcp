import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

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
        .describe('Filter invoices modified after this date in ISO format'),
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
      status: z.string().optional().describe('Filter invoices by status'),
      paymentStatus: z
        .string()
        .optional()
        .describe('Filter invoices by payment status'),


      orderField: z
        .string()
        .optional()
        .describe("The field that you want to order the response on"),
      orderDir: z
        .string()
        .optional()
        .describe("The direction of the ordering, either 'asc' or 'desc'"),
    })
    .optional(),
});

export const apiTool = {
  name: 'getInvoices',
  description: 'Get a list of invoices',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/invoices`
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
    if (query?.status) url.searchParams.append('email', query.status);
    if (query?.paymentStatus) url.searchParams.append('name', query.paymentStatus);
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

      const mapped = data.data.map((invoice: any) => ({
        invoiceId: invoice.invoiceId,
        addresses: invoice.addresses,
        contactId: invoice.contactId,
        createdDate: invoice.createdDate,
        currency: invoice.currency,
        discountAmount: invoice.discountAmount,
        dueDate: invoice.dueDate,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        lineAmountTypes: invoice.lineAmountTypes,
        lineItems: invoice.lineItems,
        name: invoice.name,
        oneLineAddress: invoice.oneLineAddress,
        paidDate: invoice.paidDate,
        paymentStatus: invoice.paymentStatus,
        paymentTermDuration: invoice.paymentTermDuration,
        reference: invoice.reference,
        shippingDate: invoice.shippingDate,
        status: invoice.status,
        sumNetAmount: invoice.sumNetAmount,
        taxRule: invoice.taxRule,
        totalAmount: invoice.totalAmount,
        totalTaxAmount: invoice.totalTaxAmount,
        updatedDate: invoice.updatedDate,
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
