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
      code: z.string().describe("Project code or reference identifier").optional(),
      contactId: z.string().describe("Identifier of the main contact associated with the project").optional(),
      currency: z.string().describe("Currency code (ISO 4217) used for the project").optional(),
      description: z.string().describe("Detailed description or notes about the project").optional(),
      endDate: z.string().describe("Planned or actual project end date in ISO 8601 format").optional(),
      name: z.string().describe("Official name or title of the project").optional(),
      status: z.string().describe("Current project status such as ACTIVE or CLOSED").optional(),
      startDate: z.string().describe("Planned or actual project start date in ISO 8601 format").optional(),
    })
    .describe('The data of the project you want to create ').default({}),
});

export const apiTool = {
  name: 'createProject',
  description: 'Create a project',
  input: inputSchema,
  run: async ({ headers, query, body }: z.infer<typeof inputSchema>) => {
    const url = new URL(
      `https://unified-backend-prod.azurewebsites.net/accounting/projects`
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

      const project = data.data;
      const mapped = {
        id: project.id,
        code: project.code,
        createdDate: project.createdDate,
        contactId: project.contactId,
        currency: project.currency,
        description: project.description,
        endDate: project.endDate,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        updatedDate: project.updatedDate,
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
