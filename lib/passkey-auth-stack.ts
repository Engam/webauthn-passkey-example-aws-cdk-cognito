import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoChildStack } from './cognito/cognito-stack';
import { DynamodbChildStack } from './dynamodb/dynamodb-stack';
import { LambdaChildStack } from './lambda/lambda-stack';
import { APIChildStack } from './api/api-stack';
import { PostCognitoLambdaChildStack } from './lambda/post-cognito-lambda-stack';

export interface PasskeyAuthStackProps extends cdk.StackProps {
  rpId: string;
  region: string;
}

export class PasskeyAuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PasskeyAuthStackProps) {
    super(scope, id, props);

    const dynamodb = new DynamodbChildStack(this, 'DynamoDBChildStack', props);

    const authTriggerLambdas = new LambdaChildStack(this, 'LambdaChildStack', {
      ...props,
      passkeyTable: dynamodb.passkeyTable,
      region: props.region,
    })

    const cognito = new CognitoChildStack(this, 'CognitoChildStack', {
      ...props,
      passkeyTable: dynamodb.passkeyTable,
      createAuthChallengeLambda: authTriggerLambdas.createAuthChallengeLambda,
      defineAuthChallengeLambda: authTriggerLambdas.defineAuthChallengeLambda,
      verifyAuthChallengeResponseLambda: authTriggerLambdas.verifyAuthChallengeResponseLambda
    });

    const postCognitoLambdas = new PostCognitoLambdaChildStack(this, 'PostCognitoLambdaChildStack', {
      ...props,
      passkeyTable: dynamodb.passkeyTable,
      userpool: cognito.userPool,
      region: props.region
    })


    const api = new APIChildStack(this, 'APIChildStack', {
      ...props,
      generatePasskeyLambda: postCognitoLambdas.generatePasskeyChallengeLambda,
      verifyPasskeyLambda: postCognitoLambdas.verifyPasskeyChallengeResponseLambda,
      userpool: cognito.userPool
    })
  }
}

