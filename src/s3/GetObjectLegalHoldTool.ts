import { GetObjectLegalHoldCommand, GetObjectLegalHoldCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectLegalHoldInput {
  bucket: string;
  key: string;
  versionId?: string;
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const GetObjectLegalHoldTool = createS3Tool<
  GetObjectLegalHoldInput,
  GetObjectLegalHoldCommandInput
>({
  name: 'GetObjectLegalHold',
  required: ['bucket', 'key'],
  commandCtor: GetObjectLegalHoldCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
