import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const addressSchema = z.object({
  city: z.string().describe("City name of the address").optional(),
});

const lineItemSchema = z.object({
  id: z.string().describe("Identifier of the line item").optional(),
  accountCode: z.string().describe("Accounting code linked to the line item").optional(),
  accountId: z.string().describe("Identifier of the account associated with this line item").optional(),
  accountName: z.string().describe("Name of the account associated with this line item").optional(),
  accountNumber: z.number().describe("Account number associated with this line item").optional(),
  bookingTaxCode: z.string().describe("Tax code applied during booking for this line item").optional(),
  description: z.string().describe("Description of the booked product or service").optional(),
  dimension1: z.string().describe("Primary dimension associated with the line item").optional(),
  dimension2: z.string().describe("Secondary dimension associated with the line item").optional(),
  discountAmount: z.number().describe("Primary discount amount applied to the line item").optional(),
  discountAmount2: z.number().describe("Secondary discount amount applied to the line item").optional(),
  discountPercentage: z.number().describe("Primary discount percentage applied to the line item").optional(),
  discountPercentage2: z.number().describe("Secondary discount percentage applied to the line item").optional(),
  taxCode: z.string().describe("Tax code applied to the line item").optional(),
  taxRatePercentage: z.number().describe("Percentage tax rate applied to this line item").optional(),
  totalGrossAmount: z.number().describe("Gross amount including taxes for this line item").optional(),
  totalNetAmount: z.number().describe("Net amount excluding taxes for this line item").optional(),
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
      id: z.string().describe("Unique identifier of the booking proposal").optional(),
      addresses: z.array(addressSchema).default([]).describe("List of addresses associated with the booking proposal").optional(),
      bankAccountId: z.string().describe("Identifier of the related bank account").optional(),
      bankAccountNumber: z.number().describe("Bank account number of the associated account").optional(),
      bankCode: z.string().describe("Bank code").optional(),
      bic: z.string().describe("Bank Identifier Code (BIC/SWIFT)").optional(),
      bookingProposalDate: z.string().describe("Date when the booking proposal was created").optional(),
      contactAccountNumber: z.number().describe("Account number of the contact associated with the proposal").optional(),
      contactId: z.string().describe("Identifier of the contact linked to the booking proposal").optional(),
      contactName: z.string().describe("Name of the contact associated with the proposal").optional(),
      currency: z.string().describe("Currency code (ISO 4217) used for the proposal").optional(),
      deliveryDate: z.string().describe("Expected delivery date in ISO 8601 format").optional(),
      discountPaymentDate: z.string().describe("First discount payment date if paid early").optional(),
      discountPaymentDate2: z.string().describe("Second discount payment date if paid early").optional(),
      dueDate: z.string().describe("Date when the booking proposal is due").optional(),
      journalCode: z.string().describe("Journal code where the booking will be recorded").optional(),
      iban: z.string().describe("International Bank Account Number (IBAN)").optional(),
      isPaymentOrder: z.string().describe("Indicates whether this is a payment order (true/false)").optional(),
      ledgerName: z.string().describe("Name of the ledger where the booking is recorded").optional(),
      lineItems: z.array(lineItemSchema).default([]).describe("List of line items associated with the booking proposal").optional(),
      notes: z.string().describe("Additional notes or comments for the booking proposal").optional(),
      number: z.string().describe("Sequential or unique number assigned to the booking proposal").optional(),
      orderId: z.string().describe("Identifier of the related order").optional(),
      paidDate: z.string().describe("Date when the proposal was paid, in ISO 8601 format").optional(),
      paymentTermsId: z.string().describe("Identifier of the payment terms applied to this proposal").optional(),
      totalGrossAmount: z.number().describe("Total gross amount including taxes for the booking proposal").optional(),
      vatId: z.string().describe("VAT identifier of the associated entity").optional(),
    })
    .describe('The data of the booking proposal you want to create ').default({}),
});

export const apiTool = {
  name: 'createBookingProposal',
  description: 'Create a booking proposal',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/bookingProposals`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const { apiKey, accountKey } = checkStoredHeaders(headers);

    const formData = new FormData();
    formData.append('bookingProposal', JSON.stringify(body));

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

      const bookingProposal = data.data;
      const mapped = {
        id: bookingProposal.id,
        addresses: bookingProposal.addresses,
        bankAccountId: bookingProposal.bankAccountId,
        bankAccountNumber: bookingProposal.bankAccountNumber,
        bankCode: bookingProposal.bankCode,
        bic: bookingProposal.bic,
        bookingProposalDate: bookingProposal.bookingProposalDate,
        bookingType: bookingProposal.bookingType,
        contactAccountNumber: bookingProposal.contactAccountNumber,
        contactId: bookingProposal.contactId,
        contactName: bookingProposal.contactName,
        createdDate: bookingProposal.createdDate,
        currency: bookingProposal.currency,
        deliveryDate: bookingProposal.deliveryDate,
        discountPaymentDate: bookingProposal.discountPaymentDate,
        discountPaymentDate2: bookingProposal.discountPaymentDate2,
        files: bookingProposal.files,
        journalCode: bookingProposal.journalCode,
        iban: bookingProposal.iban,
        isPaymentOrder: bookingProposal.isPaymentOrder,
        ledgerName: bookingProposal.ledgerName,
        lineItems: bookingProposal.lineItems,
        notes: bookingProposal.notes,
        number: bookingProposal.number,
        orderId: bookingProposal.orderId,
        paidDate: bookingProposal.paidDate,
        paymentTermsId: bookingProposal.paymentTermsId,
        taskId: bookingProposal.taskId,
        totalGrossAmount: bookingProposal.totalGrossAmount,
        updatedDate: bookingProposal.updatedDate,
        vatId: bookingProposal.vatId,
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
