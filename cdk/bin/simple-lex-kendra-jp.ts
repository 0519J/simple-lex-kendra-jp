#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleKendraStack } from '../lib/simple-kendra-stack';
import { SimpleLexV2Stack } from '../lib/simple-lexv2-stack';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

const fetchLatestBotVersion = async (): Promise<number> => {
  try {
    const stack = await (new CloudFormationClient({})).send(new DescribeStacksCommand({
      StackName: 'SimpleLexV2Stack',
    }));

    const outputs = stack.Stacks?.[0].Outputs;

    if (outputs) {
      return Number(outputs.find(o => o.OutputKey === 'BotVersionNumber')?.OutputValue || '0');
    } else {
      return 0;
    }
  } finally {
    return 0;
  }
};

// 2022/12 現在 Kendra は Tokyo Region はサポートされていない
const region = 'us-east-1';
const app = new cdk.App();

(async () => {
  const kendraStack = new SimpleKendraStack(app, 'SimpleKendraStack', {
    env: { region },
  });

  new SimpleLexV2Stack(app, 'SimpleLexV2Stack', {
    kendraIndex: kendraStack.index,
    latestBotVersion: await fetchLatestBotVersion(),
    autoIncrementBotVersion: true,
    env: { region },
  });
})();
