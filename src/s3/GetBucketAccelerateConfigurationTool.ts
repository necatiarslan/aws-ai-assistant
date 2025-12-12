import { GetBucketAccelerateConfigurationCommand, GetBucketAccelerateConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketAccelerateConfigurationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketAccelerateConfigurationTool = createS3Tool<
  GetBucketAccelerateConfigurationInput,
  GetBucketAccelerateConfigurationCommandInput
>({
  name: 'GetBucketAccelerateConfiguration',
  required: ['bucket'],
  commandCtor: GetBucketAccelerateConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
