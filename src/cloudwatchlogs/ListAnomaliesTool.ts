import { ListAnomaliesCommand, ListAnomaliesCommandInput, SuppressionState } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListAnomaliesInput {
  anomalyDetectorArn: string;
  limit?: number;
  nextToken?: string;
  suppressionState?: SuppressionState;
}

export const ListAnomaliesTool = createCloudWatchLogsTool<
  ListAnomaliesInput,
  ListAnomaliesCommandInput
>({
  name: 'ListAnomalies',
  required: ['anomalyDetectorArn'],
  commandCtor: ListAnomaliesCommand,
  buildInput: (input) => ({
    anomalyDetectorArn: input.anomalyDetectorArn,
    limit: input.limit,
    nextToken: input.nextToken,
    suppressionState: input.suppressionState,
  }),
});
