import { GetBucketPolicyCommand, GetBucketPolicyCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketPolicyInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketPolicyTool = createS3Tool<
  GetBucketPolicyInput,
  GetBucketPolicyCommandInput
>({
  name: 'GetBucketPolicy',
  required: ['bucket'],
  commandCtor: GetBucketPolicyCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
