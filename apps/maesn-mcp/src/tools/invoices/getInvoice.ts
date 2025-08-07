import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
  path: z.object({
    invoiceId: z.string().describe('The unique id of the invoice'),
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
  name: 'getInvoice',
  description: 'Get a invoice by id',
  input: inputSchema,
  run: async ({ headers, path, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/invoices/${path.invoiceId}`
    );
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
      const invoice = data.data;
      const mapped = {
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
