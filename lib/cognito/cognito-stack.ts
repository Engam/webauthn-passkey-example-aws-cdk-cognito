import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NumberAttribute, StringAttribute, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PasskeyAuthStackProps } from '../passkey-auth-stack';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export interface CognitoChildStackProps extends NestedStackProps {
  passkeyTable: Table;
  createAuthChallengeLambda: Function;
  defineAuthChallengeLambda: Function;
  verifyAuthChallengeResponseLambda: Function;
  rpId:string
}

export class CognitoChildStack extends NestedStack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoChildStackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, 'EngamPasskeyAuthUserPool', {
      passwordPolicy: {
        minLength: 16,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      userPoolName: 'EngamPassKeyUserpool',
      selfSignUpEnabled: false,
      signInAliases: {
        phone: true
      },
      autoVerify: {
        phone: true
      },
      lambdaTriggers: {
        createAuthChallenge: props.createAuthChallengeLambda,
        defineAuthChallenge: props.defineAuthChallengeLambda,
        verifyAuthChallengeResponse: props.verifyAuthChallengeResponseLambda
      },
      standardAttributes: {
        phoneNumber: {
          required: true,
          mutable: false
        }
      },
      customAttributes: {
        publicPasskey: new StringAttribute({
          mutable: true
        }),
        passkeyCounter: new NumberAttribute({ 
          mutable: true
        }),
        passkeyId: new StringAttribute({
          mutable: true
        }),
        aaguid: new StringAttribute({
          mutable: true
        }),
        attestation: new StringAttribute({
          mutable: true
        }),
        "public_passkey": new StringAttribute({
          mutable: true
        }),
        "passkey_counter": new NumberAttribute({ 
          mutable: true
        }),
        "passkey_id": new StringAttribute({
          mutable: true
        }),
        "attestation_type": new StringAttribute({
          mutable: true
        })
      }
    })

 

    this.userPoolClient = new UserPoolClient(this, 'EngamPasskeyAuthUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'EngamPasskeyAuthUserPoolClientWeb',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        custom: true,
        userSrp: true,
      },
      accessTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(30),
      idTokenValidity: Duration.minutes(60),
      authSessionValidity: Duration.minutes(3),
      enableTokenRevocation: true,
      disableOAuth: true,
      preventUserExistenceErrors: true,
    })

    // props.createAuthChallengeLambda.addPermission('CreateAuthChallengePermission', {
    //   principal: new ServicePrincipal('cognito-idp.amazonaws.com'),
    //   sourceArn: this.userPool.userPoolArn,
    // });

    // props.defineAuthChallengeLambda.addPermission('DefineAuthChallengePermission', {
    //   principal: new ServicePrincipal('cognito-idp.amazonaws.com'),
    //   sourceArn: this.userPool.userPoolArn,
    // });

    // props.verifyAuthChallengeResponseLambda.addPermission('VerifyAuthChallengeResponsePermission', {
    //   principal: new ServicePrincipal('cognito-idp.amazonaws.com'),
    //   sourceArn: this.userPool.userPoolArn,
    // });

  }
}