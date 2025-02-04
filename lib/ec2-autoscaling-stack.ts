import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { url } from 'inspector';


export class Ec2AutoscalingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Step 1: Create a VPC
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

        // Step 2: Create a securit group for instances
        const securityGroup = new ec2.SecurityGroup(this, 'InstanceSG', {
            vpc, 
            description: 'Allow SSH and HTTP',
            allowAllOutbound: true
        });

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allo HTTP');


        // Step 3: Create a launch template
        const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');
        const launchTemplate = new ec2.LaunchTemplate(this, 'MyLaunchTemplate', {
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            securityGroup: securityGroup,
            keyPair: keyPair
        });

        // Step 4: Create an auto scaling group
        const autoscalingGroup = new autoscaling.AutoScalingGroup(this, 'MyAutoScaling', {
            vpc,
            launchTemplate,
            minCapacity: 1,
            maxCapacity: 5,
            desiredCapacity: 2,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            }
        });

        // Step 5: Create an application load balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
            vpc,
            internetFacing: true
        })

        // Step 6: Create a Listener for ALB
        const listener = alb.addListener('Listner', {
            port: 80,
            open: true,
        });

        // Step 7: Attach auto scaling group to alb
        listener.addTargets('TargetGroup', {
            port: 80, 
            targets: [autoscalingGroup],
            healthCheck: {path: '/', interval: cdk.Duration.seconds(30)},
        });

        // Step 8: Output the ALB url
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: alb.loadBalancerDnsName
        });
    }
}