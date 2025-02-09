#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3Stack } from '../lib/3-stack';
import { S3ReactAppStack } from '../lib/s3-reactapp-stack';

const app = new cdk.App();
new S3Stack(app, 'S3Stack');
new S3ReactAppStack(app, 'S3ReactAppStack');