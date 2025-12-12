import { GetBucketInventoryConfigurationCommand, GetBucketInventoryConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketInventoryConfigurationInput {
  bucket: string;
  id: string;
  expectedBucketOwner?: string;
}

export const GetBucketInventoryConfigurationTool = createS3Tool<
  GetBucketInventoryConfigurationInput,
  GetBucketInventoryConfigurationCommandInput
>({
  name: 'GetBucketInventoryConfiguration',
  required: ['bucket', 'id'],
  commandCtor: GetBucketInventoryConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Id: input.id,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
