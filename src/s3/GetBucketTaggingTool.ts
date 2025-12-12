import { GetBucketTaggingCommand, GetBucketTaggingCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketTaggingInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketTaggingTool = createS3Tool<
  GetBucketTaggingInput,
  GetBucketTaggingCommandInput
>({
  name: 'GetBucketTagging',
  required: ['bucket'],
  commandCtor: GetBucketTaggingCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
