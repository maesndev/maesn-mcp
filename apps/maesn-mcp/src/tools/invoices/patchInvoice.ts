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
    .describe(
      'Specifies the usage type of the address, e.g., BILLING or SHIPPING'
    )
    .optional(),
});

const dimensionSchema = z.object({
  id: z.string().describe('Identifier of the dimension').optional(),
  categoryName: z
    .string()
    .describe('Name of the dimension category, e.g., CostCenter')
    .optional(),
  name: z.string().describe('Name of the specific dimension').optional(),
});

const lineItemSchema = z.object({
  accountCode: z
    .string()
    .describe('Accounting code associated with this line item')
    .optional(),
  accountId: z
    .string()
    .describe('Identifier of the account related to the line item')
    .optional(),
  description: z
    .string()
    .describe('Description of the product or service provided')
    .optional(),
  dimensions: z
    .array(dimensionSchema)
    .default([])
    .describe(
      'List of dimensions such as cost centers linked to this line item'
    )
    .optional(),
  discountItemPercentage: z
    .number()
    .describe('Discount percentage applied specifically to this line item')
    .optional(),
  grossAmount: z
    .number()
    .describe('Gross amount for the line item including tax')
    .optional(),
  itemId: z
    .string()
    .describe('Unique identifier of the item or service')
    .optional(),
  name: z.string().describe('Short name or title of the line item').optional(),
  quantity: z
    .number()
    .describe('Quantity of units or services provided')
    .optional(),
  taxCode: z.string().describe('Tax code applied to this line item').optional(),
  TaxRatePercentage: z
    .number()
    .describe('Percentage tax rate applied to this line item')
    .optional(),
  taxType: z
    .string()
    .describe('Specific tax type applied to the line item')
    .optional(),
  type: z
    .enum(['SERVICE_ITEM', 'MATERIAL', 'CUSTOM', 'TEXT'])
    .describe('Type of line item, such as SERVICE or PRODUCT')
    .optional(),
  unitAmount: z
    .number()
    .describe('Price per unit before tax and discounts')
    .optional(),
  unitName: z
    .string()
    .describe('Unit of measurement, e.g., PIECE or HOUR')
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
    invoiceId: z
      .string()
      .describe('The unique id of the customer'),
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
      addresses: z
        .array(addressSchema)
        .default([])
        .describe('List of addresses associated with the invoice')
        .optional(),
      contactId: z
        .string()
        .describe('Identifier of the contact linked to the invoice')
        .optional(),
      currency: z
        .string()
        .describe('Currency code (ISO 4217) of the invoice')
        .optional(),
      discountPercentage: z
        .number()
        .describe('Overall discount percentage applied to the invoice')
        .optional(),
      dueDate: z
        .string()
        .describe('Date when payment is due, in ISO 8601 format')
        .optional(),
      fileId: z
        .string()
        .describe('Identifier of an attached file related to the invoice')
        .optional(),
      grossTotalAmount: z
        .number()
        .describe('Total gross amount including taxes for the invoice')
        .optional(),
      invoiceDate: z
        .string()
        .describe('Date when the invoice was issued in ISO 8601 format')
        .optional(),
      invoiceType: z
        .string()
        .describe('Type of invoice, e.g., STANDARD or CREDIT_NOTE')
        .optional(),
      journalCode: z
        .string()
        .describe('Journal code where the invoice is recorded')
        .optional(),
      lineAmountTypes: z
        .enum(['EXCLUSIVE', 'INCLUSIVE', 'NOTAX'])
        .describe(
          'Indicates if line item amounts are EXCLUSIVE or INCLUSIVE of tax'
        )
        .optional(),
      lineItems: z
        .array(lineItemSchema)
        .default([])
        .describe('List of individual line items included in the invoice')
        .optional(),
      name: z
        .string()
        .describe(
          'Name or title of the invoice, often related to customer or project'
        )
        .optional(),
      oneLineAddress: z
        .string()
        .describe('Full address formatted as a single line')
        .optional(),
      paidDate: z
        .string()
        .describe('Date when the invoice was paid, in ISO 8601 format')
        .optional(),
      paymentTermDuration: z
        .number()
        .describe('Duration of the payment term in days')
        .optional(),
      paymentTermId: z
        .string()
        .describe('Identifier of the payment term applied to this invoice')
        .optional(),
      reference: z
        .string()
        .describe('Reference number or external identifier for the invoice')
        .optional(),
      shippingDate: z
        .string()
        .describe('Start date of shipping or delivery period')
        .optional(),
      shippingEndDate: z
        .string()
        .describe('End date of shipping or delivery period')
        .optional(),
      shippingType: z
        .enum([
          'SERVICE',
          'SERVICEPERIOD',
          'DELIVERY',
          'DELIVERYPERIOD',
          'NONE',
        ])
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
        .describe('Current status of the invoice, e.g., DRAFT, SENT, or PAID')
        .optional(),
      taxRule: z
        .string()
        .describe('Tax calculation rule, e.g., NET or GROSS')
        .optional(),
      taxText: z
        .string()
        .describe('Free-text note describing applied taxes')
        .optional(),
    })
    .describe('The data you want to update the invoice with').default({}),
});

export const apiTool = {
  name: 'patchInvoice',
  description: 'Update an invoice with the PATCH command. This means you can replace one specific field or more, leaving the other fields as is.',
  input: inputSchema,
  run: async ({ headers, path, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/invoices/${path.invoiceId}`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'PATCH',
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
