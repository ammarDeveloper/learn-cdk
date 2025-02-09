#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EscFargetStack } from '../lib/ecs-Farget-stack';

const app = new cdk.App();
new EscFargetStack(app, 'EscFargetStack');
