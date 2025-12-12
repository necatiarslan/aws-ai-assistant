import { GetBucketCorsCommand, GetBucketCorsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketCorsInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketCorsTool = createS3Tool<GetBucketCorsInput, GetBucketCorsCommandInput>({
  name: 'GetBucketCors',
  required: ['bucket'],
  commandCtor: GetBucketCorsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
