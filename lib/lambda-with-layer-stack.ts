import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as api from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaWithLayerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create a lambda layer
        const utilsLayer = new lambda.LayerVersion(this, 'UtilsLayer', {
            code: lambda.Code.fromAsset('lambda-layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Common utilities layer'
        });

        // 2. Create lambda function using the layer
        const functionWithLayer = new lambda.Function(this, 'FunctionWithLayer', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            layers: [utilsLayer],
            environment: {
                ENVIRONMENT: 'development'
            }
        });

        // 3. create an API Gateway REST API that triggers the lambda function
        const gateway = new api.LambdaRestApi(this, 'LambdaAPI', {
            handler: functionWithLayer,
            proxy: true,
            deployOptions: {
                stageName: 'dev'
            }
        })
    }
}