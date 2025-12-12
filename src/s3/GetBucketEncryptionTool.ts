import { GetBucketEncryptionCommand, GetBucketEncryptionCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketEncryptionInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketEncryptionTool = createS3Tool<
  GetBucketEncryptionInput,
  GetBucketEncryptionCommandInput
>({
  name: 'GetBucketEncryption',
  required: ['bucket'],
  commandCtor: GetBucketEncryptionCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
