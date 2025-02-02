#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BasicLambdaStack } from '../lib/basic-lambda-stack';
import { LambdaWithLayerStack } from '../lib/lambda-with-layer-stack';
import { LambdaCompleteStack } from '../lib/lambda-complete-stack';

const app = new cdk.App();

new BasicLambdaStack(app, 'BasicLambdaStack');
new LambdaWithLayerStack(app, 'LambdaWithLayerStack');
new LambdaCompleteStack(app, 'LambdaCompleteStack');