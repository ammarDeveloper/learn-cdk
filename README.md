# Get started with your CDK Lambda Project

This project demonstrates how to use the AWS Cloud Development Kit (CDK) to deploy a simple Lambda function written in JavaScript, triggered by an API Gateway. The CDK app is written in TypeScript.

---

## **Prerequisites**

Before you begin, ensure you have the following installed:

1. **Node.js** (includes npm):  
   Download from [nodejs.org](https://nodejs.org/). Verify with:
   ```bash
   node --version
   npm --version
   ```

2. **AWS CLI**:  
   Install and configure the AWS CLI by following the [official guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Then run:
   ```bash
   aws configure
   ```
   Provide your AWS access key, secret key, region (e.g., `us-east-1`), and default output format.

3. **AWS CDK**:  
   Install the CDK CLI globally:
   ```bash
   npm install -g aws-cdk
   ```
   Verify the installation:
   ```bash
   cdk --version
   ```

---

## **Project Setup**

1. Clone this repository or create a new folder for your project:
   ```bash
   mkdir my-first-cdk-lambda && cd my-first-cdk-lambda
   ```

2. Initialize a CDK project in TypeScript:
   ```bash
   cdk init app --language typescript
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

---

## **Project Structure**

```
my-first-cdk-lambda/
├── lambda/
│   └── index.js          # Lambda function code (JavaScript)
├── lib/
│   └── my-first-cdk-lambda-stack.ts  # CDK stack definition (TypeScript)
├── bin/
│   └── my-first-cdk-lambda.ts        # CDK app entrypoint
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── cdk.json              # CDK configuration
└── README.md             # This file
```

---

## **Lambda Function**

The Lambda function is written in JavaScript and located in the `lambda/index.js` file. It returns a simple "Hello from my first Lambda function!" message.

```javascript
// lambda/index.js
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from my first Lambda function!"),
  };
  return response;
};
```

---

## **CDK Stack**

The CDK stack is defined in `lib/my-first-cdk-lambda-stack.ts`. It creates:
1. A Lambda function using the code in the `lambda` folder.
2. An API Gateway to trigger the Lambda function.

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class MyFirstCdkLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const myLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_18_X, // Node.js 18.x
      handler: 'index.handler', // File is "index.js", function is "handler"
      code: lambda.Code.fromAsset('lambda'), // Path to the Lambda folder
    });

    // Create an API Gateway to trigger the Lambda
    new apigateway.LambdaRestApi(this, 'MyApiGateway', {
      handler: myLambda,
    });
  }
}
```

---

## **Deploy the Stack**

1. **Synthesize the CloudFormation template** (optional):
   ```bash
   cdk synth
   ```

2. **Bootstrap your AWS account** (only needed once per account/region):
   ```bash
   cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```
   Replace `ACCOUNT-NUMBER` with your AWS account ID and `REGION` (e.g., `us-east-1`).

3. **Deploy the stack**:
   ```bash
   cdk deploy
   ```
   Confirm the deployment by typing `y` when prompted.

4. After deployment, the terminal will output the API Gateway URL. It will look like:
   ```
   ✅ MyFirstCdkLambdaStack

   Outputs:
   MyFirstCdkLambdaStack.MyApiGatewayEndpoint1234ABCD = https://xxxx.execute-api.REGION.amazonaws.com/prod/
   ```

---

## **Test the Lambda Function**

1. Open the API Gateway URL in a browser or use `curl`:
   ```bash
   curl https://xxxx.execute-api.REGION.amazonaws.com/prod/
   ```
   You’ll see the response:
   ```json
   "Hello from my first Lambda function!"
   ```

---

## **Clean Up**

To delete the Lambda function, API Gateway, and all associated resources:
```bash
cdk destroy
```

---

## **Troubleshooting**

1. **"Cannot find module 'aws-cdk-lib'"?**  
   Run:
   ```bash
   npm install aws-cdk-lib
   ```

2. **Lambda code not updating?**  
   After updating `lambda/index.js`, redeploy with:
   ```bash
   cdk deploy
   ```

---

## **Next Steps**

- Add more Lambda functions or resources to the stack.
- Explore other AWS services supported by the CDK.
- Use CDK constructs to simplify complex architectures.

---

Enjoy building with AWS CDK! 🚀

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

Here’s a `README.md` file for your CDK project. It provides an overview of the project, instructions for setup, deployment, and cleanup, and a brief explanation of the project structure.

---
