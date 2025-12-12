import { GetBucketMetadataTableConfigurationCommand, GetBucketMetadataTableConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketMetadataTableConfigurationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketMetadataTableConfigurationTool = createS3Tool<
  GetBucketMetadataTableConfigurationInput,
  GetBucketMetadataTableConfigurationCommandInput
>({
  name: 'GetBucketMetadataTableConfiguration',
  required: ['bucket'],
  commandCtor: GetBucketMetadataTableConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
