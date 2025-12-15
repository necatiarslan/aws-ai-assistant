# Nebula: AWS AI Assistant

Nebula AWS AI Assistant is a Visual Studio Code extension that lets you manage AWS resources through the VS Code chat experience. It exposes a set of AWS-aware language model tools (S3, SQS, EC2, Lambda, STS, CloudWatch Logs, CloudFormation, RDS, DynamoDB, IAM, Step Functions, Glue, API Gateway, and more) so you can ask natural-language questions and have actions executed on your behalf with your AWS credentials.

## What you can do
- Ask "@aws" in the chat to inspect or operate AWS services using built-in tools.
- Switch profiles/regions/endpoints and reuse your local AWS CLI credentials.
- Test connectivity (STS GetCallerIdentity) before running commands.
- Browse CloudWatch Logs, call Lambda functions, interact with SQS/SNS, list and inspect EC2 resources, manage S3 objects, and query RDS/DynamoDB with guided prompts.
- Use VS Code commands and a status bar item to change AWS context quickly.

## Prerequisites
- VS Code 1.104.0 or later with the VS Code chat / language model features enabled.
- Node.js LTS for local development.
- AWS credentials available via the standard provider chain (e.g., ~/.aws/credentials, ~/.aws/config, environment variables, or AWS SSO). The extension uses the selected profile to call AWS SDK v3 clients.

## Installation
1) Install the extension from the VS Code Marketplace (or load the packaged .vsix).
2) Reload VS Code.
3) Ensure you have access to the chat experience in VS Code.

## Quick start
1) Set profile/region: Use the status bar AWS selector or run "Aws AI Assistant: Set AWS Profile" / "Aws AI Assistant: Set Default Region" from the Command Palette.
2) Test connectivity: Run "Aws AI Assistant: Test AWS Connectivity" to verify STS access.
3) Open chat: Open Chat (@aws) and ask for an action, for example:
   - List my S3 buckets
   - Tail the latest CloudWatch log events for /aws/lambda/my-fn
   - Describe EC2 instances in us-west-2
   - Publish a message to my SNS topic
4) The assistant will call the appropriate tool, stream results, and may suggest follow-up actions.

## Available tools (high level)
- Session & STS: manage profile/region/endpoint, refresh credentials, GetCallerIdentity, session tokens.
- S3: list buckets/objects, get/put/delete objects, presigned URLs.
- SQS & SNS: list queues/topics, send/receive/delete messages, get queue URLs.
- EC2: describe instances, images, VPCs, security groups, console output.
- Lambda & Step Functions: invoke functions, list state machines and executions.
- CloudWatch Logs: search and retrieve log events.
- CloudFormation: list stacks, describe stack resources and events.
- RDS & RDS Data: list DB instances/clusters; run SQL via RDS Data API.
- DynamoDB: list tables, describe tables, scan/query items.
- IAM & STS helpers: identity and credential utilities.
- API Gateway, Glue, S3-compatible endpoint support, and file operations for local workspace context.

## Commands
- Aws AI Assistant: Set AWS Endpoint
- Aws AI Assistant: Set Default Region
- Aws AI Assistant: Refresh Credentials
- Aws AI Assistant: List AWS Profiles
- Aws AI Assistant: Set AWS Profile
- Aws AI Assistant: Test AWS Connectivity

## Authentication & security
- Credentials are resolved via the AWS SDK provider chain; the selected profile is stored in VS Code global state and reapplied across sessions.
- No credentials are persisted outside VS Code global state; you can refresh or clear cached credentials from the Command Palette.
- The assistant invokes AWS APIs using your permissions. Use least-privilege IAM policies and verify the active profile before running mutating actions.

## Development (clone of this repo)
1) npm install
2) npm run watch (or use the built-in npm: watch task) to build on save.
3) Press F5 to launch the extension host for testing.

## Troubleshooting
- Ensure chat is available in your VS Code build; the extension relies on vscode.lm APIs.
- If tool calls fail, re-run "Test AWS Connectivity" and verify the active profile/region.
- Use "Aws AI Assistant: Refresh Credentials" after changing AWS SSO sessions or temporary credentials.

## Links
- Issues & feature requests: https://github.com/necatiarslan/aws-ai-assistant/issues
- Sponsor: https://github.com/sponsors/necatiarslan
- License: MIT
