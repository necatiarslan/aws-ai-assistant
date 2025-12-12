import { GetBucketRequestPaymentCommand, GetBucketRequestPaymentCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketRequestPaymentInput {
  bucket: string;
  expectedBucketOwner?: string;
}

export const GetBucketRequestPaymentTool = createS3Tool<
  GetBucketRequestPaymentInput,
  GetBucketRequestPaymentCommandInput
>({
  name: 'GetBucketRequestPayment',
  required: ['bucket'],
  commandCtor: GetBucketRequestPaymentCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
