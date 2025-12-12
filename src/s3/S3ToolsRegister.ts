import * as vscode from 'vscode';
import * as ui from '../common/UI';

import { ListBucketsTool } from './ListBucketsTool';
import { GetBucketAccelerateConfigurationTool } from './GetBucketAccelerateConfigurationTool';
import { GetBucketAclTool } from './GetBucketAclTool';
import { GetBucketAnalyticsConfigurationTool } from './GetBucketAnalyticsConfigurationTool';
import { GetBucketCorsTool } from './GetBucketCorsTool';
import { GetBucketEncryptionTool } from './GetBucketEncryptionTool';
import { GetBucketIntelligentTieringConfigurationTool } from './GetBucketIntelligentTieringConfigurationTool';
import { GetBucketInventoryConfigurationTool } from './GetBucketInventoryConfigurationTool';
import { GetBucketLifecycleConfigurationTool } from './GetBucketLifecycleConfigurationTool';
import { GetBucketLocationTool } from './GetBucketLocationTool';
import { GetBucketLoggingTool } from './GetBucketLoggingTool';
import { GetBucketMetadataTableConfigurationTool } from './GetBucketMetadataTableConfigurationTool';
import { GetBucketMetricsConfigurationTool } from './GetBucketMetricsConfigurationTool';
import { GetBucketNotificationConfigurationTool } from './GetBucketNotificationConfigurationTool';
import { GetBucketOwnershipControlsTool } from './GetBucketOwnershipControlsTool';
import { GetBucketPolicyTool } from './GetBucketPolicyTool';
import { GetBucketPolicyStatusTool } from './GetBucketPolicyStatusTool';
import { GetBucketReplicationTool } from './GetBucketReplicationTool';
import { GetBucketRequestPaymentTool } from './GetBucketRequestPaymentTool';
import { GetBucketTaggingTool } from './GetBucketTaggingTool';
import { GetBucketVersioningTool } from './GetBucketVersioningTool';
import { GetBucketWebsiteTool } from './GetBucketWebsiteTool';
import { GetObjectAclTool } from './GetObjectAclTool';
import { GetObjectAttributesTool } from './GetObjectAttributesTool';
import { GetObjectLegalHoldTool } from './GetObjectLegalHoldTool';
import { GetObjectLockConfigurationTool } from './GetObjectLockConfigurationTool';
import { GetObjectRetentionTool } from './GetObjectRetentionTool';
import { GetObjectTaggingTool } from './GetObjectTaggingTool';
import { GetObjectTorrentTool } from './GetObjectTorrentTool';
import { GetPublicAccessBlockTool } from './GetPublicAccessBlockTool';
import { HeadBucketTool } from './HeadBucketTool';
import { HeadObjectTool } from './HeadObjectTool';
import { ListBucketAnalyticsConfigurationsTool } from './ListBucketAnalyticsConfigurationsTool';
import { ListBucketIntelligentTieringConfigurationsTool } from './ListBucketIntelligentTieringConfigurationsTool';
import { ListBucketInventoryConfigurationsTool } from './ListBucketInventoryConfigurationsTool';
import { ListBucketMetricsConfigurationsTool } from './ListBucketMetricsConfigurationsTool';
import { ListDirectoryBucketsTool } from './ListDirectoryBucketsTool';
import { ListMultipartUploadsTool } from './ListMultipartUploadsTool';
import { ListObjectsV2Tool } from './ListObjectsV2Tool';
import { ListObjectVersionsTool } from './ListObjectVersionsTool';
import { ListPartsTool } from './ListPartsTool';

