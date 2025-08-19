import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const addressSchema = z.object({
  addressLine1: z.string().describe("Primary street name and house number of the address").optional(),
  addressLine2: z.string().describe("Additional address details such as apartment, suite, or floor").optional(),
  city: z.string().describe("Name of the city for the address").optional(),
  countryCode: z.string().describe("Two-letter country code in ISO 3166-1 alpha-2 format").optional(),
  postalCode: z.string().describe("Postal or ZIP code of the address").optional(),
  type: z.string().describe("Specifies the usage type of the address, e.g. BILLING or SHIPPING").optional(),
});

const lineItemSchema = z.object({
  accountCode: z.string().describe("Accounting code linked to the item or service").optional(),
  accountId: z.string().describe("Identifier of the account associated with the item").optional(),
  description: z.string().describe("Detailed description of the product or service").optional(),
  itemId: z.string().describe("Unique identifier of the product or service").optional(),
  name: z.string().describe("Short name or label of the product or service").optional(),
  quantity: z.number().describe("Number of units or items included in this line").optional(),
  taxCode: z.string().describe("Applicable tax code for this item").optional(),
  taxRatePercentage: z.number().describe("Percentage rate of tax applied to this item").optional(),
  taxType: z.string().describe("Specific tax type applied to this line item").optional(),
  type: z.string().describe("Type of line, e.g., ITEM or SERVICE").optional(),
  totalDiscountAmount: z.number().describe("Total discount amount applied to this line item").optional(),
  totalDiscountPercentage: z.number().describe("Discount percentage applied to this line item").optional(),
  totalGrossAmount: z.number().describe("Gross amount including tax for this line item").optional(),
  totalNetAmount: z.number().describe("Net amount excluding tax for this line item").optional(),
  totalTaxAmount: z.number().describe("Total tax applied to this line item").optional(),
  unitAmount: z.number().describe("Price per unit before discounts and taxes").optional(),
  unitDiscountAmount: z.number().describe("Discount amount applied per single unit").optional(),
  unitDiscountPercentage: z.number().describe("Discount percentage applied per single unit").optional(),
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
      addresses: z.array(addressSchema).default([]).describe("List of addresses associated with the offer").optional(),
      contactId: z.string().describe("Identifier of the contact linked to this offer").optional(),
      currency: z.string().describe("Currency code (ISO 4217) in which the offer is recorded").optional(),
      lineItems: z.array(lineItemSchema).default([]).describe("Detailed list of products or services included in the offer").optional(),
      name: z.string().describe("Name or title of the offer, usually linked to a customer or project").optional(),
      offerDate: z.string().describe("Date when the offer was created, in ISO 8601 format").optional(),
      offerNumber: z.string().describe("Sequential number or unique identifier of the offer").optional(),
      reference: z.string().describe("Reference number or external identifier for the offer").optional(),
      status: z.string().describe("Current status of the offer, e.g., DRAFT or SENT").optional(),
      taxText: z.string().describe("Free-text note describing applied taxes").optional(),
      totalDiscountAmount: z.number().describe("Total discount amount applied to the entire offer").optional(),
      totalDiscountPercentage: z.number().describe("Total discount percentage applied to the offer").optional(),
      totalGrossAmount: z.number().describe("Total gross amount including taxes for the offer").optional(),
      totalNetAmount: z.number().describe("Total net amount excluding taxes for the offer").optional(),
      totalTaxAmount: z.number().describe("Total amount of taxes applied to the offer").optional(),
    })
    .describe('The data of the offer you want to create ').default({}),
});

export const apiTool = {
  name: 'createOffer',
  description: 'Create an offer',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/offers`
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

      const offer = data.data;
      const mapped = {
        id: offer.id,
        addresses: offer.addresses,
        contactId: offer.contactId,
        createdDate: offer.createdDate,
        currency: offer.currency,
        lineItems: offer.lineItems,
        name: offer.name,
        offerDate: offer.offerDate,
        offerNumber: offer.offerNumber,
        oneLineAddress: offer.oneLineAddress,
        reference: offer.reference,
        status: offer.status,
        taxText: offer.taxText,
        totalDiscountAmount: offer.totalDiscountAmount,
        totalDiscountPercentage: offer.totalDiscountPercentage,
        totalGrossAmount: offer.totalGrossAmount,
        totalNetAmount: offer.totalNetAmount,
        totalTaxAmount: offer.totalTaxAmount,
        updatedDate: offer.updatedDate,
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
