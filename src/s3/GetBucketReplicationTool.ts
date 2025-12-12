import { GetBucketReplicationCommand, GetBucketReplicationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketReplicationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketReplicationTool = createS3Tool<
  GetBucketReplicationInput,
  GetBucketReplicationCommandInput
>({
  name: 'GetBucketReplication',
  required: ['bucket'],
  commandCtor: GetBucketReplicationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
