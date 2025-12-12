import { DescribeDeliveriesCommand, DescribeDeliveriesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeDeliveriesInput {
  deliveryId?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeDeliveriesTool = createCloudWatchLogsTool<
  DescribeDeliveriesInput,
  DescribeDeliveriesCommandInput
>({
  name: 'DescribeDeliveries',
  commandCtor: DescribeDeliveriesCommand,
  buildInput: (input) => ({
    deliveryId: input.deliveryId,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
