import { GetObjectAttributesCommand, GetObjectAttributesCommandInput, ObjectAttributes } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectAttributesInput {
  bucket: string;
  key: string;
  versionId?: string;
  maxParts?: number;
  partNumberMarker?: number;
  objectAttributes: ObjectAttributes[];
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const GetObjectAttributesTool = createS3Tool<
  GetObjectAttributesInput,
  GetObjectAttributesCommandInput
>({
  name: 'GetObjectAttributes',
  required: ['bucket', 'key', 'objectAttributes'],
  commandCtor: GetObjectAttributesCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    VersionId: input.versionId,
    MaxParts: input.maxParts,
    PartNumberMarker: input.partNumberMarker?.toString(),
    ObjectAttributes: input.objectAttributes,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
