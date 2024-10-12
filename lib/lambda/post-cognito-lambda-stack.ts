import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PasskeyAuthStackProps } from '../passkey-auth-stack';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export interface LambdaChildStackProps extends NestedStackProps {
  passkeyTable: Table;
  rpId:string;
  region:string;
  userpool: UserPool;
}

export class PostCognitoLambdaChildStack extends NestedStack {
  public readonly generatePasskeyChallengeLambda: Function;
  public readonly verifyPasskeyChallengeResponseLambda: Function

  constructor(scope: Construct, id: string, props: LambdaChildStackProps) {
    super(scope, id, props);

    this.generatePasskeyChallengeLambda = new Function(this, 'GeneratePasskeyChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/generate-passkey-challenge'),
      environment: {
        "RP_ID": props.rpId,
        "PASSKEY_TABLE_NAME": props.passkeyTable.tableName
      }
    })

    this.verifyPasskeyChallengeResponseLambda = new Function(this, 'VerifyPasskeyChallengeResponseLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/verify-passkey-generation'),
      environment: {
        "RP_ID": props.rpId,
        "USERPOOL_ID": props.userpool.userPoolId,
        "PASSKEY_TABLE_NAME": props.passkeyTable.tableName,
        "REGION": props.region
      }
    })

    props.passkeyTable.grantReadWriteData(this.generatePasskeyChallengeLambda);
    props.passkeyTable.grantReadWriteData(this.verifyPasskeyChallengeResponseLambda);
    props.userpool.grant(this.verifyPasskeyChallengeResponseLambda, 'cognito-idp:AdminUpdateUserAttributes');

  }
}