import { GetBucketLifecycleConfigurationCommand, GetBucketLifecycleConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketLifecycleConfigurationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketLifecycleConfigurationTool = createS3Tool<
  GetBucketLifecycleConfigurationInput,
  GetBucketLifecycleConfigurationCommandInput
>({
  name: 'GetBucketLifecycleConfiguration',
  required: ['bucket'],
  commandCtor: GetBucketLifecycleConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
