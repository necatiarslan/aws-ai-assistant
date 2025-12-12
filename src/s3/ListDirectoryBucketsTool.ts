import { ListDirectoryBucketsCommand, ListDirectoryBucketsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListDirectoryBucketsInput {
  maxDirectoryBuckets?: number;
  nextToken?: string;
}

export const ListDirectoryBucketsTool = createS3Tool<
  ListDirectoryBucketsInput,
  ListDirectoryBucketsCommandInput
>({
  name: 'ListDirectoryBuckets',
  commandCtor: ListDirectoryBucketsCommand,
  buildInput: (input) => ({
    MaxDirectoryBuckets: input.maxDirectoryBuckets,
    NextToken: input.nextToken,
  }),
});
