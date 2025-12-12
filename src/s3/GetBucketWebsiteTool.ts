import { GetBucketWebsiteCommand, GetBucketWebsiteCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketWebsiteInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketWebsiteTool = createS3Tool<
  GetBucketWebsiteInput,
  GetBucketWebsiteCommandInput
>({
  name: 'GetBucketWebsite',
  required: ['bucket'],
  commandCtor: GetBucketWebsiteCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
