import { FilterLogEventsCommand, FilterLogEventsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface FilterLogEventsInput {
  logGroupName: string;
  logStreamNames?: string[];
  logStreamNamePrefix?: string;
  startTime?: number;
  endTime?: number;
  filterPattern?: string;
  nextToken?: string;
  limit?: number;
  interleaved?: boolean;
}

export const FilterLogEventsTool = createCloudWatchLogsTool<
  FilterLogEventsInput,
  FilterLogEventsCommandInput
>({
  name: 'FilterLogEvents',
  required: ['logGroupName'],
  commandCtor: FilterLogEventsCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logStreamNames: input.logStreamNames,
    logStreamNamePrefix: input.logStreamNamePrefix,
    startTime: input.startTime,
    endTime: input.endTime,
    filterPattern: input.filterPattern,
    nextToken: input.nextToken,
    limit: input.limit,
    interleaved: input.interleaved,
  }),
});
