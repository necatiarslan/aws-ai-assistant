import { GetLogAnomalyDetectorCommand, GetLogAnomalyDetectorCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetLogAnomalyDetectorInput {
  anomalyDetectorArn: string;
}

export const GetLogAnomalyDetectorTool = createCloudWatchLogsTool<
  GetLogAnomalyDetectorInput,
  GetLogAnomalyDetectorCommandInput
>({
  name: 'GetLogAnomalyDetector',
  required: ['anomalyDetectorArn'],
  commandCtor: GetLogAnomalyDetectorCommand,
  buildInput: (input) => ({
    anomalyDetectorArn: input.anomalyDetectorArn,
  }),
});
