import { GetBucketAclCommand, GetBucketAclCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketAclInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketAclTool = createS3Tool<GetBucketAclInput, GetBucketAclCommandInput>({
  name: 'GetBucketAcl',
  required: ['bucket'],
  commandCtor: GetBucketAclCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
