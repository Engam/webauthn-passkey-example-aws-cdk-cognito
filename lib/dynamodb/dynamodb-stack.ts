import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { PasskeyAuthStackProps } from '../passkey-auth-stack';


export interface DynamodbChildStackProps extends NestedStackProps {
  rpId:string;
}
export class DynamodbChildStack extends NestedStack {

  passkeyTable:Table;

  constructor(scope: Construct, id: string, props: DynamodbChildStackProps) {
    super(scope, id, props);

    this.passkeyTable = new Table(this, 'PasskeyTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });
  }
}