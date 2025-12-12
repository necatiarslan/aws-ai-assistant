import { GetBucketVersioningCommand, GetBucketVersioningCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketVersioningInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketVersioningTool = createS3Tool<
  GetBucketVersioningInput,
  GetBucketVersioningCommandInput
>({
  name: 'GetBucketVersioning',
  required: ['bucket'],
  commandCtor: GetBucketVersioningCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
