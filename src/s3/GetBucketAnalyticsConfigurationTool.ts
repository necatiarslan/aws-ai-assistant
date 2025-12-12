import { GetBucketAnalyticsConfigurationCommand, GetBucketAnalyticsConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketAnalyticsConfigurationInput {
  bucket: string;
  id: string;
  expectedBucketOwner?: string;
}

export const GetBucketAnalyticsConfigurationTool = createS3Tool<
  GetBucketAnalyticsConfigurationInput,
  GetBucketAnalyticsConfigurationCommandInput
>({
  name: 'GetBucketAnalyticsConfiguration',
  required: ['bucket', 'id'],
  commandCtor: GetBucketAnalyticsConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Id: input.id,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
