import { ListPartsCommand, ListPartsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListPartsInput {
  bucket: string;
  key: string;
  uploadId: string;
  maxParts?: number;
  partNumberMarker?: number;
  requestPayer?: string;
  expectedBucketOwner?: string;
  sseCustomerAlgorithm?: string;
  sseCustomerKey?: string;
  sseCustomerKeyMD5?: string;
}

export const ListPartsTool = createS3Tool<
  ListPartsInput,
  ListPartsCommandInput
>({
  name: 'ListParts',
  required: ['bucket', 'key', 'uploadId'],
  commandCtor: ListPartsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Key: input.key,
    UploadId: input.uploadId,
    MaxParts: input.maxParts,
    PartNumberMarker: input.partNumberMarker?.toString(),
    RequestPayer: input.requestPayer as any,
    ExpectedBucketOwner: input.expectedBucketOwner,
    SSECustomerAlgorithm: input.sseCustomerAlgorithm,
    SSECustomerKey: input.sseCustomerKey,
    SSECustomerKeyMD5: input.sseCustomerKeyMD5,
  }),
});
