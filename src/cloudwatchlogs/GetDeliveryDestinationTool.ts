import { GetDeliveryDestinationCommand, GetDeliveryDestinationCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetDeliveryDestinationInput {
  name: string;
}

export const GetDeliveryDestinationTool = createCloudWatchLogsTool<
  GetDeliveryDestinationInput,
  GetDeliveryDestinationCommandInput
>({
  name: 'GetDeliveryDestination',
  required: ['name'],
  commandCtor: GetDeliveryDestinationCommand,
  buildInput: (input) => ({
    name: input.name,
  }),
});
