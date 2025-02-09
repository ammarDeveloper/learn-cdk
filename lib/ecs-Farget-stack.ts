import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class EscFargetStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create a vpc
        const vpc = new ec2.Vpc(this, 'MyVpc', {
            maxAzs: 2
        });

        // 2. Create an ECS Cluster
        const cluster = new ecs.Cluster(this, 'MyCluster', {
            vpc
        });

        // 3. Define a fargate task definition
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'MyTaskDef', {
            memoryLimitMiB: 512,
            cpu: 256
        });

        // 4. Add a container to the task definition
        // Here we are using sample container image from Amazon
        const container = taskDefinition.addContainer('MyContainer', {
            image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
            logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'MyApp' }),
        });

        // 5. Create a Fargate service that task definition
        const fargateService = new ecs.FargateService(this, 'MyFargateService', {
            cluster,
            taskDefinition,
            desiredCount: 2,
        });

        // 6. Setting up as application load balancer
        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc, 
            internetFacing: true,
        });
        const listener = lb.addListener('Listener', {
            port: 80,
            open: true,
        });

        // 7. Attaching the Fargate service to the ALB
        listener.addTargets('ECS', {
            port: 80,
            targets: [fargateService],
            healthCheck: {
                path: '/',
                interval: cdk.Duration.seconds(30),
            },
        });

        // 8. Outputting the Load Balancer DNS
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: lb.loadBalancerDnsName,
        });
    }
}