import { GetLogGroupFieldsCommand, GetLogGroupFieldsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetLogGroupFieldsInput {
  logGroupName: string;
  time?: number;
}

export const GetLogGroupFieldsTool = createCloudWatchLogsTool<
  GetLogGroupFieldsInput,
  GetLogGroupFieldsCommandInput
>({
  name: 'GetLogGroupFields',
  required: ['logGroupName'],
  commandCtor: GetLogGroupFieldsCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    time: input.time,
  }),
});
