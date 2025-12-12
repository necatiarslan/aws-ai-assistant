import { GetObjectRetentionCommand, GetObjectRetentionCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectRetentionInput {
  bucket: string;
  key: string;
  versionId?: string;
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const GetObjectRetentionTool = createS3Tool<
  GetObjectRetentionInput,
  GetObjectRetentionCommandInput
>({
  name: 'GetObjectRetention',
  required: ['bucket', 'key'],
  commandCtor: GetObjectRetentionCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
