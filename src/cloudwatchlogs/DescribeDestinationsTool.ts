import { DescribeDestinationsCommand, DescribeDestinationsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeDestinationsInput {
  destinationNamePrefix?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeDestinationsTool = createCloudWatchLogsTool<
  DescribeDestinationsInput,
  DescribeDestinationsCommandInput
>({
  name: 'DescribeDestinations',
  commandCtor: DescribeDestinationsCommand,
  buildInput: (input) => ({
    DestinationNamePrefix: input.destinationNamePrefix,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
