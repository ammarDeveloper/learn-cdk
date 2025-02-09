import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
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