import { GetTransformerCommand, GetTransformerCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetTransformerInput {
  logGroupName?: string;
  logGroupIdentifier?: string;
  transformerName: string;
}

export const GetTransformerTool = createCloudWatchLogsTool<
  GetTransformerInput,
  GetTransformerCommandInput
>({
  name: 'GetTransformer',
  required: ['transformerName'],
  commandCtor: GetTransformerCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logGroupIdentifier: input.logGroupIdentifier,
    transformerName: input.transformerName,
  }),
});
