import { GetQueryResultsCommand, GetQueryResultsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetQueryResultsInput {
  queryId: string;
}

export const GetQueryResultsTool = createCloudWatchLogsTool<
  GetQueryResultsInput,
  GetQueryResultsCommandInput
>({
  name: 'GetQueryResults',
  required: ['queryId'],
  commandCtor: GetQueryResultsCommand,
  buildInput: (input) => ({
    queryId: input.queryId,
  }),
});
