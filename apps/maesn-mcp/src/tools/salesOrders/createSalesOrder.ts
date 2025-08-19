import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';


const addressSchema = z.object({
  addressLine1: z.string().describe("Primary street name and house number of the address").optional(),
  addressLine2: z.string().describe("Additional address details such as apartment or floor").optional(),
  city: z.string().describe("Name of the city for the address").optional(),
  countryCode: z.string().describe("Two-letter country code in ISO 3166-1 alpha-2 format").optional(),
  postalCode: z.string().describe("Postal or ZIP code of the address").optional(),
  type: z.enum(["BILLING"]).describe("Specifies whether the address is used for billing").optional(),
});

const lineItemSchema = z.object({
  itemId: z.string().describe("Unique identifier of the product or service").optional(),
  description: z.string().describe("Detailed description of the product or service").optional(),
  itemName: z.string().describe("Short name of the product or service").optional(),
  quantity: z.number().describe("Number of units ordered for this line item").optional(),
  taxCode: z.string().describe("Applicable tax code for this item").optional(),
  taxRatePercentage: z.number().describe("Percentage of tax applied to this item").optional(),
  totalDiscountAmount: z.number().describe("Total discount amount applied to this line").optional(),
  totalDiscountPercentage: z.number().describe("Percentage of discount applied to this line").optional(),
  totalGrossAmount: z.number().describe("Total gross amount including tax for this line").optional(),
  totalNetAmount: z.number().describe("Total net amount excluding tax for this line").optional(),
  totalTaxAmount: z.number().describe("Total tax amount applied to this line").optional(),
  unitAmount: z.number().describe("Price per single unit before discounts and taxes").optional(),
  unitDiscountAmount: z.number().describe("Discount amount applied per single unit").optional(),
  unitDiscountPercentage: z.number().describe("Discount percentage applied per unit").optional(),
  unitName: z.string().describe("Unit of measurement such as piece, hour, or kg").optional(),
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
      addresses: z.array(addressSchema).default([]).describe("List of all addresses related to the sales order").optional(),
      billingContactId: z.string().describe("Identifier of the contact used for billing purposes").optional(),
      comment: z.string().describe("Free-text comment or note about the sales order").optional(),
      contactId: z.string().describe("Identifier of the main customer contact for this order").optional(),
      currency: z.string().describe("Currency code (ISO 4217) in which the order is recorded").optional(),
      deliveryDate: z.string().describe("Expected delivery date in ISO 8601 format").optional(),
      lineItems: z.array(lineItemSchema).default([]).describe("Detailed list of products or services included in the order").optional(),
      oneLineAddress: z.string().describe("Full address provided as a single line of text").optional(),
      orderDate: z.string().describe("Date when the order was created in ISO 8601 format").optional(),
      projectId: z.string().describe("Identifier of the project linked to this sales order").optional(),
      shippingContactId: z.string().describe("Identifier of the contact used for shipping").optional(),
      status: z.string().describe("Current processing status of the sales order").optional(),
      totalDiscountAmount: z.number().describe("Overall discount amount applied to the entire order").optional(),
      totalDiscountPercentage: z.number().describe("Overall discount percentage applied to the order").optional(),
      totalGrossAmount: z.number().describe("Total gross amount including taxes for the order").optional(),
      totalNetAmount: z.number().describe("Total net amount excluding taxes for the order").optional(),
      totalTaxAmount: z.number().describe("Total amount of taxes applied to the order").optional(),
    })
    .describe('The data of the salesOrder you want to create ').default({}),
});

export const apiTool = {
  name: 'createSalesOrder',
  description: 'Create a sales order',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/salesOrders`
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

      const salesOrder = data.data;
      const mapped = {
        id: salesOrder.id,
        addresses: salesOrder.addresses,
        billingContactId: salesOrder.billingContactId,
        comment: salesOrder.comment,
        contactId: salesOrder.contactId,
        createdDate: salesOrder.createdDate,
        currency: salesOrder.currency,
        deliveryDate: salesOrder.deliveryDate,
        lineItems: salesOrder.lineItems,
        oneLineAddress: salesOrder.oneLineAddress,
        orderDate: salesOrder.orderDate,
        projectId: salesOrder.projectId,
        shippingContactId: salesOrder.shippingContactId,
        status: salesOrder.status,
        totalDiscountAmount: salesOrder.totalDiscountAmount,
        totalDiscountPercentage: salesOrder.totalDiscountPercentage,
        totalGrossAmount: salesOrder.totalGrossAmount,
        totalNetAmount: salesOrder.totalNetAmount,
        totalTaxAmount: salesOrder.totalTaxAmount,
        updatedDate: salesOrder.updatedDate,
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
