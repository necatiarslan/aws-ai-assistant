import { GetDataProtectionPolicyCommand, GetDataProtectionPolicyCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetDataProtectionPolicyInput {
  logGroupName?: string;
  logGroupIdentifier?: string;
}

export const GetDataProtectionPolicyTool = createCloudWatchLogsTool<
  GetDataProtectionPolicyInput,
  GetDataProtectionPolicyCommandInput
>({
  name: 'GetDataProtectionPolicy',
  required: ['logGroupName'],
  commandCtor: GetDataProtectionPolicyCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logGroupIdentifier: input.logGroupIdentifier,
  }),
});
