import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';
const addressSchema = z.object({
  addressLine1: z.string().describe("Primary street name and house number of the address").optional(),
  addressLine2: z.string().describe("Additional details such as apartment, suite, or floor").optional(),
  city: z.string().describe("City name of the address").optional(),
  countryCode: z.string().describe("Two-letter ISO 3166-1 alpha-2 country code").optional(),
  postalCode: z.string().describe("Postal or ZIP code of the address").optional(),
  type: z.string().describe("Specifies the usage type of the address, e.g., BILLING or SHIPPING").optional(),
});

const dimensionSchema = z.object({
  name: z.string().describe("Name of the specific dimension").optional(),
  categoryName: z.string().describe("Name of the dimension category, e.g., CostCenter").optional(),
});

const lineItemSchema = z.object({
  accountId: z.string().describe("Identifier of the account related to the line item").optional(),
  accountNumber: z.string().describe("Account number associated with the line item").optional(),
  description: z.string().describe("Description of the credited product or service").optional(),
  dimensions: z.array(dimensionSchema).default([]).describe("List of dimensions such as cost centers for this line item").optional(),
  itemId: z.string().describe("Unique identifier of the credited item").optional(),
  itemName: z.string().describe("Short name or label of the credited item").optional(),
  quantity: z.number().describe("Quantity of units credited for this line item").optional(),
  taxCode: z.string().describe("Tax code applied to this line item").optional(),
  taxRatePercentage: z.number().describe("Percentage of tax applied to this line item").optional(),
  totalDiscountAmount: z.number().describe("Discount amount applied to this line item").optional(),
  totalDiscountPercentage: z.number().describe("Discount percentage applied to this line item").optional(),
  totalGrossAmount: z.number().describe("Gross amount including tax for this line item").optional(),
  totalNetAmount: z.number().describe("Net amount excluding tax for this line item").optional(),
  totalTaxAmount: z.number().describe("Tax amount applied to this line item").optional(),
  unitAmount: z.number().describe("Price per unit before tax and discounts").optional(),
  unitDiscountAmount: z.number().describe("Discount amount applied per unit").optional(),
  unitDiscountPercentage: z.number().describe("Discount percentage applied per unit").optional(),
  unitName: z.string().describe("Unit of measurement such as PIECE, HOUR, or KG").optional(),
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
      accountId: z.string().describe("Identifier of the main account associated with the vendor credit").optional(),
      addresses: z.array(addressSchema).default([]).describe("List of addresses associated with the vendor credit").optional(),
      contactId: z.string().describe("Identifier of the contact or supplier linked to the vendor credit").optional(),
      currency: z.string().describe("Currency code (ISO 4217) of the vendor credit").optional(),
      deliveryDate: z.string().describe("Date when goods or services were delivered").optional(),
      dueDate: z.string().describe("Date when the vendor credit is due for settlement").optional(),
      journalCode: z.string().describe("Journal code where the vendor credit is recorded").optional(),
      lineItems: z.array(lineItemSchema).default([]).describe("Detailed list of credited products or services").optional(),
      name: z.string().describe("Title or label of the vendor credit, often a supplier name").optional(),
      oneLineAddress: z.string().describe("Full address provided as a single line of text").optional(),
      paidDate: z.string().describe("Date when the vendor credit was paid, in ISO 8601 format").optional(),
      paymentDays: z.number().describe("Number of days allowed for settlement").optional(),
      paymentStatus: z.string().describe("Current payment status, e.g., PENDING or SETTLED").optional(),
      paymentTermId: z.string().describe("Identifier of the payment term applied to the vendor credit").optional(),
      reference: z.string().describe("Reference number or external identifier for the vendor credit").optional(),
      shippingDate: z.string().describe("Date when the goods were shipped or services started").optional(),
      shippingType: z.string().describe("Type of shipping method, e.g., DELIVERY").optional(),
      status: z.string().describe("Current status of the vendor credit, e.g., DRAFT or APPROVED").optional(),
      taxRule: z.string().describe("Tax calculation rule applied, e.g., NET or GROSS").optional(),
      taxText: z.string().describe("Free-text explanation or note about taxes").optional(),
      totalDiscountAmount: z.number().describe("Total discount amount applied to the vendor credit").optional(),
      totalDiscountPercentage: z.number().describe("Overall discount percentage applied to the vendor credit").optional(),
      totalGrossAmount: z.number().describe("Total gross amount including tax for the vendor credit").optional(),
      totalNetAmount: z.number().describe("Total net amount excluding tax for the vendor credit").optional(),
      totalTaxAmount: z.number().describe("Total tax amount applied to the vendor credit").optional(),
      vendorCreditDate: z.string().describe("Date when the vendor credit was created").optional(),
      vendorCreditNumber: z.string().describe("Unique number or identifier assigned to the vendor credit").optional(),
    })
    .describe('The data of the vendorCredit you want to create ').default({}),
});

export const apiTool = {
  name: 'createVendorCredit',
  description: 'Create a vendor credit',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/vendorCredits`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
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

      const vendorCredit = data.data;
      const mapped = {
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
