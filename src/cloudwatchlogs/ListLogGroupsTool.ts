import { ListLogGroupsCommand, ListLogGroupsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListLogGroupsInput {
  accountIdentifiers?: string[];
  includeLinkedAccounts?: boolean;
  limit?: number;
  logGroupNameFilter?: string;
  logGroupNamePrefix?: string;
  nextToken?: string;
}

export const ListLogGroupsTool = createCloudWatchLogsTool<
  ListLogGroupsInput,
  ListLogGroupsCommandInput
>({
  name: 'ListLogGroups',
  required: [],
  commandCtor: ListLogGroupsCommand,
  buildInput: (input) => ({
    accountIdentifiers: input.accountIdentifiers,
    includeLinkedAccounts: input.includeLinkedAccounts,
    limit: input.limit,
    logGroupNameFilter: input.logGroupNameFilter,
    logGroupNamePrefix: input.logGroupNamePrefix,
    nextToken: input.nextToken,
  }),
});
