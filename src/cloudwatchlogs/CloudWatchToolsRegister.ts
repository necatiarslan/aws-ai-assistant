import * as vscode from 'vscode';
import { DescribeAccountPoliciesTool } from './DescribeAccountPoliciesTool';
import { DescribeConfigurationTemplatesTool } from './DescribeConfigurationTemplatesTool';
import { DescribeDeliveriesTool } from './DescribeDeliveriesTool';
import { DescribeDeliveryDestinationsTool } from './DescribeDeliveryDestinationsTool';
import { DescribeDeliverySourcesTool } from './DescribeDeliverySourcesTool';
import { DescribeDestinationsTool } from './DescribeDestinationsTool';
import { DescribeExportTasksTool } from './DescribeExportTasksTool';
import { DescribeFieldIndexesTool } from './DescribeFieldIndexesTool';
import { DescribeIndexPoliciesTool } from './DescribeIndexPoliciesTool';
import { DescribeLogGroupsTool } from './DescribeLogGroupsTool';
import { DescribeLogStreamsTool } from './DescribeLogStreamsTool';
import { DescribeMetricFiltersTool } from './DescribeMetricFiltersTool';
import { DescribeQueriesTool } from './DescribeQueriesTool';
import { DescribeQueryDefinitionsTool } from './DescribeQueryDefinitionsTool';
import { DescribeResourcePoliciesTool } from './DescribeResourcePoliciesTool';
import { DescribeSubscriptionFiltersTool } from './DescribeSubscriptionFiltersTool';
import { FilterLogEventsTool } from './FilterLogEventsTool';
import { GetDataProtectionPolicyTool } from './GetDataProtectionPolicyTool';
import { GetDeliveryTool } from './GetDeliveryTool';
import { GetDeliveryDestinationTool } from './GetDeliveryDestinationTool';
import { GetDeliveryDestinationPolicyTool } from './GetDeliveryDestinationPolicyTool';
import { GetDeliverySourceTool } from './GetDeliverySourceTool';
import { GetIntegrationTool } from './GetIntegrationTool';
import { GetLogAnomalyDetectorTool } from './GetLogAnomalyDetectorTool';
import { GetLogEventsTool } from './GetLogEventsTool';
import { GetLogGroupFieldsTool } from './GetLogGroupFieldsTool';
import { GetLogRecordTool } from './GetLogRecordTool';
import { GetQueryResultsTool } from './GetQueryResultsTool';
import { GetScheduledQueryTool } from './GetScheduledQueryTool';
import { GetTransformerTool } from './GetTransformerTool';
import { ListAggregateLogGroupSummariesTool } from './ListAggregateLogGroupSummariesTool';
import { ListAnomaliesTool } from './ListAnomaliesTool';
import { ListIntegrationsTool } from './ListIntegrationsTool';
import { ListLogAnomalyDetectorsTool } from './ListLogAnomalyDetectorsTool';
import { ListLogGroupsTool } from './ListLogGroupsTool';
import { ListLogGroupsForQueryTool } from './ListLogGroupsForQueryTool';
import { ListScheduledQueriesTool } from './ListScheduledQueriesTool';
import { ListSourcesForS3TableIntegrationTool } from './ListSourcesForS3TableIntegrationTool';
import { ListTagsForResourceTool } from './ListTagsForResourceTool';

