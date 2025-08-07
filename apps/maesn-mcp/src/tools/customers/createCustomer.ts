import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const inputSchema = z.object({
  headers: z.object({
    apiKey: z.string().describe('Your maesn X-API-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
    accountKey: z.string().describe('Your maesn X-ACCOUNT-KEY. This field is optional if you have stored your credentials in the .env file.').optional(),
  }).optional(),
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
      addresses: z.array(
        z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
          type: z.enum(['BILLING', 'SHIPPING']).describe('Address type'),
        })
      ).optional(),
      companyName: z.string().describe('The name of the company').optional(),
      contactType: z
        .enum(['CONTACT_PERSON', 'COMPANY'])
        .describe('Type of contact').optional(),
      contactPersons: z
        .array(
          z.object({
            salutation: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
          })
        )
        .describe('List of contact persons associated with the customer').optional(),
      /*
      documentId: z
        .string()
        .optional()
        .describe('The document id of the customer'),
      emailAddresses: z.array(
        z.object({
          email: z
            .string()
            .email()
            .describe('The email address of the customer'),
          type: z.enum(['BILLING', 'SHIPPING']).describe('Email address type'),
        })
      ).optional(),
      number: z.string().optional().describe('The customer number'),
      phoneNumbers: z
        .array(
          z.object({
            number: z.string().optional(),
            type: z.enum(['BILLING', 'SHIPPING']).describe('Phone number type'),
          })
        )
        .describe('List of phone numbers associated with the customer').optional(),
      projectId: z.string().optional().describe('The id of the project'),
      updatedDate: z
        .string()
        .optional()
        .describe('The date when the customer was last updated'),
      vatId: z.string().optional().describe('The VAT ID of the customer'),
      */
    })
    .describe('The data of the customer you want to create '),
});

export const apiTool = {
  name: 'createCustomer',
  description: 'Get a customer by id',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/customers`
    );
    if (query?.environmentName)
      url.searchParams.append('environmentName', query.environmentName);
    if (query?.companyId) url.searchParams.append('companyId', query.companyId);

    const {apiKey, accountKey} = checkStoredHeaders(headers);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'X-ACCOUNT-KEY': accountKey,
        },
        body: JSON.stringify(body),
      });

      console.error("request bod: ", JSON.stringify(body));



      if (!response.ok) {
        const data = await response.json();
        console.error('Response: ', data);
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const data = await response.json();


      const customer = data.data;
      const mapped = {
        id: customer.id,
        addresses: customer.addresses,
        companyName: customer.companyName,
        contactType: customer.contactType,
        contactPersons: customer.contactPersons,
        documentId: customer.documentId,
        emailAddresses: customer.emailAddresses,
        number: customer.number,
        phoneNumbers: customer.phoneNumbers,
        projectId: customer.projectId,
        updatedDate: customer.updatedDate,
        vatId: customer.vatId,
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
