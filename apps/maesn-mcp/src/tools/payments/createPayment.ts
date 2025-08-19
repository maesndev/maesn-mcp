import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const paymentLineSchema = z.object({
  accountId: z.string().describe("Identifier of the account where the payment is recorded").optional(),
  amount: z.number().describe("Amount of the payment line in the specified currency").optional(),
  description: z.string().describe("Short description or note for this payment line").optional(),
  invoiceId: z.string().describe("Identifier of the related invoice being paid").optional(),
  paymentDate: z.string().describe("Date of the payment in ISO 8601 format").optional(),
  supplierId: z.string().describe("Identifier of the supplier receiving the payment").optional(),
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
      currency: z.string().describe("Currency code (ISO 4217) in which the payment is made").optional(),
      exchangeRate: z.number().describe("Exchange rate used if currency differs from base").optional(),
      journalCode: z.string().describe("Journal code where the payment is booked").optional(),
      paymentLines: z.array(paymentLineSchema).default([]).describe("List of individual payment lines included in the payment").optional(),
      paymentType: z.string().describe("Type of payment, e.g., CREDITOR or DEBTOR").optional(),
    })
    .describe('The data of the payment you want to create ').default({}),
});

export const apiTool = {
  name: 'createPayment',
  description: 'Create a payment',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/payments`
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

      const payment = data.data;
      const mapped = {
        id: payment.id,
        currency: payment.currency,
        createdDate: payment.createdDate,
        exchangeRate: payment.exchangeRate,
        journalCode: payment.journalCode,
        updatedDate: payment.updatedDate,
        paymentLines: payment.paymentLines,
        paymentType: payment.paymentType,
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
