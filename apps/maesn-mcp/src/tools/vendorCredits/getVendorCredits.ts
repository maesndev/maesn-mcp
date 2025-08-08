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
        .describe('Filter vendorCredits modified after this date in ISO format'),
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
      status: z.enum(['DRAFT', 'CORRECTIVE', 'SUBMITTED', 'DOCUMENT_CREATED', 'OPEN', 'PARTIALLY_PAID', 'PAID', 'PARTIALLY_OVERDUE', 'OVERDUE', 'VOIDED']).optional().describe('Filter vendor credits by status'),
      paymentStatus: z
        .enum(['NO_OPEN_ITEM', 'PENDING', 'PARTLY_PAID', 'PAID', 'DEBITED', 'CREDIT_NOTE_CLEARED', 'CLEARED_WITH_CREDIT_NOTE', 'BAD_DEBT', 'PARTIAL_CANCELLATION','CANCELED', 'UNKNOWN'])
        .optional()
        .describe('Filter vendor credits by payment status'),
    })
    .optional(),
});

export const apiTool = {
  name: 'getVendorCredits',
  description: 'Get a list of vendor credits',
  input: inputSchema,
  run: async ({ headers, query }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/vendorCredits`
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
    if (query?.status) url.searchParams.append('status', query.status);
    if (query?.paymentStatus) url.searchParams.append('paymentStatus', query.paymentStatus);

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

      const mapped = data.data.map((vendorCredit: any) => ({
        id: vendorCredit.id,
        accountId: vendorCredit.accountId,
        addresses: vendorCredit.addresses,
        contactId: vendorCredit.contactId,
        createdDate: vendorCredit.createdDate,
        currency: vendorCredit.currency,
        deliveryDate: vendorCredit.deliveryDate,
        dueDate: vendorCredit.dueDate,
        fileId: vendorCredit.fileId,
        journalCode: vendorCredit.journalCode,
        lineItems: vendorCredit.lineItems,
        name: vendorCredit.name,
        oneLineAddress: vendorCredit.oneLineAddress,
        paidDate: vendorCredit.paidDate,
        paymentDays: vendorCredit.paymentDays,
        paymentStatus: vendorCredit.paymentStatus,
        paymentTermId: vendorCredit.paymentTermId,
        reference: vendorCredit.reference,
        shippingDate: vendorCredit.shippingDate,
        shippingType: vendorCredit.shippingType,
        status: vendorCredit.status,
        taxRule: vendorCredit.taxRule,
        taxText: vendorCredit.taxText,
        totalDiscountAmount: vendorCredit.totalDiscountAmount,
        totalDiscountPercentage: vendorCredit.totalDiscountPercentage,
        totalGrossAmount: vendorCredit.totalGrossAmount,
        totalNetAmount: vendorCredit.totalNetAmount,
        totalTaxAmount: vendorCredit.totalTaxAmount,
        updatedDate: vendorCredit.updatedDate,
        vendorCreditDate: vendorCredit.vendorCreditDate,
        vendorCreditNumber: vendorCredit.vendorCreditNumber,
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
