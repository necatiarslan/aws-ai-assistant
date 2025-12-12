import { GetBucketOwnershipControlsCommand, GetBucketOwnershipControlsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketOwnershipControlsInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketOwnershipControlsTool = createS3Tool<
  GetBucketOwnershipControlsInput,
  GetBucketOwnershipControlsCommandInput
>({
  name: 'GetBucketOwnershipControls',
  required: ['bucket'],
  commandCtor: GetBucketOwnershipControlsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
