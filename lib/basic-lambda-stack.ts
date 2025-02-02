import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class BasicLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a simple lambda function
        const helloFunction = new lambda.Function(this, 'HelloFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            memorySize: 128,
            timeout: cdk.Duration.seconds(30),
            environment: {
                ENVIRONMENT: 'development'
            }
        });
    }
}

