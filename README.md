# Maesn Mcp Server

Maesn's official MCP (Model Context Protocol) server built with [Nx](https://nx.dev), designed to connect to Maesn’s unified backend API. This server enables tools to retrieve accounting data like customers, invoices, bills, and accounts through structured, authenticated requests.

---

## 🚀 Features

- ⚡ Fast, scalable Nx + TypeScript setup
- 🧰 Pre-integrated with Maesn’s Unified API via MCP
- 🧪 Ready-to-use tools: customers, invoices, bills, accounts

---

## 📦 Installation
```bash
git clone https://github.com/YOUR_ORG/maesn-mcp.git
cd maesn-mcp
npm install
```

## ⚙️ Setup

### Prerequisites

Before running the Maesn MCP server locally, ensure you have the following:

- 🔐 **A Maesn API key**  
  You can create an account and generate your API key via the [Maesn Developer Portal](https://app.maesn.dev/signin?book_demo_source_page=%2Fcontact).
- 🧱 **Node.js (v16 or later)**  
  We recommend using Node.js v20+ for best compatibility. Download it from [nodejs.org](https://nodejs.org/).
- 🧰 **Nx CLI (optional but helpful)**  
  Nx is used to manage and run the workspace. Install it globally for easier use:

  ```bash
  npm install -g nx
  ```

### MCP Configuration (e.g. Claude integration)

To connect your Maesn MCP server to an MCP-compatible environment (like [Claude Desktop](https://www.anthropic.com/index/claude-desktop)), download and install Claude, then follow these steps:

1. Locate the configuration file on your machine. For Claude Desktop, this is typically:
  - **Windows**: `%APPDATA%/Claude/claude_desktop_configuration.json`
  - **macOS**: `~/Library/Application Support/Claude/claude_desktop_configuration.json`
  - **Linux**: `~/.config/Claude/claude_desktop_configuration.json`

2. Add the following entry to the `mcpServers` section of the file:

```json
{
  "mcpServers": {
    "maesn-mcp": {
      "command": "node",
      "args": [
        "<ABSOLUTE_PATH>/apps/maesn-mcp/dist/main.js"
      ]
    }
  }
}
```

🔁 Replace <ABSOLUTE_PATH> with the full local path to your built MCP server.



### Environment Variable Configuration
You can configure your Maesn API credentials using environment variables.
When set, these values are automatically used by the agent, so you do not need to pass them manually each time.

You can still override the environment values at runtime by instructing your LLM to use a different API key or account key. This is useful if you want to switch between credentials quickly.

```json
{
  "mcpServers": {
    "maesn-mcp": {
      "command": "node",
      "args": [
        "<ABSOLUTE_PATH>/apps/maesn-mcp/dist/main.js"
      ],
      "env": {
        "API_KEY": "your_maesn_api_key",
        "ACCOUNT_KEY": "your_maesn_account_key"
      }
    }
  }
}
```
⚠️ Important: On Windows, Claude Desktop may fail to inject environment variables correctly. If this happens, skip the environment configuration and provide the API key and account key directly  in your request to Claude.

---


## 🛠 Run Locally

After cloning the project, install dependencies:
```bash
npm install
```

Then start the dev server:

```bash
npx nx serve maesn-mcp
```

## Available Resources

The MCP server is still under development, but most resources supported in the Unified API are already fully available through our MCP.
Below is the list of currently supported resources:

- Accounts
- Async tasks
- Bills
- Booking proposals
- Contacts
- Customers
- Dimensions
- Expenses
- Goods receipts
- Invoices
- Items
- Journal entries
- Journals
- Offers
- Payments
- Payment terms
- Projects
- Purchase orders
- Sales orders
- Suppliers
- Tax rates
- Units
- Vendor credits

⚠️ Note: File support is not yet available. Additional resources and tools will be added incrementally.

## 📬 Contact Us

Have questions, need help, or want to explore what Maesn can do for you? We're here to help.

### 🌐 Learn More
- Visit our website: [maesn.com](https://www.maesn.com)
- Explore the unified API: [Maesn API Documentation](https://docs.maesn.com)

### 🤝 Get in Touch
- 📧 Email: [contact@maesn.com](mailto:contact@maesn.com)
- 💬 Book a demo: [maesn.com/contact](https://www.maesn.com/contact?book_demo_source_page=%2F)
