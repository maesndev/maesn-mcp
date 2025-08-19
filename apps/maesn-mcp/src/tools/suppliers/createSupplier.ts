import { z } from 'zod';
import { checkStoredHeaders } from '../../commons';

const addressSchema = z.object({
  addressLine1: z.string().describe('Street name and number').optional(),
  addressLine2: z.string().describe('Street name and number').optional(),
  city: z.string().describe('City name').optional(),
  countryCode: z.string().describe('Country code in ISO 3166-1 alpha-2 format').optional(),
  postalCode: z.string().describe('Postal code').optional(),
  type: z
    .enum(['BILLING', 'DELIVERY', 'EMPTY', 'PRIVATE', 'WORK', 'PICKUP'])
    .describe('Address type').optional(),
});

const emailAddressesSchema = z.object({
  email: z.string().email().describe('The email address'),
  type: z
    .enum(['BUSINESS', 'PRIVATE', 'OFFICE', 'INVOICE', 'PAYMENT', 'OTHER'])
    .describe('Email address type')
    .optional(),
});

const phoneNumbersSchema = z.object({
  number: z.string().describe('The phone number'),
  type: z
    .enum([
      'BUSINESS',
      'MOBILE',
      'OFFICE',
      'FAX',
      'PRIVATE',
      'LANDLINE',
      'SKYPE',
      'WHATSAPP',
      'OTHER',
    ])
    .describe('Phone number type')
    .optional(),
});

const contactPersonSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailAddresses: z
    .array(emailAddressesSchema)
    .default([])
    .describe('List of email addresses associated with the contact person'),
  phoneNumbers: z
    .array(phoneNumbersSchema)
    .default([])
    .describe('List of phone numbers associated with the contact person'),
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
      addresses: z
        .array(addressSchema)
        .default([])
        .describe('List of addresses associated with the supplier'),
      companyName: z.string().describe('The name of the company').optional(),
      contactType: z
        .enum(['CONTACT_PERSON', 'COMPANY'])
        .describe('Type of contact')
        .optional(),
      contactPersons: z
        .array(contactPersonSchema)
        .default([])
        .describe('List of contact persons associated with the supplier'),
      documentId: z
        .string()
        .optional()
        .describe('The document id of the supplier'),
      emailAddresses: z
        .array(emailAddressesSchema)
        .default([])
        .describe('List of email addresses associated with the supplier'),
      number: z.string().optional().describe('The supplier number'),
      phoneNumbers: z
        .array(phoneNumbersSchema)
        .default([])
        .describe('List of phone numbers associated with the supplier'),
      projectId: z.string().optional().describe('The id of the project'),
      vatId: z.string().optional().describe('The VAT ID of the supplier'),
    })
    .describe('The data of the supplier you want to create ').default({}),
});

export const apiTool = {
  name: 'createSupplier',
  description: 'Create a supplier',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/suppliers`
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

      const supplier = data.data;
      const mapped = {
        id: supplier.id,
        addresses: supplier.addresses,
        companyName: supplier.companyName,
        contactType: supplier.contactType,
        contactPersons: supplier.contactPersons,
        documentId: supplier.documentId,
        emailAddresses: supplier.emailAddresses,
        number: supplier.number,
        phoneNumbers: supplier.phoneNumbers,
        projectId: supplier.projectId,
        updatedDate: supplier.updatedDate,
        vatId: supplier.vatId,
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
