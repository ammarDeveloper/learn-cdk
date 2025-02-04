import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class LaunchTemplateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create a vpc
        const vpc = new ec2.Vpc(this, 'MyVPC', {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'PublicSubnet',
                    subnetType: ec2.SubnetType.PUBLIC
                }
            ]
        });

        // 2. Create a security group
        const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
            vpc,
            description: 'Allow SSH access',
            allowAllOutbound: true
        });

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSh');

        // Step 3: Create a launch tamplate
        const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');

        const launchTemplate = new ec2.LaunchTemplate(this, 'MyLaunchTemplate', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage(),
            keyPair: keyPair,
            securityGroup: securityGroup
        });

        // Step 4: Output the Launch Template Id
        new cdk.CfnOutput(this, 'LaunchTemplateId', {
            value: launchTemplate.launchTemplateId!
        });

        // Step 5: Use launch template to create ec2 instance
        const instance = new ec2.CfnInstance(this, 'MyEc2Instance', {
            launchTemplate: {
                launchTemplateId: launchTemplate.launchTemplateId,
                version: launchTemplate.latestVersionNumber
            },
            subnetId: vpc.publicSubnets[0].subnetId
        });

        // Step 6: Output the Instance ID
        new cdk.CfnOutput(this, 'Instanceid', {
             value: instance.attrInstanceId
        })
    }
}