import { GetBucketNotificationConfigurationCommand, GetBucketNotificationConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketNotificationConfigurationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketNotificationConfigurationTool = createS3Tool<
  GetBucketNotificationConfigurationInput,
  GetBucketNotificationConfigurationCommandInput
>({
  name: 'GetBucketNotificationConfiguration',
  required: ['bucket'],
  commandCtor: GetBucketNotificationConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
