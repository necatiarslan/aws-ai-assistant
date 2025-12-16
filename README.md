# Nebula: AWS AI Assistant
AWS Monitoring Management in Your Chat Experience

Now VsCode Copilot can talk to AWS on your behalf!

![screenshoot](media/extension/extension-icon.png)

Nebula is a Visual Studio Code extension that brings AWS management into your chat experience. Use natural language to inspect and operate AWS resources with your existing credentials. The extension exposes AWS-aware tools that execute actions directly on your behalf.

## 🔑 Supported AWS Services
- S3
- SQS
- SNS
- EC2
- Lambda
- Step Functions
- CloudWatch Logs
- CloudFormation
- RDS
- DynamoDB
- IAM
- STS
- Glue
- API Gateway

## 🤖 Available Tools
- **Session & STS**: manage profile/region/endpoint, refresh credentials, GetCallerIdentity, session tokens.
- **S3**: list buckets/objects, get/put/delete objects.
- **SQS & SNS**: list queues/topics, send/receive/delete messages, get queue URLs.
- **EC2**: describe instances, images, VPCs, security groups, console output.
- **Lambda & Step Functions**: invoke functions, list state machines and executions.
- **CloudWatch Logs**: search and retrieve log events.
- **CloudFormation**: list stacks, describe stack resources and events.
- **RDS & RDS Data**: list DB instances/clusters; run SQL via RDS Data API.
- **DynamoDB**: list tables, describe tables, scan/query items.
- **IAM & STS**: identity and credential utilities.
- **API Gateway, Glue**: service management and S3-compatible endpoint support.
- **File Operations**: work with local workspace context.

## What You Can Do

- Ask "@aws" in the chat to inspect or operate AWS services using built-in tools.
- Switch profiles, regions, and endpoints using your local AWS CLI credentials.
- Test connectivity via STS GetCallerIdentity before running commands.
- Browse CloudWatch Logs, invoke Lambda functions, interact with SQS/SNS, manage EC2 resources, work with S3 objects, and query RDS/DynamoDB with guided prompts.
- Use VS Code commands and the status bar to change AWS context quickly.

## Screenshots

| | | |
|---|---|---|
| ![Screenshot 1](media/readme/1.png) | ![Screenshot 2](media/readme/2.png) | ![Screenshot 3](media/readme/3.png) |
| ![Screenshot 4](media/readme/4.png) | ![Screenshot 5](media/readme/5.png) | ![Screenshot 6](media/readme/6.png) |
| ![Screenshot 7](media/readme/7.png) | ![Screenshot 8](media/readme/8.png) | ![Screenshot 9](media/readme/9.png) |
| ![Screenshot 10](media/readme/10.png) | ![Screenshot 11](media/readme/11.png) | ![Screenshot 12](media/readme/12.png) |
| ![Screenshot 13](media/readme/13.png) | ![Screenshot 14](media/readme/14.png) | ![Screenshot 15](media/readme/15.png) |


## ⚙️ Prerequisites

- AWS credentials configured locally (via AWS CLI config, SSO, environment variables, or other supported methods).

## Quick Start

1. **Set profile/region**: Use the status bar AWS selector or run "Nebula: Set AWS Profile" / "Nebula: Set Default Region" from the Command Palette.
2. **Test connectivity**: Run "Nebula: Test AWS Connectivity" to verify STS access.
3. **Open Chat**: Open Chat (@aws) and ask a question, for example:
   - List my S3 buckets
   - Tail the latest CloudWatch log events for /aws/lambda/my-fn
   - Describe EC2 instances in us-west-2
   - Publish a message to my SNS topic
4. **Review results**: The assistant will call the appropriate tool, stream results, and suggest follow-up actions.

## Authentication & Security

- **Credentials**: Resolved via the AWS SDK provider chain. The selected profile is stored in VS Code global state and reapplied across sessions.
- **Privacy**: No credentials are persisted outside VS Code global state. You can refresh or clear cached credentials from the Command Palette.
- **Permissions**: The assistant invokes AWS APIs using your account permissions. Use least-privilege IAM policies and verify the active profile before running mutating actions.


## 💖 Links

- **Issues & Feature Requests**: https://github.com/necatiarslan/aws-ai-assistant/issues
- **Sponsor**: https://github.com/sponsors/necatiarslan
- **License**: MIT
