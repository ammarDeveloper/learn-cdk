import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class EC2InstanceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create a vpc
        const vpc = new ec2.Vpc(this, 'MyVpc', {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'PublicSubnet',
                    subnetType: ec2.SubnetType.PUBLIC
                }
            ]
        });

        // Step2: Create a security group
        const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
            vpc,
            description: 'Allow SSH access',
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(), 
            ec2.Port.tcp(3000), 
            'Allow Node.js application'
        );

        // Step 3: Create an EC2 Instance
        const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');

        const instance = new ec2.Instance(this, 'MyInstance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO), // for AWS free tier t2.micro -> 1 vCPU, 1GB RAM (Free Tier eligible)
            machineImage: new ec2.AmazonLinuxImage(),
            keyPair: keyPair,
            securityGroup: securityGroup,
        });

        // Step 4: Output the Instance ID
        new cdk.CfnOutput(this, 'InstanceId', {
            value: instance.instanceId
        })

    }
}