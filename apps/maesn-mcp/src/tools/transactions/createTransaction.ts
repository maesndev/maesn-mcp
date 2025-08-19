import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z
    .object({
      apiKey: z
        .string()
        .optional()
        .describe(
          'Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.'
        ),
      accountKey: z
        .string()
        .optional()
        .describe(
          'Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.'
        ),
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
      id: z.string().optional().describe("Booking id"),
      accountId: z.string().optional().describe("Account id"),
      accountNumber: z.number().optional().describe("Account number"),
      amount: z.number().optional().describe("Amount"),
      bookingDate: z.string().optional().describe("Booking date"),
      contact: z.string().optional().describe("Contact id"),
      currency: z.string().optional().describe("Currency code"),
      description: z.string().optional().describe("Booking description"),
      journalCode: z.string().optional().describe("Journal code"),
      ledgerName: z.string().optional().describe("Ledger name"),
      reference: z.string().optional().describe("Reference"),
      status: z.enum(['CREATED', 'LINKED', 'PRIVATE', 'BOOKED', 'AUTHORISED', 'DELETED']).optional().describe("Status"),
      taxRatePercentage: z.number().optional().describe("Tax rate percentage"),
      type: z.enum(['RECEIVE', 'RECEIVE_OVERPAYMENT', 'RECEIVE_PREPAYMENT', 'SPEND', 'SPEND_OVERPAYMENT', 'SPEND_PREPAYMENT', 'RECEIVE_TRANSFER', 'SPEND_TRANSFER' ]).optional().describe("Transaction type"),
      valueDate: z.string().optional().describe("Value date"),
    })
    .describe('The data of the transaction you want to create ')
    .default({}),
});

export const apiTool = {
  name: 'createTransaction',
  description: 'Create a transaction',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/transactions`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    const formData = new FormData();
    formData.append('transaction', JSON.stringify(body));

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();

      const transaction = data.data;
      const mapped = {
        id: transaction.id,
        accountId: transaction.accountId,
        accountNumber: transaction.accountNumber,
        amount: transaction.amount,
        bookingDate: transaction.bookingDate,
        contact: transaction.contact,
        currency: transaction.currency,
        description: transaction.description,
        files: transaction.files,
        journalCode: transaction.journalCode,
        ledgerName: transaction.ledgerName,
        reference: transaction.reference,
        status: transaction.status,
        taskId: transaction.taskId,
        taxRatePercentage: transaction.taxRatePercentage,
        type: transaction.type,
        valueDate: transaction.valueDate,
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
