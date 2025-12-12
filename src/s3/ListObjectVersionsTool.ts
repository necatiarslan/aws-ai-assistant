import { ListObjectVersionsCommand, ListObjectVersionsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListObjectVersionsInput {
  bucket: string;
  prefix?: string;
  delimiter?: string;
  keyMarker?: string;
  maxKeys?: number;
  versionIdMarker?: string;
  expectedBucketOwner?: string;
  encodingType?: 'url';
}

export const ListObjectVersionsTool = createS3Tool<
  ListObjectVersionsInput,
  ListObjectVersionsCommandInput
>({
  name: 'ListObjectVersions',
  required: ['bucket'],
  commandCtor: ListObjectVersionsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Prefix: input.prefix,
    Delimiter: input.delimiter,
    KeyMarker: input.keyMarker,
    MaxKeys: input.maxKeys,
    VersionIdMarker: input.versionIdMarker,
    ExpectedBucketOwner: input.expectedBucketOwner,
    EncodingType: input.encodingType,
  }),
});
