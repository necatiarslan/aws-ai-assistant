import { GetDeliverySourceCommand, GetDeliverySourceCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetDeliverySourceInput {
  name: string;
}

export const GetDeliverySourceTool = createCloudWatchLogsTool<
  GetDeliverySourceInput,
  GetDeliverySourceCommandInput
>({
  name: 'GetDeliverySource',
  required: ['name'],
  commandCtor: GetDeliverySourceCommand,
  buildInput: (input) => ({
    name: input.name,
  }),
});
