import { GetBucketMetricsConfigurationCommand, GetBucketMetricsConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketMetricsConfigurationInput {
  bucket: string;
  id: string;
  expectedBucketOwner?: string;
}

export const GetBucketMetricsConfigurationTool = createS3Tool<
  GetBucketMetricsConfigurationInput,
  GetBucketMetricsConfigurationCommandInput
>({
  name: 'GetBucketMetricsConfiguration',
  required: ['bucket', 'id'],
  commandCtor: GetBucketMetricsConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Id: input.id,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
