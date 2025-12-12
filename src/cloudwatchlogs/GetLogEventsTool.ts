import { GetLogEventsCommand, GetLogEventsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetLogEventsInput {
  logGroupName: string;
  logStreamName: string;
  startTime?: number;
  endTime?: number;
  nextToken?: string;
  limit?: number;
  startFromHead?: boolean;
  unmask?: boolean;
}

export const GetLogEventsTool = createCloudWatchLogsTool<
  GetLogEventsInput,
  GetLogEventsCommandInput
>({
  name: 'GetLogEvents',
  required: ['logGroupName', 'logStreamName'],
  commandCtor: GetLogEventsCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logStreamName: input.logStreamName,
    startTime: input.startTime,
    endTime: input.endTime,
    nextToken: input.nextToken,
    limit: input.limit,
    startFromHead: input.startFromHead,
    unmask: input.unmask,
  }),
});
