import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
  path: z.object({
    billId: z.string().describe('The unique id of the bill'),
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
  name: 'getBill',
  description: 'Get a bill by id',
  input: inputSchema,
  run: async ({ headers, path, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/bills/${path.billId}`
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
      const bill = data.data;
      const mapped = {
        id: bill.id,
        accountId: bill.accountId,
        addresses: bill.addresses,
        billDate: bill.billDate,
        billNumber: bill.billNumber,
        contactId: bill.contactId,
        createdDate: bill.createdDate,
        currency: bill.currency,
        deliveryDate: bill.deliveryDate,
        dueDate: bill.dueDate,
        fileId: bill.fileId,
        journalCode: bill.journalCode,
        lineItems: bill.lineItems,
        name: bill.name,
        oneLineAddress: bill.oneLineAddress,
        paidDate: bill.paidDate,
        paymentDays: bill.paymentDays,
        paymentStatus: bill.paymentStatus,
        paymentTermId: bill.paymentTermId,
        reference: bill.reference,
        shippingDate: bill.shippingDate,
        shippingType: bill.shippingType,
        status: bill.status,
        taxRule: bill.taxRule,
        taxText: bill.taxText,
        totalDiscountAmount: bill.totalDiscountAmount,
        totalDiscountPercentage: bill.totalDiscountPercentage,
        totalGrossAmount: bill.totalGrossAmount,
        totalNetAmount: bill.totalNetAmount,
        totalTaxAmount: bill.totalTaxAmount,
        updatedDate: bill.updatedDate,
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
