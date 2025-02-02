# AWS CDK Lambda Example

This project demonstrates how to use AWS CDK to create and manage AWS Lambda functions, layers, versions, and aliases. It also includes an API Gateway to expose the Lambda functions as RESTful APIs.

## Table of Contents

- [AWS CDK Lambda Example](#aws-cdk-lambda-example)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Step-by-Step Guide](#step-by-step-guide)
    - [1. Basic Lambda Function](#1-basic-lambda-function)
      - [Key Features:](#key-features)
      - [Code Example:](#code-example)
    - [2. Lambda Function with Layer](#2-lambda-function-with-layer)
      - [Key Features:](#key-features-1)
      - [Code Example:](#code-example-1)
    - [3. Complete Lambda Function with Version, Aliases, and API Gateway](#3-complete-lambda-function-with-version-aliases-and-api-gateway)
      - [Key Features:](#key-features-2)
      - [Code Example:](#code-example-2)
  - [Definitions](#definitions)
  - [Deployment](#deployment)
  - [Cleanup](#cleanup)
  - [Conclusion](#conclusion)

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) installed

---

## Project Structure

```
my-lambda-project/
│
├── bin/
│   └── my-lambda-project.ts                 # CDK App entry point
│
├── lib/
│   ├── basic-lambda-stack.ts               # Basic Lambda stack
│   ├── lambda-with-layer-stack.ts          # Lambda with Layer stack
│   └── lambda-complete-stack.ts            # Complete Lambda stack with versions
│
├── lambda/                                 # Lambda function code
│   ├── index.ts                           # Main Lambda handler
│   └── package.json                       # Lambda dependencies
│
├── lambda-layer/                          # Lambda Layer code
│   └── nodejs/                            # Node.js specific folder
│       ├── utils.ts                       # Utility functions
│       └── package.json                   # Layer dependencies
│
├── test/                                  # Test files
│   └── lambda.test.ts                     # Tests for Lambda stacks
│
├── cdk.json                               # CDK configuration
├── package.json                           # Project dependencies
├── tsconfig.json                          # TypeScript configuration
└── README.md                              # Project documentation
```

---

## Step-by-Step Guide

### 1. Basic Lambda Function

The `BasicLambdaStack` creates a simple Lambda function with Node.js runtime. This stack demonstrates the creation of a Lambda function with basic configurations like memory size, timeout, and environment variables.

#### Key Features:
- **Runtime**: Node.js 20.x
- **Handler**: `index.handler`
- **Code**: Located in the `lambda` directory
- **Environment Variables**: `ENVIRONMENT: development`

#### Code Example:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class BasicLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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
```

---

### 2. Lambda Function with Layer

The `LambdaWithLayerStack` creates a Lambda function that uses a **Lambda Layer**. A Lambda Layer is a reusable component that can be shared across multiple Lambda functions. This stack demonstrates how to create a layer and attach it to a Lambda function.

#### Key Features:
- **Layer**: Contains utility functions (`utils.js`) for formatting responses and validating inputs.
- **API Gateway**: Exposes the Lambda function as a REST API.

#### Code Example:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as api from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaWithLayerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const utilsLayer = new lambda.LayerVersion(this, 'UtilsLayer', {
            code: lambda.Code.fromAsset('lambda-layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Common utilities layer'
        });

        const functionWithLayer = new lambda.Function(this, 'FunctionWithLayer', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            layers: [utilsLayer],
            environment: {
                ENVIRONMENT: 'development'
            }
        });

        const gateway = new api.LambdaRestApi(this, 'LambdaAPI', {
            handler: functionWithLayer,
            proxy: true,
            deployOptions: {
                stageName: 'dev'
            }
        });
    }
}
```

---

### 3. Complete Lambda Function with Version, Aliases, and API Gateway

The `LambdaCompleteStack` demonstrates advanced Lambda features, including **versions**, **aliases**, and integration with **API Gateway**. 

#### Key Features:
- **Versions**: Immutable snapshots of a Lambda function.
- **Aliases**: Pointers to specific versions (e.g., `dev` and `prod`).
- **API Gateway**: Exposes the Lambda function with a production alias.

#### Code Example:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaCompleteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const utilslayer = new lambda.LayerVersion(this, 'UtilsLayer', {
            layerVersionName: 'MyutilsLayer',
            code: lambda.Code.fromAsset('lambda-layer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Common utilities layer'
        });

        const myFunction = new lambda.Function(this, 'MyFunction', {
            functionName: 'MyCustomaLambdaFunction',
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            layers: [utilslayer]
        });

        const version = myFunction.currentVersion;

        const devAlias = new lambda.Alias(this, 'DevAlias', {
            aliasName: 'dev',
            version: version
        });

        const prodAlias = new lambda.Alias(this, 'ProdAlias', {
            aliasName: 'prod',
            version: version
        });

        const api = new apigateway.LambdaRestApi(this, 'MyAPIGateway', {
            restApiName: 'MyLambdaAPI',
            handler: prodAlias,
            proxy: true,
            deployOptions: {
                stageName: 'dev'
            }
        });

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
        });
    }
}
```

---

## Definitions

1. **Lambda Function**: A serverless compute service that runs your code in response to events.
2. **Lambda Layer**: A reusable component that can include libraries, custom runtimes, or other dependencies.
3. **Version**: An immutable snapshot of a Lambda function's code and configuration.
4. **Alias**: A pointer to a specific version of a Lambda function, allowing you to manage environments like `dev` and `prod`.
5. **API Gateway**: A fully managed service to create, publish, and secure RESTful APIs.

---

## Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Bootstrap the CDK (if not already done):
   ```bash
   cdk bootstrap
   ```

3. Deploy the stacks:
   ```bash
   cdk deploy
   ```

4. After deployment, you will see the ARNs of the Lambda function, layer, and production alias in the console.

---

## Cleanup

To avoid incurring charges, clean up the resources created by the CDK:
```bash
cdk destroy
```

This will delete all the resources created by the CDK stacks.

---

## Conclusion

This project provides a comprehensive example of how to use AWS CDK to manage Lambda functions, layers, versions, and aliases. It also demonstrates how to expose Lambda functions via API Gateway. You can extend this example to suit your specific use cases.