import * as cdk from 'aws-cdk-lib';
import { EC2InstanceStack } from '../lib/ec2-instance-stack';
import { LaunchTemplateStack } from '../lib/launch-template-stack';
import { Ec2AutoscalingStack } from '../lib/ec2-autoscaling-stack';

const app = new cdk.App();

new EC2InstanceStack(app, 'EC2InstanceStack');
new LaunchTemplateStack(app, 'LaunchTemplate');
new Ec2AutoscalingStack(app, 'Ec2AutoscalingStack');