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
  path: z.object({
    contactId: z
      .string()
      .describe('The unique id of the contact'),
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
        .describe('List of addresses associated with the contact'),
      companyName: z.string().describe('The name of the company').optional(),
      contactType: z
        .enum(['CONTACT_PERSON', 'COMPANY'])
        .describe('Type of contact')
        .optional(),
      contactPersons: z
        .array(contactPersonSchema)
        .default([])
        .describe('List of contact persons associated with the contact'),
      documentId: z
        .string()
        .optional()
        .describe('The document id of the contact'),
      emailAddresses: z
        .array(emailAddressesSchema)
        .default([])
        .describe('List of email addresses associated with the contact'),
      number: z.string().optional().describe('The contact number'),
      phoneNumbers: z
        .array(phoneNumbersSchema)
        .default([])
        .describe('List of phone numbers associated with the contact'),
      projectId: z.string().optional().describe('The id of the project'),
      vatId: z.string().optional().describe('The VAT ID of the contact'),
    })
    .describe('The new data you want to update the contact with').default({}),
});

export const apiTool = {
  name: 'patchContact',
  description: 'Update a contact with the PATCH command. This means you can replace one specific field or more, leaving the other fields as is.',
  input: inputSchema,
  run: async ({ headers, path, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/contacts/${path.contactId}`
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

      const contact = data.data;
      const mapped = {
        id: contact.id,
        addresses: contact.addresses,
        companyName: contact.companyName,
        contactType: contact.contactType,
        contactPersons: contact.contactPersons,
        documentId: contact.documentId,
        emailAddresses: contact.emailAddresses,
        number: contact.number,
        phoneNumbers: contact.phoneNumbers,
        projectId: contact.projectId,
        updatedDate: contact.updatedDate,
        vatId: contact.vatId,
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
