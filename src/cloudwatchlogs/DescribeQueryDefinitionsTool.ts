import { DescribeQueryDefinitionsCommand, DescribeQueryDefinitionsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeQueryDefinitionsInput {
  queryDefinitionNamePrefix?: string;
  maxResults?: number;
  nextToken?: string;
}

export const DescribeQueryDefinitionsTool = createCloudWatchLogsTool<
  DescribeQueryDefinitionsInput,
  DescribeQueryDefinitionsCommandInput
>({
  name: 'DescribeQueryDefinitions',
  commandCtor: DescribeQueryDefinitionsCommand,
  buildInput: (input) => ({
    queryDefinitionNamePrefix: input.queryDefinitionNamePrefix,
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
