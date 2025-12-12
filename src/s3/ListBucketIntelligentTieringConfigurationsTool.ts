import { ListBucketIntelligentTieringConfigurationsCommand, ListBucketIntelligentTieringConfigurationsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListBucketIntelligentTieringConfigurationsInput {
  bucket: string;
  continuationToken?: string;
  expectedBucketOwner?: string;
}

export const ListBucketIntelligentTieringConfigurationsTool = createS3Tool<
  ListBucketIntelligentTieringConfigurationsInput,
  ListBucketIntelligentTieringConfigurationsCommandInput
>({
  name: 'ListBucketIntelligentTieringConfigurations',
  required: ['bucket'],
  commandCtor: ListBucketIntelligentTieringConfigurationsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ContinuationToken: input.continuationToken,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
