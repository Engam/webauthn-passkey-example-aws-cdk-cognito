import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PasskeyAuthStackProps } from '../passkey-auth-stack';

export interface LambdaChildStackProps extends NestedStackProps {
  passkeyTable: Table;
  rpId:string;
  region:string;
}

export class LambdaChildStack extends NestedStack {
  public readonly createAuthChallengeLambda: Function;
  public readonly defineAuthChallengeLambda: Function;
  public readonly verifyAuthChallengeResponseLambda: Function

  constructor(scope: Construct, id: string, props: LambdaChildStackProps) {
    super(scope, id, props);

    this.createAuthChallengeLambda = new Function(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/create-auth-challenge'),
      environment: {
        "RP_ID": props.rpId
      }
    });

    this.defineAuthChallengeLambda = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/define-auth-challenge'),
    });

    this.verifyAuthChallengeResponseLambda = new Function(this, 'VerifyAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/verify-auth-challenge'),
      environment: {
        "RP_ID": props.rpId
      }
    });



  }
}