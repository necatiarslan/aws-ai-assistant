import { ListTagsForResourceCommand, ListTagsForResourceCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListTagsForResourceInput {
  resourceArn: string;
}

export const ListTagsForResourceTool = createCloudWatchLogsTool<
  ListTagsForResourceInput,
  ListTagsForResourceCommandInput
>({
  name: 'ListTagsForResource',
  required: ['resourceArn'],
  commandCtor: ListTagsForResourceCommand,
  buildInput: (input) => ({
    resourceArn: input.resourceArn,
  }),
});
