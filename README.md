# Deploying a React App to AWS S3 using AWS CDK

This guide provides a step-by-step explanation of how to deploy a React application to an **S3 bucket** using **AWS CDK (TypeScript)**. It also covers how to properly delete the S3 bucket when destroying the stack.

---

## Table of Contents
- [Deploying a React App to AWS S3 using AWS CDK](#deploying-a-react-app-to-aws-s3-using-aws-cdk)
  - [Table of Contents](#table-of-contents)
  - [**1. AWS CDK \& S3 Overview**](#1-aws-cdk--s3-overview)
    - [**What is AWS CDK?**](#what-is-aws-cdk)
    - [**What is Amazon S3?**](#what-is-amazon-s3)
    - [**S3 Features Used**](#s3-features-used)
    - [**Important Definitions**](#important-definitions)
  - [**2. AWS CDK Code to Deploy React App to S3**](#2-aws-cdk-code-to-deploy-react-app-to-s3)
    - [**CDK code**](#cdk-code)
    - [**Code Explanation**](#code-explanation)
  - [**3. How to Delete an S3 Bucket?**](#3-how-to-delete-an-s3-bucket)
    - [**Method 1: Using AWS CDK**](#method-1-using-aws-cdk)
    - [**Method 2: Using AWS CLI**](#method-2-using-aws-cli)
    - [**Method 3: Using AWS Console**](#method-3-using-aws-console)
  - [**4. Steps to Deploy the React App**](#4-steps-to-deploy-the-react-app)
  - [**5. Next Steps: Using CloudFront for HTTPS (Optional)**](#5-next-steps-using-cloudfront-for-https-optional)
  - [**6. Summary**](#6-summary)
- [AWS S3 Lifecycle Policies \& Versioning in AWS CDK](#aws-s3-lifecycle-policies--versioning-in-aws-cdk)
  - [**1. Lifecycle Policies in S3**](#1-lifecycle-policies-in-s3)
    - [**What are Lifecycle Policies?**](#what-are-lifecycle-policies)
    - [**CDK Code to Add Lifecycle Rules**](#cdk-code-to-add-lifecycle-rules)
    - [**Explanation**](#explanation)
  - [**2. Versioning in S3**](#2-versioning-in-s3)
    - [**What is Versioning?**](#what-is-versioning)
    - [**CDK Code to Enable Versioning**](#cdk-code-to-enable-versioning)
    - [**Explanation**](#explanation-1)
  - [**3. Combining Lifecycle Policies \& Versioning**](#3-combining-lifecycle-policies--versioning)
    - [**Summary**](#summary)
  - [**4. Best Practices**](#4-best-practices)

---

## **1. AWS CDK & S3 Overview**

### **What is AWS CDK?**
AWS CDK (Cloud Development Kit) is an Infrastructure as Code (IaC) tool that allows developers to define cloud resources using programming languages like TypeScript, Python, and Java.

### **What is Amazon S3?**
Amazon Simple Storage Service (S3) is an object storage service used for storing and retrieving any amount of data. S3 can also host **static websites** like a React application.

### **S3 Features Used**
- **Buckets**: Storage containers for objects/files.
- **Website Hosting**: Enables S3 to serve static files as a website.
- **Lifecycle Policies**: Manage object expiration and transitions.
- **Versioning**: Stores multiple versions of objects to prevent accidental deletion.

### **Important Definitions**
- **Infrastructure as Code (IaC)**: The process of managing and provisioning computing infrastructure using machine-readable configuration files instead of physical hardware.
- **CloudFormation**: An AWS service that provides a common language for describing and provisioning all infrastructure resources in a cloud environment.
- **CDK Stack**: A logical unit of AWS resources that are defined using AWS CDK.

---

## **2. AWS CDK Code to Deploy React App to S3**

### **CDK code**
```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export class S3ReactAppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an s3 bucket for hosting the React app
        const bucket = new s3.Bucket(this, 'ReactAppBucket', {
            bucketName: 'my-react-app-12344567', 
            websiteIndexDocument: 'index.html', // Set as a static website
            websiteErrorDocument: 'index.html', // React handles routing
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicPolicy: false,
                blockPublicAcls: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            }),
            publicReadAccess: true, // make the website public
            removalPolicy: RemovalPolicy.DESTROY, // deletes bucket on stack removal
            autoDeleteObjects: true, // deletes all items from bucket when cloudformation is deleted
        });

        // Add a public read access policy
        bucket.addToResourcePolicy(
            new cdk.aws_iam.PolicyStatement({
                actions: ['s3:GetObject'],
                resources: [bucket.arnForObjects('*')],
                principals: [new cdk.aws_iam.AnyPrincipal()]
            })
        );

        // Deploy the React build folder to s3
        new s3deploy.BucketDeployment(this, 'DeployReactApp', {
            sources: [s3deploy.Source.asset('./react-app/dist')],
            destinationBucket: bucket
        });

        // output the website url
        new cdk.CfnOutput(this, 'WebsiteUrl', {
            value: bucket.bucketWebsiteUrl,
        });
    }
}
```

### **Code Explanation**
- **Create an S3 Bucket**: The `s3.Bucket` construct initializes an S3 bucket with website hosting enabled.
- **Set Public Access Policy**: An IAM policy is added to allow public access to the objects.
- **Deploy React App**: The `s3deploy.BucketDeployment` construct is used to upload the React build files to the S3 bucket.
- **Auto-delete Objects on Stack Removal**: `autoDeleteObjects: true` ensures all files are deleted when the stack is destroyed.
- **Output Website URL**: The CloudFormation output displays the S3 static website URL after deployment.

---

## **3. How to Delete an S3 Bucket?**

### **Method 1: Using AWS CDK**
```sh
cdk destroy
```

### **Method 2: Using AWS CLI**
```sh
aws s3 rm s3://my-react-app-12344567 --recursive
cdk destroy
```

### **Method 3: Using AWS Console**
1. Open the [AWS S3 Console](https://s3.console.aws.amazon.com/s3/home).
2. Delete all files in your bucket.
3. Delete the CloudFormation stack.

---

## **4. Steps to Deploy the React App**

1. **Install Dependencies:**
```sh
npm install -g aws-cdk
npm install @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment @aws-cdk/aws-iam
```

2. **Bootstrap CDK:**
```sh
cdk bootstrap
```

3. **Synthesize the CloudFormation Template:**
```sh
cdk synth
```

4. **Deploy the Stack:**
```sh
cdk deploy
```

5. **Open the Website:** Copy and paste the **Website URL** into your browser.

---

This setup ensures a **cost-effective and reliable** S3 storage configuration. 🚀


---

## **5. Next Steps: Using CloudFront for HTTPS (Optional)**
Amazon S3 **only supports HTTP**. To enable **HTTPS and caching**, use **CloudFront** as a CDN.

---

## **6. Summary**
- **Created an S3 bucket** with public access for hosting a React app.
- **Deployed the React build folder** using AWS CDK.
- **Allowed public read access** via IAM policies.
- **Explained multiple ways to delete an S3 bucket**.
- **Provided a step-by-step guide** to deploy and access the website.

This setup allows for easy deployment and management of a static React app on AWS. 🚀

---
***

# AWS S3 Lifecycle Policies & Versioning in AWS CDK

This document explains how to configure **Lifecycle Policies** and **Versioning** in AWS S3 using AWS CDK (TypeScript).

---

## **1. Lifecycle Policies in S3**

### **What are Lifecycle Policies?**
Lifecycle policies in S3 allow automatic management of objects, including:
- **Transitioning objects** to different storage classes (e.g., Standard → Glacier)
- **Expiring objects** after a certain time
- **Deleting non-current object versions**

### **CDK Code to Add Lifecycle Rules**
```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3LifecycleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an S3 bucket with lifecycle rules
        const bucket = new s3.Bucket(this, 'LifecycleBucket', {
            lifecycleRules: [
                {
                    id: 'MoveToGlacier',
                    enabled: true,
                    transitions: [{
                        storageClass: s3.StorageClass.GLACIER,
                        transitionAfter: cdk.Duration.days(30), // Move to Glacier after 30 days
                    }],
                },
                {
                    id: 'ExpireObjects',
                    enabled: true,
                    expiration: cdk.Duration.days(365), // Delete objects after 1 year
                },
            ],
        });
    }
}
```

### **Explanation**
- Moves objects to **Glacier** after **30 days**.
- Deletes objects after **1 year**.

---

## **2. Versioning in S3**

### **What is Versioning?**
S3 **Versioning** helps prevent accidental deletion by keeping multiple versions of an object. It enables:
- **Restoring old versions** of a file.
- **Protecting against accidental deletions.**

### **CDK Code to Enable Versioning**
```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3VersioningStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an S3 bucket with versioning enabled
        const bucket = new s3.Bucket(this, 'VersionedBucket', {
            versioned: true,
        });
    }
}
```

### **Explanation**
- Enables **versioning** so every change to an object creates a new version.
- Prevents accidental overwrites/deletions.

---

## **3. Combining Lifecycle Policies & Versioning**
You can combine both features:
```typescript
const bucket = new s3.Bucket(this, 'AdvancedBucket', {
    versioned: true,
    lifecycleRules: [
        {
            id: 'DeleteOldVersions',
            enabled: true,
            noncurrentVersionExpiration: cdk.Duration.days(90), // Delete old versions after 90 days
        },
    ],
});
```

### **Summary**
- Enables **versioning**.
- Deletes **old object versions** after **90 days**.

---

## **4. Best Practices**
✅ Use **Glacier** for infrequently accessed data.  
✅ Enable **Versioning** for important files.  
✅ Set **Lifecycle Rules** to manage storage costs.  
✅ Delete **non-current versions** to avoid excessive storage usage.

This ensures an **optimized, cost-effective, and safe** S3 storage setup. 🚀

