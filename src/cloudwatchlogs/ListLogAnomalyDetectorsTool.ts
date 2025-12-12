import { ListLogAnomalyDetectorsCommand, ListLogAnomalyDetectorsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListLogAnomalyDetectorsInput {
  filter?: string;
  maxResults?: number;
  nextToken?: string;
}

export const ListLogAnomalyDetectorsTool = createCloudWatchLogsTool<
  ListLogAnomalyDetectorsInput,
  ListLogAnomalyDetectorsCommandInput
>({
  name: 'ListLogAnomalyDetectors',
  required: [],
  commandCtor: ListLogAnomalyDetectorsCommand,
  buildInput: (input) => ({
    filter: input.filter,
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
