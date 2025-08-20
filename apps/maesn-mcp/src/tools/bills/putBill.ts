import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const addressSchema = z.object({
  addressLine1: z
    .string()
    .describe('Primary street name and house number of the address')
    .optional(),
  addressLine2: z
    .string()
    .describe('Additional details such as apartment, suite, or floor')
    .optional(),
  city: z.string().describe('City name of the address').optional(),
  countryCode: z
    .string()
    .describe('Two-letter ISO 3166-1 alpha-2 country code')
    .optional(),
  postalCode: z
    .string()
    .describe('Postal or ZIP code of the address')
    .optional(),
  type: z
    .enum(['BILLING', 'DELIVERY', 'SELLING'])
    .describe('Specifies the usage type of the address')
    .optional(),
});

const dimensionSchema = z.object({
  name: z.string().describe('Name of the specific dimension').optional(),
  categoryName: z
    .string()
    .describe('Name of the dimension category, e.g., CostCenter')
    .optional(),
});

const lineItemSchema = z.object({
  id: z
    .string()
    .describe('Unique identifier of the line item, used for updates')
    .optional(),
  accountId: z
    .string()
    .describe('Identifier of the account related to the line item')
    .optional(),
  accountNumber: z
    .string()
    .describe('Account number associated with the line item')
    .optional(),
  description: z
    .string()
    .describe('Description of the purchased product or service')
    .optional(),
  dimensions: z
    .array(dimensionSchema)
    .default([])
    .describe('List of dimensions such as cost centers for this line item')
    .optional(),
  itemId: z
    .string()
    .describe('Unique identifier of the purchased item')
    .optional(),
  itemName: z
    .string()
    .describe('Short name or label of the purchased item')
    .optional(),
  quantity: z
    .number()
    .describe('Quantity of units purchased for this line item')
    .optional(),
  taxCode: z.string().describe('Tax code applied to the line item').optional(),
  taxRatePercentage: z
    .number()
    .describe('Percentage of tax applied to this line item')
    .optional(),
  totalDiscountAmount: z
    .number()
    .describe('Discount amount applied to this line item')
    .optional(),
  totalDiscountPercentage: z
    .number()
    .describe('Discount percentage applied to this line item')
    .optional(),
  totalGrossAmount: z
    .number()
    .describe('Gross amount including tax for this line item')
    .optional(),
  totalNetAmount: z
    .number()
    .describe('Net amount excluding tax for this line item')
    .optional(),
  totalTaxAmount: z
    .number()
    .describe('Tax amount applied to this line item')
    .optional(),
  unitAmount: z
    .number()
    .describe('Price per unit before tax and discounts')
    .optional(),
  unitDiscountAmount: z
    .number()
    .describe('Discount amount applied per unit')
    .optional(),
  unitDiscountPercentage: z
    .number()
    .describe('Discount percentage applied per unit')
    .optional(),
  unitName: z
    .string()
    .describe('Unit of measurement such as PIECE, HOUR, or KG')
    .optional(),
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
  path: z.object({
    billId: z.string().describe('The unique id of the bill you want to update'),
  }),
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
      accountId: z
        .string()
        .describe('Identifier of the main account associated with the bill')
        .optional(),
      addresses: z
        .array(addressSchema)
        .default([])
        .describe('List of addresses associated with the bill')
        .optional(),
      billDate: z
        .string()
        .describe('Date when the bill was issued, in ISO 8601 format')
        .optional(),
      billNumber: z
        .string()
        .describe('Unique number assigned to the bill')
        .optional(),
      contactId: z
        .string()
        .describe('Identifier of the contact or supplier linked to the bill')
        .optional(),
      currency: z
        .string()
        .describe('Currency code (ISO 4217) of the bill')
        .optional(),
      deliveryDate: z
        .string()
        .describe('Date when goods or services were delivered')
        .optional(),
      dueDate: z
        .string()
        .describe('Date when the bill is due for payment, in ISO 8601 format')
        .optional(),
      fileId: z
        .string()
        .describe('Identifier of an attached file such as a scanned bill')
        .optional(),
      journalCode: z
        .string()
        .describe('Journal code where the bill is recorded')
        .optional(),
      lineItems: z
        .array(lineItemSchema)
        .default([])
        .describe('Detailed list of purchased products or services')
        .optional(),
      name: z
        .string()
        .describe('Title or label of the bill, often a supplier name')
        .optional(),
      oneLineAddress: z
        .string()
        .describe('Full address provided as a single line of text')
        .optional(),
      paidDate: z
        .string()
        .describe('Date when the bill was paid, in ISO 8601 format')
        .optional(),
      paymentDays: z
        .number()
        .describe('Number of days allowed for payment')
        .optional(),
      paymentStatus: z
        .enum([
          'NO_OPEN_ITEM',
          'PENDING',
          'PARTLY_PAID',
          'PAID',
          'DEBITED',
          'CREDIT_NOTE_CLEARED',
          'CLEARED_WITH_CREDIT_NOTE',
          'BAD_DEBT',
          'PARTIAL_CANCELLATION',
          'CANCELED',
          'UNKNOWN',
        ])
        .describe('Current payment status, e.g., PENDING or PAID')
        .optional(),
      paymentTermId: z
        .string()
        .describe('Identifier of the payment term applied to the bill')
        .optional(),
      reference: z
        .string()
        .describe('Reference number or external identifier of the bill')
        .optional(),
      shippingDate: z
        .string()
        .describe('Date when the goods were shipped or services started')
        .optional(),
      shippingType: z
        .enum(['SERVICE', 'SERVICE_PERIOD', 'DELIVERY', 'DELIVERY_PERIOD'])
        .describe('Type of shipping')
        .optional(),
      status: z
        .enum([
          'DRAFT',
          'CORRECTIVE',
          'SUBMITTED',
          'DOCUMENT_CREATED',
          'OPEN',
          'PARTIALLY_PAID',
          'PAID',
          'PARTIALLY_OVERDUE',
          'OVERDUE',
          'VOIDED',
        ])
        .describe('Current status of the bill, e.g., DRAFT or APPROVED')
        .optional(),
      taxRule: z
        .enum([
          'NET',
          'TAXFREE',
          'INTRACOMMUNITY_GOODS',
          'INTRACOMMUNITY_SERVICE',
          'EXPORT_SERVICE',
          'EXPORT_GOODS',
          'REVERSE_CHARGE',
          'GROSS',
          'CONSTRUCTION_SERVICE',
          'PHOTOVOLTAIC_EQUIPMENT',
          'SMALL_BUSINESS_VAT_EXEMPTION',
          'NON_DOMESTIC_SERVICE',
          'OSS_GOODS',
          'OSS_ELECTRONIC_SERVICES',
          'OSS_SERVICES',
        ])
        .describe('Tax calculation rule applied, e.g., NET or GROSS')
        .optional(),
      taxText: z
        .string()
        .describe('Free-text explanation or note about taxes')
        .optional(),
      totalDiscountAmount: z
        .number()
        .describe('Total discount amount applied to the bill')
        .optional(),
      totalDiscountPercentage: z
        .number()
        .describe('Overall discount percentage applied to the bill')
        .optional(),
      totalGrossAmount: z
        .number()
        .describe('Total gross amount including tax for the bill')
        .optional(),
      totalNetAmount: z
        .number()
        .describe('Total net amount excluding tax for the bill')
        .optional(),
      totalTaxAmount: z
        .number()
        .describe('Total tax amount applied to the bill')
        .optional(),
    })
    .describe('The new data of the bill you want to update it with')
    .default({}),
});

export const apiTool = {
  name: 'putBill',
  description:
    'Update a bill with the PUT command. This means you replace the whole bill object with a new one',
  input: inputSchema,
  run: async ({ headers, path, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/bills/${path.billId}`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
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