export function Register(context: vscode.ExtensionContext) {
    	// Register language model tools
	const tools: Array<{ name: string; instance: vscode.LanguageModelTool<any> }> = [
		{ name: 's3_listBuckets', instance: new ListBucketsTool() },
		{ name: 's3_getBucketAccelerateConfiguration', instance: new GetBucketAccelerateConfigurationTool() },
		{ name: 's3_getBucketAcl', instance: new GetBucketAclTool() },
		{ name: 's3_getBucketAnalyticsConfiguration', instance: new GetBucketAnalyticsConfigurationTool() },
		{ name: 's3_getBucketCors', instance: new GetBucketCorsTool() },
		{ name: 's3_getBucketEncryption', instance: new GetBucketEncryptionTool() },
		{ name: 's3_getBucketIntelligentTieringConfiguration', instance: new GetBucketIntelligentTieringConfigurationTool() },
		{ name: 's3_getBucketInventoryConfiguration', instance: new GetBucketInventoryConfigurationTool() },
		{ name: 's3_getBucketLifecycleConfiguration', instance: new GetBucketLifecycleConfigurationTool() },
		{ name: 's3_getBucketLocation', instance: new GetBucketLocationTool() },
		{ name: 's3_getBucketLogging', instance: new GetBucketLoggingTool() },
		{ name: 's3_getBucketMetadataTableConfiguration', instance: new GetBucketMetadataTableConfigurationTool() },
		{ name: 's3_getBucketMetricsConfiguration', instance: new GetBucketMetricsConfigurationTool() },
		{ name: 's3_getBucketNotificationConfiguration', instance: new GetBucketNotificationConfigurationTool() },
		{ name: 's3_getBucketOwnershipControls', instance: new GetBucketOwnershipControlsTool() },
		{ name: 's3_getBucketPolicy', instance: new GetBucketPolicyTool() },
		{ name: 's3_getBucketPolicyStatus', instance: new GetBucketPolicyStatusTool() },
		{ name: 's3_getBucketReplication', instance: new GetBucketReplicationTool() },
		{ name: 's3_getBucketRequestPayment', instance: new GetBucketRequestPaymentTool() },
		{ name: 's3_getBucketTagging', instance: new GetBucketTaggingTool() },
		{ name: 's3_getBucketVersioning', instance: new GetBucketVersioningTool() },
		{ name: 's3_getBucketWebsite', instance: new GetBucketWebsiteTool() },
		{ name: 's3_getObjectAcl', instance: new GetObjectAclTool() },
		{ name: 's3_getObjectAttributes', instance: new GetObjectAttributesTool() },
		{ name: 's3_getObjectLegalHold', instance: new GetObjectLegalHoldTool() },
		{ name: 's3_getObjectLockConfiguration', instance: new GetObjectLockConfigurationTool() },
		{ name: 's3_getObjectRetention', instance: new GetObjectRetentionTool() },
		{ name: 's3_getObjectTagging', instance: new GetObjectTaggingTool() },
		{ name: 's3_getObjectTorrent', instance: new GetObjectTorrentTool() },
		{ name: 's3_getPublicAccessBlock', instance: new GetPublicAccessBlockTool() },
		{ name: 's3_headBucket', instance: new HeadBucketTool() },
		{ name: 's3_headObject', instance: new HeadObjectTool() },
		{ name: 's3_listBucketAnalyticsConfigurations', instance: new ListBucketAnalyticsConfigurationsTool() },
		{ name: 's3_listBucketIntelligentTieringConfigurations', instance: new ListBucketIntelligentTieringConfigurationsTool() },
		{ name: 's3_listBucketInventoryConfigurations', instance: new ListBucketInventoryConfigurationsTool() },
		{ name: 's3_listBucketMetricsConfigurations', instance: new ListBucketMetricsConfigurationsTool() },
		{ name: 's3_listDirectoryBuckets', instance: new ListDirectoryBucketsTool() },
		{ name: 's3_listMultipartUploads', instance: new ListMultipartUploadsTool() },
		{ name: 's3_listObjectsV2', instance: new ListObjectsV2Tool() },
		{ name: 's3_listObjectVersions', instance: new ListObjectVersionsTool() },
		{ name: 's3_listParts', instance: new ListPartsTool() }
	];

	for (const tool of tools) {
		const registration = vscode.lm.registerTool(tool.name, tool.instance);
		context.subscriptions.push(registration);
	}

	ui.logToOutput('S3 Language model tools registered');
}