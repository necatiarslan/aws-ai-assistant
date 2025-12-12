import { DescribeConfigurationTemplatesCommand, DescribeConfigurationTemplatesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeConfigurationTemplatesInput {
  configurationTemplateName?: string;
  nextToken?: string;
}

export const DescribeConfigurationTemplatesTool = createCloudWatchLogsTool<
  DescribeConfigurationTemplatesInput,
  DescribeConfigurationTemplatesCommandInput
>({
  name: 'DescribeConfigurationTemplates',
  commandCtor: DescribeConfigurationTemplatesCommand,
  buildInput: (input) => ({
    configurationTemplateName: input.configurationTemplateName,
    nextToken: input.nextToken,
  }),
});
