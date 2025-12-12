import { DescribeExportTasksCommand, DescribeExportTasksCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeExportTasksInput {
  taskId?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeExportTasksTool = createCloudWatchLogsTool<
  DescribeExportTasksInput,
  DescribeExportTasksCommandInput
>({
  name: 'DescribeExportTasks',
  commandCtor: DescribeExportTasksCommand,
  buildInput: (input) => ({
    taskId: input.taskId,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
