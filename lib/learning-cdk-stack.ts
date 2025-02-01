import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class LearningCdkStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Define the lambda function
        const myLambda = new lambda.Function(this, 'HelloLamda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
        });

        // 2. Create a API Gateway to trigger the lambda function
        new apigateway.LambdaRestApi(this, 'myAPIgateway', {
            handler: myLambda,
            proxy: true
        })
    }
}
