import { ListBucketMetricsConfigurationsCommand, ListBucketMetricsConfigurationsCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface ListBucketMetricsConfigurationsInput {
  bucket: string;
  continuationToken?: string;
  expectedBucketOwner?: string;
}

export const ListBucketMetricsConfigurationsTool = createS3Tool<
  ListBucketMetricsConfigurationsInput,
  ListBucketMetricsConfigurationsCommandInput
>({
  name: 'ListBucketMetricsConfigurations',
  required: ['bucket'],
  commandCtor: ListBucketMetricsConfigurationsCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    ContinuationToken: input.continuationToken,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
