
# WebAuthn/Passkey Example

A simple example demonstrating the use of WebAuthn/Passkeys as a sign-in option for AWS Cognito.
This example is built using aws cdk.

## Prerequisites
Ensure you have the following tools installed:
- AWS CLI
- AWS CDK CLI
- Angular CLI

## Install Dependencies
Install the necessary dependencies for all Lambda functions located in the `./lambda` folder, as well as for the Angular frontend example.

### Lambda Functions:
Navigate to each Lambda directory and run:
```bash
npm install
```

### Angular Frontend:
For the Angular frontend example, install dependencies by running:
```bash
npm install
```

## Deploying the CDK Stack
Follow these steps to deploy the CDK resources:

1. **Sign in to AWS**:  
   Log in to your AWS account and create an IAM user with Administrator Access (if you don't already have one).

2. **Configure AWS CLI**:  
   Use the AWS CLI to configure a profile:
   ```bash
   aws configure --profile default
   ```

3. **Bootstrap the CDK Environment**:  
   Run the following command to bootstrap the CDK environment:
   ```bash
   cdk bootstrap
   ```

4. **Deploy the CDK Stack**:  
   Deploy the stack by running:
   ```bash
   cdk deploy
   ```

## Angular Frontend Example

To run the Angular frontend example:

1. **Install Angular CLI Globally**:
   ```bash
   npm install -g @angular/cli
   ```

2. **Serve the Application**:  
   Run the development server:
   ```bash
   ng serve
   ```

## Configuring Passkey rpId
By default, the `rpId` for Passkeys is set to `localhost`. If you wish to test in a production environment, change the `rpId` to match your domain.

## Cleanup Resources
To clean up the resources after testing:

1. Destroy the CDK stack:
   ```bash
   cdk destroy
   ```

2. Delete or modify the IAM user you created for the deployment, as needed.