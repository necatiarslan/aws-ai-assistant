import { ListBucketAnalyticsConfigurationsCommand, ListBucketAnalyticsConfigurationsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListBucketAnalyticsConfigurationsInput {
  bucket: string;
  continuationToken?: string;
  expectedBucketOwner?: string;
}

export const ListBucketAnalyticsConfigurationsTool = createS3Tool<
  ListBucketAnalyticsConfigurationsInput,
  ListBucketAnalyticsConfigurationsCommandInput
>({
  name: 'ListBucketAnalyticsConfigurations',
  required: ['bucket'],
  commandCtor: ListBucketAnalyticsConfigurationsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ContinuationToken: input.continuationToken,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