export function Register(context: vscode.ExtensionContext) {
  const tools: Array<{ name: string; instance: vscode.LanguageModelTool<any> }> = [
    { name: 'cloudwatchlogs_describeAccountPolicies', instance: new DescribeAccountPoliciesTool() },
    { name: 'cloudwatchlogs_describeConfigurationTemplates', instance: new DescribeConfigurationTemplatesTool() },
    { name: 'cloudwatchlogs_describeDeliveries', instance: new DescribeDeliveriesTool() },
    { name: 'cloudwatchlogs_describeDeliveryDestinations', instance: new DescribeDeliveryDestinationsTool() },
    { name: 'cloudwatchlogs_describeDeliverySources', instance: new DescribeDeliverySourcesTool() },
    { name: 'cloudwatchlogs_describeDestinations', instance: new DescribeDestinationsTool() },
    { name: 'cloudwatchlogs_describeExportTasks', instance: new DescribeExportTasksTool() },
    { name: 'cloudwatchlogs_describeFieldIndexes', instance: new DescribeFieldIndexesTool() },
    { name: 'cloudwatchlogs_describeIndexPolicies', instance: new DescribeIndexPoliciesTool() },
    { name: 'cloudwatchlogs_describeLogGroups', instance: new DescribeLogGroupsTool() },
    { name: 'cloudwatchlogs_describeLogStreams', instance: new DescribeLogStreamsTool() },
    { name: 'cloudwatchlogs_describeMetricFilters', instance: new DescribeMetricFiltersTool() },
    { name: 'cloudwatchlogs_describeQueries', instance: new DescribeQueriesTool() },
    { name: 'cloudwatchlogs_describeQueryDefinitions', instance: new DescribeQueryDefinitionsTool() },
    { name: 'cloudwatchlogs_describeResourcePolicies', instance: new DescribeResourcePoliciesTool() },
    { name: 'cloudwatchlogs_describeSubscriptionFilters', instance: new DescribeSubscriptionFiltersTool() },
    { name: 'cloudwatchlogs_filterLogEvents', instance: new FilterLogEventsTool() },
    { name: 'cloudwatchlogs_getDataProtectionPolicy', instance: new GetDataProtectionPolicyTool() },
    { name: 'cloudwatchlogs_getDelivery', instance: new GetDeliveryTool() },
    { name: 'cloudwatchlogs_getDeliveryDestination', instance: new GetDeliveryDestinationTool() },
    { name: 'cloudwatchlogs_getDeliveryDestinationPolicy', instance: new GetDeliveryDestinationPolicyTool() },
    { name: 'cloudwatchlogs_getDeliverySource', instance: new GetDeliverySourceTool() },
    { name: 'cloudwatchlogs_getIntegration', instance: new GetIntegrationTool() },
    { name: 'cloudwatchlogs_getLogAnomalyDetector', instance: new GetLogAnomalyDetectorTool() },
    { name: 'cloudwatchlogs_getLogEvents', instance: new GetLogEventsTool() },
    { name: 'cloudwatchlogs_getLogGroupFields', instance: new GetLogGroupFieldsTool() },
    { name: 'cloudwatchlogs_getLogRecord', instance: new GetLogRecordTool() },
    { name: 'cloudwatchlogs_getQueryResults', instance: new GetQueryResultsTool() },
    { name: 'cloudwatchlogs_getScheduledQuery', instance: new GetScheduledQueryTool() },
    { name: 'cloudwatchlogs_getTransformer', instance: new GetTransformerTool() },
    { name: 'cloudwatchlogs_listAggregateLogGroupSummaries', instance: new ListAggregateLogGroupSummariesTool() },
    { name: 'cloudwatchlogs_listAnomalies', instance: new ListAnomaliesTool() },
    { name: 'cloudwatchlogs_listIntegrations', instance: new ListIntegrationsTool() },
    { name: 'cloudwatchlogs_listLogAnomalyDetectors', instance: new ListLogAnomalyDetectorsTool() },
    { name: 'cloudwatchlogs_listLogGroups', instance: new ListLogGroupsTool() },
    { name: 'cloudwatchlogs_listLogGroupsForQuery', instance: new ListLogGroupsForQueryTool() },
    { name: 'cloudwatchlogs_listScheduledQueries', instance: new ListScheduledQueriesTool() },
    { name: 'cloudwatchlogs_listSourcesForS3TableIntegration', instance: new ListSourcesForS3TableIntegrationTool() },
    { name: 'cloudwatchlogs_listTagsForResource', instance: new ListTagsForResourceTool() },
  ];

  for (const tool of tools) {
    const registration = vscode.lm.registerTool(tool.name, tool.instance);
    context.subscriptions.push(registration);
  }
}
