// complete lambda with version and aliases
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaCompleteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. create a layer
        const utilslayer = new lambda.LayerVersion(this, 'UtilsLayer', {
            layerVersionName: 'MyutilsLayer',
            code: lambda.Code.fromAsset('lambda-layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Common utilities layer'
        });

        // 2. Create function
        const myFunction = new lambda.Function(this, 'MyFunction', {
            functionName: 'MyCustomaLambdaFunction',
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            layers: [utilslayer]
        });

        // 3. create version
        const version = myFunction.currentVersion;

        // 4. create Aliases
        const devAlias = new lambda.Alias(this, 'DevAlias', {
            aliasName: 'dev',
            version: version
        });

        const prodAlias = new lambda.Alias(this, 'ProdAlias', {
            aliasName: 'prod',
            version: version
        });

        // 5. Create API Gateway to Expose lambda
        const api = new apigateway.LambdaRestApi(this, 'MyAPIGateway', {
            restApiName: 'MyLambdaAPI',
            handler: prodAlias,
            proxy: true,
            deployOptions: {
                stageName: 'dev'
            }
        })

        // 6. Add outputs to see the ARNs in the console
        new cdk.CfnOutput(this, 'FunctionArn', {
            value: myFunction.functionArn,
            description: 'Lambda function arn'
        });

        new cdk.CfnOutput(this, 'LayerArn', {
            value: utilslayer.layerVersionArn,
            description: 'Lambda layer Arn'
        });

        new cdk.CfnOutput(this, 'ProdAliasArn', {
            value: prodAlias.functionArn,
            description: 'Production alias Arn'
        })
    }
}