# AWS EC2 Instance Setup with CDK

This project demonstrates how to set up an EC2 instance using AWS CDK (Cloud Development Kit) with TypeScript. It includes VPC configuration, security group setup, and a guide for deploying a Node.js application. The CDK code is explained in detail to help you understand how each component works.

---
## Table of Contents
- [AWS EC2 Instance Setup with CDK](#aws-ec2-instance-setup-with-cdk)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [What is EC2?](#what-is-ec2)
    - [Why use EC2?](#why-use-ec2)
  - [Understanding VPC](#understanding-vpc)
    - [What is VPC?](#what-is-vpc)
    - [Why is VPC Important?](#why-is-vpc-important)
    - [VPC Usage in AWS Services](#vpc-usage-in-aws-services)
    - [Benefits of Custom VPC](#benefits-of-custom-vpc)
  - [Security Groups](#security-groups)
    - [Our Security Group Configuration](#our-security-group-configuration)
  - [Installation Steps](#installation-steps)
  - [Project Structure](#project-structure)
  - [CDK Code Explained](#cdk-code-explained)
    - [1. **VPC Creation**](#1-vpc-creation)
    - [2. **Security Group**](#2-security-group)
    - [3. **EC2 Instance**](#3-ec2-instance)
    - [4. **Output the Instance ID**](#4-output-the-instance-id)
  - [Deploying Your First Application](#deploying-your-first-application)
    - [1. **Connect to EC2**](#1-connect-to-ec2)
    - [2. **Install Node.js**](#2-install-nodejs)
    - [3. **Create Application**](#3-create-application)
    - [4. **Add Server Code**](#4-add-server-code)
    - [5. **Run Application**](#5-run-application)
    - [6. **Access Application**](#6-access-application)
  - [Troubleshooting](#troubleshooting)
  - [Best Practices](#best-practices)
- [Launch Templates](#launch-templates)
    - [What is a Launch Template?](#what-is-a-launch-template)
    - [Why Use a Launch Template?](#why-use-a-launch-template)
    - [Creating a Launch Template with AWS CDK](#creating-a-launch-template-with-aws-cdk)
    - [Summary](#summary)
- [Auto Scaling Configuration with Load Balancing](#auto-scaling-configuration-with-load-balancing)
    - [What is Auto Scaling?](#what-is-auto-scaling)
    - [Why Use Auto Scaling with Load Balancing?](#why-use-auto-scaling-with-load-balancing)
    - [Creating an Auto Scaling Configuration with AWS CDK](#creating-an-auto-scaling-configuration-with-aws-cdk)
    - [Adding Load Balancer](#adding-load-balancer)
    - [Adding Scaling Policies](#adding-scaling-policies)
  - [Verifying Auto Scaling and Load Balancing](#verifying-auto-scaling-and-load-balancing)
  - [Best Practices for Auto Scaling with Load Balancing](#best-practices-for-auto-scaling-with-load-balancing)
    - [Additional Considerations](#additional-considerations)

---

## Prerequisites

1. **AWS Account**: Sign up for an AWS account if you don’t already have one.
2. **Node.js**: Install Node.js (version 14.x or later) from [nodejs.org](https://nodejs.org/).
3. **AWS CDK CLI**: Install the AWS CDK CLI globally:
   ```bash
   npm install -g aws-cdk
   ```
4. **AWS CLI**: Install and configure the AWS CLI with your credentials:
   ```bash
   aws configure
   ```

---

## What is EC2?

An **EC2 (Elastic Compute Cloud)** instance is a virtual server in AWS used to:
- Run applications
- Host websites
- Perform computations

### Why use EC2?
- Deploy single servers for testing or small-scale applications.
- Full control over the instance (start, stop, terminate).
- Cost-effective with Free Tier options (e.g., `t2.micro` instance).

---

## Understanding VPC

### What is VPC?
A **VPC (Virtual Private Cloud)** is a logically isolated network in AWS where you deploy resources like EC2 instances, RDS databases, and Lambda functions.

### Why is VPC Important?
- ✅ **Required for EC2 instances**: Every EC2 instance must be inside a VPC.
- Provides network isolation and custom IP ranges.
- Enhances security with private subnets and controlled access.

### VPC Usage in AWS Services
VPC is used by multiple AWS services:
- **EC2 instances**: Virtual servers.
- **RDS (Relational Database Service)**: Managed databases.
- **ECS (Elastic Container Service)**: Container orchestration.
- **ElastiCache**: In-memory caching.
- **Lambda**: When private resource access is needed.

### Benefits of Custom VPC
1. **More control over networking**: Define custom subnets, route tables, and gateways.
2. **Better security**: Use private subnets to isolate resources.
3. **Custom IP ranges**: Allocate IP addresses as per your requirements.
4. **Network isolation**: Prevent unauthorized access to your resources.

---

## Security Groups

A **Security Group** acts as a virtual firewall to control inbound and outbound traffic for AWS resources like EC2 instances.

### Our Security Group Configuration
In this project, the Security Group allows:
- **SSH access (port 22)**: For remote login to the EC2 instance.
- **Node.js application access (port 3000)**: For running a Node.js application.

```typescript
const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
    vpc,
    description: 'Allow SSH access',
    allowAllOutbound: true // Allow all outbound traffic
});

// Allow SSH access from any IP
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

// Allow Node.js application access from any IP
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow Node.js application');
```

---

## Installation Steps

1. **Create a new CDK project**:
   ```bash
   mkdir my-ec2-project
   cd my-ec2-project
   cdk init app --language typescript
   ```

2. **Install required dependencies**:
   ```bash
   npm install aws-cdk-lib constructs
   ```

3. **Copy the EC2 stack code** into `lib/ec2-instance-stack.ts`.

4. **Deploy the stack**:
   ```bash
   cdk deploy
   ```

---

## Project Structure
```
my-ec2-project/
├── bin/
│   └── my-ec2-project.ts         # Entry point for the CDK app
├── lib/
│   └── ec2-instance-stack.ts     # EC2 stack definition
├── test/                         # Unit tests
├── cdk.json                      # CDK configuration
├── package.json                  # Node.js dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## CDK Code Explained

### 1. **VPC Creation**
```typescript
const vpc = new ec2.Vpc(this, 'MyVpc', {
    maxAzs: 2, // Use 2 Availability Zones
    subnetConfiguration: [
        {
            cidrMask: 24, // Subnet size (256 IP addresses)
            name: 'PublicSubnet',
            subnetType: ec2.SubnetType.PUBLIC // Publicly accessible subnet
        }
    ]
});
```
- **maxAzs**: Specifies the number of Availability Zones (AZs) to use.
- **subnetConfiguration**: Defines the subnets in the VPC. Here, we create a public subnet.

### 2. **Security Group**
```typescript
const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
    vpc,
    description: 'Allow SSH access',
    allowAllOutbound: true // Allow all outbound traffic
});

// Allow SSH access
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

// Allow Node.js application access
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow Node.js application');
```
- **vpc**: Associates the Security Group with the VPC.
- **addIngressRule**: Adds rules to allow inbound traffic.

### 3. **EC2 Instance**
```typescript
const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');

const instance = new ec2.Instance(this, 'MyInstance', {
    vpc,
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO), // t2.micro (Free Tier eligible)
    machineImage: new ec2.AmazonLinuxImage(), // Amazon Linux 2 AMI
    keyPair: keyPair, // SSH key pair for access
    securityGroup: securityGroup, // Attach the Security Group
});
```
- **instanceType**: Specifies the instance type (`t2.micro` is Free Tier eligible).
- **machineImage**: Uses the latest Amazon Linux 2 AMI.
- **keyPair**: Associates an SSH key pair for secure access.

### 4. **Output the Instance ID**
```typescript
new cdk.CfnOutput(this, 'InstanceId', {
    value: instance.instanceId
});
```
- Outputs the EC2 instance ID after deployment for easy reference.

---

## Deploying Your First Application

### 1. **Connect to EC2**
```bash
ssh -i "my-ssh-key.pem" ec2-user@your-instance-ip
```

### 2. **Install Node.js**
```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 14.21.3
nvm use 14.21.3
```

### 3. **Create Application**
```bash
# Create project directory
mkdir my-node-app
cd my-node-app

# Initialize project
npm init -y

# Install Express
npm install express

# Create server file
nano app.js
```

### 4. **Add Server Code**
```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from EC2!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

### 5. **Run Application**
```bash
node app.js
```

### 6. **Access Application**
Open your browser and visit:
```
http://your-ec2-public-ip:3000
```

---

## Troubleshooting

1. **Can't connect to EC2**:
   - Check security group rules.
   - Verify key pair permissions.
   - Ensure the instance is running.

2. **Can't access application**:
   - Verify port 3000 is open in the security group.
   - Check if the application is running.
   - Ensure the application is listening on `0.0.0.0`.

---

## Best Practices

1. **Use custom VPCs for production**: Avoid using the default VPC.
2. **Limit security group access**: Only allow necessary ports.
3. **Use private subnets for databases**: Isolate sensitive resources.
4. **Regularly update your applications**: Apply security patches.
5. **Use environment variables for sensitive data**: Avoid hardcoding credentials.

---
***


# Launch Templates

### What is a Launch Template?
A **Launch Template** defines the configuration for EC2 instances, such as the instance type, AMI, key pair, and security group. It is used to standardize instance creation and simplify instance deployment.

### Why Use a Launch Template?
- ✅ **Consistency**: Ensures all instances have the same configuration.
- ✅ **Simplification**: Reduces the need to manually configure each instance.
- ✅ **Reusability**: Can be used across different EC2 instance launches.

A Launch Template is like a pre-configured blueprint for an EC2 instance. Instead of manually setting up an EC2 instance every time, you define everything in a Launch Template and reuse it whenever needed. You are not creating an EC2 instance directly—you are defining how EC2 instances should be created. Then, when you need an instance (or multiple instances), you use the Launch Template to deploy them.

### Creating a Launch Template with AWS CDK

```typescript
// 1. Create a Launch Template
const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');

const launchTemplate = new ec2.LaunchTemplate(this, 'MyLaunchTemplate', {
   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
   machineImage: new ec2.AmazonLinuxImage(),
   keyPair: keyPair,
   securityGroup: securityGroup
});


// 2. Use Launch Template to Create EC2 Instance
const instance = new ec2.CfnInstance(this, 'MyEc2Instance', {
   launchTemplate: {
         launchTemplateId: launchTemplate.launchTemplateId,
         version: launchTemplate.latestVersionNumber
   },
   subnetId: vpc.publicSubnets[0].subnetId
});
```

### Summary
- A Launch Template standardizes EC2 instance configuration.
- It simplifies the process of launching instances.
- The AWS CDK makes it easy to define and deploy Launch Templates programmatically.
- You can use the Launch Template ID to spin up multiple EC2 instances with the same configuration.

By using Launch Templates, you ensure consistency, improve efficiency, and automate EC2 deployments effectively!

---
***
# Auto Scaling Configuration with Load Balancing

### What is Auto Scaling?

Auto Scaling automatically adjusts the number of EC2 instances based on demand. When combined with a Load Balancer, it helps improve application availability, fault tolerance, and distribute incoming traffic across multiple instances.

### Why Use Auto Scaling with Load Balancing?

- ✅ **High availability**: Ensures enough instances are running to handle traffic
- ✅ **Cost efficiency**: Scales down instances when demand is low
- ✅ **Automatic recovery**: Replaces unhealthy instances automatically
- ✅ **Traffic distribution**: Evenly distributes incoming requests across healthy instances

### Creating an Auto Scaling Configuration with AWS CDK

```typescript
// Step 1: Create a Key Pair for SSH Access
const keyPair = ec2.KeyPair.fromKeyPairName(this, 'MyKeyPair', 'my-ssh-key');

// Step 2: Create a Launch Template
const launchTemplate = new ec2.LaunchTemplate(this, 'MyLaunchTemplate', {
    machineImage: ec2.MachineImage.latestAmazonLinux2(),
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    securityGroup: securityGroup,
    keyPair: keyPair
});

// Step 3: Create an Auto Scaling Group
const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'MyAutoScaling', {
    vpc,
    launchTemplate,
    minCapacity: 1,
    maxCapacity: 5,
    desiredCapacity: 2,
    vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
    }
});
```

Key Configuration Parameters:
- **minCapacity**: Minimum number of instances that must always run
- **maxCapacity**: Maximum number of instances that can be created
- **desiredCapacity**: Initial number of instances to start with
- **vpcSubnets**: Specifies which subnets the instances can be launched in

### Adding Load Balancer

```typescript
// Step 4: Create an Application Load Balancer
const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
    vpc,
    internetFacing: true
});

// Step 5: Create a Listener for ALB
const listener = alb.addListener('Listener', {
    port: 80,
    open: true,
});

// Step 6: Attach Auto Scaling Group to Load Balancer
listener.addTargets('TargetGroup', {
    port: 80, 
    targets: [autoScalingGroup],
    healthCheck: {
        path: '/', 
        interval: cdk.Duration.seconds(30)
    },
});
```

Load Balancer Configuration Explained:
- **internetFacing: true**: Makes the load balancer publicly accessible
- **Listener on port 80**: Handles incoming HTTP traffic
- **Health Check**: 
  - Checks root path (`/`)
  - Runs every 30 seconds
  - Ensures only healthy instances receive traffic

### Adding Scaling Policies

You can add scaling policies to automatically adjust instance count:

```typescript
// CPU Utilization Scaling Policy
autoScalingGroup.scaleOnCpuUtilization('CpuScaling', {
    targetUtilizationPercent: 50,
});
```

This policy automatically adds or removes instances when CPU utilization reaches 50%.

---

## Verifying Auto Scaling and Load Balancing

1. **Check in AWS Console:**
   - Navigate to **EC2** → **Auto Scaling Groups**
   - Go to **EC2** → **Load Balancers**
   - Verify instance count and load balancer status

2. **Test Load Balancer:**
   - Use the load balancer's DNS name to access your application
   - Confirm traffic is distributed across instances

3. **Simulate Load and Scaling:**
   ```bash
   # Install stress tool
   sudo yum install -y stress

   # Increase CPU load to trigger scaling
   stress --cpu 4 --timeout 300
   ```

4. **Monitor Scaling Activity:**
   - Check **EC2** → **Auto Scaling Groups** → **Activity**
   - Observe new instance launches

---

## Best Practices for Auto Scaling with Load Balancing

1. **Define proper scaling limits**: Set appropriate min/max instance counts
2. **Use multiple availability zones**: Improve fault tolerance
3. **Configure health checks**: Ensure only healthy instances receive traffic
4. **Monitor metrics**: Use CloudWatch for comprehensive monitoring
5. **Choose right scaling metric**: CPU, network, or custom metrics
6. **Implement gradual scaling**: Avoid sudden, large-scale changes

By implementing Auto Scaling with Load Balancing, you create a robust, scalable, and resilient infrastructure that can handle varying levels of traffic efficiently. 🚀

---

### Additional Considerations

- **Security**: Ensure your security groups and network ACLs are properly configured
- **Cost Management**: Monitor and optimize instance types and scaling policies
- **Performance**: Choose appropriate instance types for your workload