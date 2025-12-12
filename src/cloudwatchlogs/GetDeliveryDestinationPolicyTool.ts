import { GetDeliveryDestinationPolicyCommand, GetDeliveryDestinationPolicyCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetDeliveryDestinationPolicyInput {
  deliveryDestinationName: string;
}

export const GetDeliveryDestinationPolicyTool = createCloudWatchLogsTool<
  GetDeliveryDestinationPolicyInput,
  GetDeliveryDestinationPolicyCommandInput
>({
  name: 'GetDeliveryDestinationPolicy',
  required: ['deliveryDestinationName'],
  commandCtor: GetDeliveryDestinationPolicyCommand,
  buildInput: (input) => ({
    deliveryDestinationName: input.deliveryDestinationName,
  }),
});
