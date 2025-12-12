import { HeadBucketCommand, HeadBucketCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface HeadBucketInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const HeadBucketTool = createS3Tool<
  HeadBucketInput,
  HeadBucketCommandInput
>({
  name: 'HeadBucket',
  required: ['bucket'],
  commandCtor: HeadBucketCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
