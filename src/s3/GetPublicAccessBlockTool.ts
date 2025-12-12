import { GetPublicAccessBlockCommand, GetPublicAccessBlockCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetPublicAccessBlockInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetPublicAccessBlockTool = createS3Tool<
  GetPublicAccessBlockInput,
  GetPublicAccessBlockCommandInput
>({
  name: 'GetPublicAccessBlock',
  required: ['bucket'],
  commandCtor: GetPublicAccessBlockCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
