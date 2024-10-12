import { NestedStack, NestedStackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';

import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { CognitoUserPoolsAuthorizer, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi } from 'aws-cdk-lib/aws-apigateway';

export interface APIChildStackProps extends NestedStackProps {
  generatePasskeyLambda: Function;
  verifyPasskeyLambda: Function;
  userpool: UserPool;
  rpId:string;
}
export class APIChildStack extends NestedStack {

  constructor(scope: Construct, id: string, props: APIChildStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'PasskeyAuthAPI', {
      restApiName: 'PasskeyGenerationAPI',
      description: 'This service generates and verifies passkeys',
      deployOptions: {
        stageName: 'dev'
      },
    })

    const authorizer = new CognitoUserPoolsAuthorizer(this, 'PasskeyAuthAPIAuthorizer', {
      cognitoUserPools: [props.userpool]
    });

    

    const generateResource = api.root.addResource('generate');
    const generateLambdaIntegration = new LambdaIntegration(props.generatePasskeyLambda);
    const generateMethod = generateResource.addMethod('GET', generateLambdaIntegration, {
      authorizer,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          }
        }
      ]
    });


    const verifyResource = api.root.addResource('verify');
    const verifyLambdaIntegration = new LambdaIntegration(props.verifyPasskeyLambda);
    const verifyMethod = verifyResource.addMethod('POST', verifyLambdaIntegration, {
      authorizer,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
          }
        }
      ]
    });

    /** 
     * you should also add models and response/response templates, usageplan etc
     * to the API Gateway resources
    */

  }
}