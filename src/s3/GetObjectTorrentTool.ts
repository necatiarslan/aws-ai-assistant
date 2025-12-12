import { GetObjectTorrentCommand, GetObjectTorrentCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetObjectTorrentInput {
  bucket: string;
  key: string;
  requestPayer?: string;
  expectedBucketOwner?: string;
}

export const GetObjectTorrentTool = createS3Tool<
  GetObjectTorrentInput,
  GetObjectTorrentCommandInput
>({
  name: 'GetObjectTorrent',
  required: ['bucket', 'key'],
  commandCtor: GetObjectTorrentCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    RequestPayer: input.requestPayer as any,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
