# Model Context Protocol (MCP) Server Guide

The MCP server in this repository allows external tools, AI agents (like Antigravity), or other VS Code instances to leverage the AWS AI capabilities built into the **Goggles: AWS AI Assistant** extension.

---

## 1. Prerequisites

*   **Extensions**: [Goggles: AWS AI Assistant](https://marketplace.visualstudio.com/items?itemName=NecatiARSLAN.aws-ai-assistant) installed and active in VS Code.
*   **AWS Setup**: Credentials configured locally (via `~/.aws/credentials`) or active in the current shell environment.
*   **Runtime**: [Node.js](https://nodejs.org/) installed on your machine.

---

## 2. Enabling and Starting the Server

### Step 1: Enable in Settings
1.  Open VS Code Settings (`Cmd+,`).
2.  Search for `Goggles: MCP`.
3.  Ensure **Enabled** is checked.
4.  *(Optional)* Adjust the **Session Cap** (default is 3 concurrent sessions).

### Step 2: Start the Server
1.  Open the Command Palette (`Cmd+Shift+P`).
2.  Run the command: `Goggles: Start MCP Server`.
3.  A new VS Code terminal labeled `MCP 1` will appear.
4.  The extension will start a TCP bridge listening on `127.0.0.1:37114`.

---

## 3. Connecting External Clients

The MCP bridge acts as a TCP gateway. You can interact with it via the provided CLI tool or direct TCP connection.

### Using the CLI (Recommended)
The CLI tool handles the TCP communication and provides a standard `stdio` interface for MCP clients.

```bash
# From the root of this repository
node ./out/mcp/cli.js
```

### Direct TCP Connection
For custom integrations, connect via TCP to:
*   **Host**: `127.0.0.1`
*   **Port**: `37114`

---

## 4. Supported Protocol

This server is compliant with **JSON-RPC 2.0** and the **Model Context Protocol (MCP)** specification.

### Standard MCP Methods

#### `tools/list`
Returns a list of all enabled AWS service tools with their JSON schemas.
**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

#### `tools/call`
Executes an AWS command.
**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "S3Tool",
    "arguments": {
      "command": "ListBuckets",
      "params": {}
    }
  }
}
```

### Legacy Aliases
For backward compatibility, the server also supports:
*   `list_tools` (Alias for `tools/list`)
*   `call_tool` (Alias for `tools/call`)

---

## 5. Configuration (Environment Variables)

Override the bridge settings by defining these variables before starting VS Code or in your shell:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `AWS_AI_ASSISTANT_MCP_PORT` | `37114` | TCP port for the bridge server |
| `AWS_AI_ASSISTANT_MCP_HOST` | `127.0.0.1` | Network host for the bridge server |

---

## 6. Security and Manual Confirmations

To prevent accidental destructive actions, certain AWS commands (e.g., `DeleteBucket`, `TerminateInstances`) require **manual confirmation** within the VS Code UI.

If a client sends a destructive command:
1.  The MCP request will hang temporarily.
2.  A notification will appear in VS Code asking you to **Proceed** or **Cancel**.
3.  The MCP response will be returned only after you interact with the UI.

---

## 7. Client Configuration (Example: Antigravity)

To use this server with an MCP-compatible client like Antigravity, add this to your `mcp_config.json`:

```json
{
  "mcpServers": {
    "aws-ai-assistant": {
      "command": "node",
      "args": [
        "/Users/necatiarslan/github/aws-ai-assistant/out/mcp/cli.js"
      ],
      "env": {
        "AWS_AI_ASSISTANT_MCP_PORT": "37114",
        "AWS_AI_ASSISTANT_MCP_HOST": "127.0.0.1"
      }
    }
  }
}
```

> **Note**: Ensure the absolute path to `cli.js` is correct for your local machine. The VS Code extension must be running for the bridge to accept connections.