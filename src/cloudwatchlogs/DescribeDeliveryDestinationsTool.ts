import { DescribeDeliveryDestinationsCommand, DescribeDeliveryDestinationsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeDeliveryDestinationsInput {
  deliveryDestinationName?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeDeliveryDestinationsTool = createCloudWatchLogsTool<
  DescribeDeliveryDestinationsInput,
  DescribeDeliveryDestinationsCommandInput
>({
  name: 'DescribeDeliveryDestinations',
  commandCtor: DescribeDeliveryDestinationsCommand,
  buildInput: (input) => ({
    deliveryDestinationName: input.deliveryDestinationName,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
