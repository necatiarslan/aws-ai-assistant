import { ListBucketInventoryConfigurationsCommand, ListBucketInventoryConfigurationsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListBucketInventoryConfigurationsInput {
  bucket: string;
  continuationToken?: string;
  expectedBucketOwner?: string;
}

export const ListBucketInventoryConfigurationsTool = createS3Tool<
  ListBucketInventoryConfigurationsInput,
  ListBucketInventoryConfigurationsCommandInput
>({
  name: 'ListBucketInventoryConfigurations',
  required: ['bucket'],
  commandCtor: ListBucketInventoryConfigurationsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ContinuationToken: input.continuationToken,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
