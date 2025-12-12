import { GetObjectTaggingCommand, GetObjectTaggingCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectTaggingInput {
  bucket: string;
  key: string;
  versionId?: string;
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const GetObjectTaggingTool = createS3Tool<
  GetObjectTaggingInput,
  GetObjectTaggingCommandInput
>({
  name: 'GetObjectTagging',
  required: ['bucket', 'key'],
  commandCtor: GetObjectTaggingCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
