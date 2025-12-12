import { DescribeDeliverySourcesCommand, DescribeDeliverySourcesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeDeliverySourcesInput {
  deliverySourceName?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeDeliverySourcesTool = createCloudWatchLogsTool<
  DescribeDeliverySourcesInput,
  DescribeDeliverySourcesCommandInput
>({
  name: 'DescribeDeliverySources',
  commandCtor: DescribeDeliverySourcesCommand,
  buildInput: (input) => ({
    deliverySourceName: input.deliverySourceName,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
