import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

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
    itemId: z
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
      assetAccountId: z.string().describe("Identifier of the asset account linked to this item").optional(),
      expenseAccountId: z.string().describe("Identifier of the expense account for purchase transactions").optional(),
      incomeAccountId: z.string().describe("Identifier of the income account for sales transactions").optional(),
      inventoryStartDate: z.string().describe("Date when inventory tracking for this item begins (ISO 8601 format)").optional(),
      itemNumber: z.string().describe("Unique item number or SKU used to identify the product").optional(),
      name: z.string().describe("Name or title of the item as shown in the catalog or system").optional(),
      priceIncludesTax: z.boolean().describe("Indicates whether the item price already includes tax").optional(),
      stockCount: z.number().describe("Current quantity of the item in stock").optional(),
      taxCode: z.string().describe("Tax code applied to the item for accounting purposes").optional(),
      taxRatePercentage: z.number().describe("Tax rate percentage that applies to this item").optional(),
      type: z.string().describe("Type of item, such as PRODUCT or SERVICE").optional(),
      unitName: z.string().describe("Unit of measurement for the item, e.g., PIECE, HOUR, or KG").optional(),
      unitPurchasePrice: z.number().describe("Purchase price per unit of the item").optional(),
      unitSalesPrice: z.number().describe("Sales price per unit of the item").optional(),
    })
    .describe('The data of the item you want to create ').default({}),
});

export const apiTool = {
  name: 'patchItem',
  description: 'Update an item with the PATCH command. This means you can replace one specific field or more, leaving the other fields as is.',
  input: inputSchema,
  run: async ({ headers, path, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/items/${path.itemId}`
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

      const item = data.data;
      const mapped = {
        id: item.id,
        assetAccountId: item.assetAccountId,
        expenseAccountId: item.expenseAccountId,
        incomeAccountId: item.incomeAccountId,
        inventoryStartDate: item.inventoryStartDate,
        itemNumber: item.itemNumber,
        lastModifiedDate: item.lastModifiedDate,
        name: item.name,
        priceIncludesTax: item.priceIncludesTax,
        stockCount: item.stockCount,
        taxCode: item.taxCode,
        taxRatePercentage: item.taxRatePercentage,
        type: item.type,
        unitName: item.unitName,
        unitPurchasePrice: item.unitPurchasePrice,
        unitSalesPrice: item.unitSalesPrice,
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
