import { HeadObjectCommand, HeadObjectCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface HeadObjectInput {
  bucket: string;
  key: string;
  versionId?: string;
  partNumber?: number;
  requestPayer?: string;
  expectedBucketOwner?: string;
  ifMatch?: string;
  ifModifiedSince?: Date;
  ifNoneMatch?: string;
  ifUnmodifiedSince?: Date;
}

export const HeadObjectTool = createS3Tool<
  HeadObjectInput,
  HeadObjectCommandInput
>({
  name: 'HeadObject',
  required: ['bucket', 'key'],
  commandCtor: HeadObjectCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    PartNumber: input.partNumber,
    RequestPayer: input.requestPayer as any,
    ExpectedBucketOwner: input.expectedBucketOwner,
    IfMatch: input.ifMatch,
    IfModifiedSince: input.ifModifiedSince,
    IfNoneMatch: input.ifNoneMatch,
    IfUnmodifiedSince: input.ifUnmodifiedSince,
  }),
});
