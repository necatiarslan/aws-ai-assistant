import { GetLogRecordCommand, GetLogRecordCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetLogRecordInput {
  logRecordPointer: string;
  unmask?: boolean;
}

export const GetLogRecordTool = createCloudWatchLogsTool<
  GetLogRecordInput,
  GetLogRecordCommandInput
>({
  name: 'GetLogRecord',
  required: ['logRecordPointer'],
  commandCtor: GetLogRecordCommand,
  buildInput: (input) => ({
    logRecordPointer: input.logRecordPointer,
    unmask: input.unmask,
  }),
});
