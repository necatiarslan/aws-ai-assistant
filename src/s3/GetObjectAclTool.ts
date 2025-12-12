import { GetObjectAclCommand, GetObjectAclCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectAclInput {
  bucket: string;
  key: string;
  versionId?: string;
  requestPayer?: string;
  expectedBucketOwner?: string;
}

export const GetObjectAclTool = createS3Tool<
  GetObjectAclInput,
  GetObjectAclCommandInput
>({
  name: 'GetObjectAcl',
  required: ['bucket', 'key'],
  commandCtor: GetObjectAclCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    RequestPayer: input.requestPayer as any,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
