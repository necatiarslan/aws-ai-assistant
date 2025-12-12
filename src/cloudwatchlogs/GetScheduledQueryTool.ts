import { GetScheduledQueryCommand, GetScheduledQueryCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetScheduledQueryInput {
  name?: string;
  identifier?: string;
}

export const GetScheduledQueryTool = createCloudWatchLogsTool<
  GetScheduledQueryInput,
  GetScheduledQueryCommandInput
>({
  name: 'GetScheduledQuery',
  required: [],
  commandCtor: GetScheduledQueryCommand,
  buildInput: (input) => ({
    name: input.name,
    identifier: input.identifier,
  }),
});
