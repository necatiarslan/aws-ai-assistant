import { GetBucketIntelligentTieringConfigurationCommand, GetBucketIntelligentTieringConfigurationCommandInput } from '@aws-sdk/client-s3';
import { createS3Tool } from './S3ToolFactory';

export interface GetBucketIntelligentTieringConfigurationInput {
  bucket: string;
  id: string;
  expectedBucketOwner?: string;
}

export const GetBucketIntelligentTieringConfigurationTool = createS3Tool<
  GetBucketIntelligentTieringConfigurationInput,
  GetBucketIntelligentTieringConfigurationCommandInput
>({
  name: 'GetBucketIntelligentTieringConfiguration',
  required: ['bucket', 'id'],
  commandCtor: GetBucketIntelligentTieringConfigurationCommand,
  buildInput: (input) => ({
    Bucket: input.bucket,
    Id: input.id,
    ExpectedBucketOwner: input.expectedBucketOwner,
  }),
});
