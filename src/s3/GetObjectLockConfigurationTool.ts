import { GetObjectLockConfigurationCommand, GetObjectLockConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectLockConfigurationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetObjectLockConfigurationTool = createS3Tool<
  GetObjectLockConfigurationInput,
  GetObjectLockConfigurationCommandInput
>({
  name: 'GetObjectLockConfiguration',
  required: ['bucket'],
  commandCtor: GetObjectLockConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
