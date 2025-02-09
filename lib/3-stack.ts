import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';

export class S3Stack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // create an s3 bucket with versioning and lifecycle rules
        const bucket = new s3.Bucket(this, 'MyBucket', {
            bucketName: 'my-awesome-bucket-123455',
            versioned: true, // Enable versioning
            removalPolicy: RemovalPolicy.DESTROY, // Deletes the bucket when stack is removed
            lifecycleRules: [
                {
                    id: 'MoveToGlacier',
                    transitions: [
                        {
                            storageClass: s3.StorageClass.GLACIER,
                            transitionAfter: Duration.days(30), // Move to Glacier after 30 days
                        },
                    ],
                    expiration: Duration.days(365), // Delete after 1 year
                },
            ],
        });

        // Upload a local file
        new s3deploy.BucketDeployment(this, 'DeployFiles', {
            sources: [s3deploy.Source.asset('./assets')], // Folder with files
            destinationBucket: bucket,
        })

        // Output the bucket name
        new cdk.CfnOutput(this, 'BucketName', {
            value: bucket.bucketName,
        })
    }
}
