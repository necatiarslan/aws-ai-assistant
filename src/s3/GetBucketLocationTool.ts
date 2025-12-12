import { GetBucketLocationCommand, GetBucketLocationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketLocationInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketLocationTool = createS3Tool<
  GetBucketLocationInput,
  GetBucketLocationCommandInput
>({
  name: 'GetBucketLocation',
  required: ['bucket'],
  commandCtor: GetBucketLocationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
