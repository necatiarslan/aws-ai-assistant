import { GetDeliveryCommand, GetDeliveryCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetDeliveryInput {
  id: string;
}

export const GetDeliveryTool = createCloudWatchLogsTool<
  GetDeliveryInput,
  GetDeliveryCommandInput
>({
  name: 'GetDelivery',
  required: ['id'],
  commandCtor: GetDeliveryCommand,
  buildInput: (input) => ({
    id: input.id,
  }),
});
