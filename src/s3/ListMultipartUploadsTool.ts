import { ListMultipartUploadsCommand, ListMultipartUploadsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListMultipartUploadsInput {
  bucket: string;
  delimiter?: string;
  encodingType?: 'url';
  keyMarker?: string;
  maxUploads?: number;
  prefix?: string;
  uploadIdMarker?: string;
  expectedBucketOwner?: string;
  requestPayer?: string;
}

export const ListMultipartUploadsTool = createS3Tool<
  ListMultipartUploadsInput,
  ListMultipartUploadsCommandInput
>({
  name: 'ListMultipartUploads',
  required: ['bucket'],
  commandCtor: ListMultipartUploadsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Delimiter: input.delimiter,
    EncodingType: input.encodingType,
    KeyMarker: input.keyMarker,
    MaxUploads: input.maxUploads,
    Prefix: input.prefix,
    UploadIdMarker: input.uploadIdMarker,
    ExpectedBucketOwner: input.expectedBucketOwner,
    RequestPayer: input.requestPayer as any,
  }),
});
