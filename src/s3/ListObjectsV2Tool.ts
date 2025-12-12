import { ListObjectsV2Command, ListObjectsV2CommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListObjectsV2Input {
  bucket: string;
  prefix?: string;
  continuationToken?: string;
  delimiter?: string;
  fetchOwner?: boolean;
  startAfter?: string;
  maxKeys?: number;
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const ListObjectsV2Tool = createS3Tool<
  ListObjectsV2Input,
  ListObjectsV2CommandInput
>({
  name: 'ListObjectsV2',
  required: ['bucket'],
  commandCtor: ListObjectsV2Command,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Prefix: input.prefix,
    ContinuationToken: input.continuationToken,
    Delimiter: input.delimiter,
    FetchOwner: input.fetchOwner,
    StartAfter: input.startAfter,
    MaxKeys: input.maxKeys,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
