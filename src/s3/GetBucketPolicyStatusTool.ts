import { GetBucketPolicyStatusCommand, GetBucketPolicyStatusCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketPolicyStatusInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketPolicyStatusTool = createS3Tool<
  GetBucketPolicyStatusInput,
  GetBucketPolicyStatusCommandInput
>({
  name: 'GetBucketPolicyStatus',
  required: ['bucket'],
  commandCtor: GetBucketPolicyStatusCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
