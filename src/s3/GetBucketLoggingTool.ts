import { GetBucketLoggingCommand, GetBucketLoggingCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketLoggingInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketLoggingTool = createS3Tool<
  GetBucketLoggingInput,
  GetBucketLoggingCommandInput
>({
  name: 'GetBucketLogging',
  required: ['bucket'],
  commandCtor: GetBucketLoggingCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
