import { webcrypto } from 'crypto';

// globalThis.crypto = require('crypto').webcrypto;

import  { verifyRegistrationResponse } from '@simplewebauthn/server';
import { AdminUpdateUserAttributesCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


export const handler = async (event) => {
  try {
    if (event.path !== '/verify') throw new Error("INVALID_PATH");
    if (event.httpMethod !== 'POST') throw new Error("INVALID_METHOD");
    if (!event.requestContext?.authorizer?.claims) throw new Error("NO_IDENTITY");

    const identity = event.requestContext.authorizer.claims;
    const body = JSON.parse(event.body);
    if (!body) throw new Error("NO_BODY");
    const userId = identity.sub;
    if (!userId) throw new Error('NO IDENTITY FOUND');

    // Extract credential and challengeId directly from event.arguments
    const { credential: credentialString, challengeId} = body
    const credential = credentialString

    if (!credential || !challengeId) {
      throw new Error('Missing credential or challengeId in arguments');
    }

    // Retrieve the expected challenge using challengeId
    const expectedChallenge = await getChallenge(challengeId);
    if (!expectedChallenge) throw new Error('No challenge found');

    // Set expectedOrigin and expectedRPID based on environment
    const expectedRPID = process.env.RP_ID || 'localhost';
    const expectedOrigin = expectedRPID === 'localhost' ? 'http://localhost:4200' : `https://${expectedRPID}`;

    // verify the passkey
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: expectedChallenge,
      expectedOrigin: expectedOrigin,
      expectedRPID: expectedRPID,
    });

    if (verification.verified) {
      const {
        credentialPublicKey,
        credentialID,
        counter,
        fmt,
        aaguid,
      } = verification.registrationInfo;
      const publicKeyBase64url = Buffer.from(credentialPublicKey).toString('base64url');
      const credentialIdBase64url = credential.id;
      
      // save to cognito user
      const params = {
        UserPoolId: process.env.USERPOOL_ID,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:public_passkey',
            Value: publicKeyBase64url,
          },
          {
            Name: 'custom:passkey_id',
            Value: credentialIdBase64url,
          },
          {
            Name: 'custom:attestation_type',
            Value: fmt,
          },
          {
            Name: 'custom:aaguid',
            Value: aaguid,
          },
          {
            Name: 'custom:passkey_counter',
            Value: counter.toString(),
          }
        ]
      };
      const cmd = new AdminUpdateUserAttributesCommand(params);
      await cognitoClient.send(cmd);

      // Delete the challenge after successful verification
      await deleteChallenge(challengeId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          verified: true,
          message: 'Successfully verified',
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }

    } else {
      // Delete the challenge even if verification fails
      await deleteChallenge(challengeId);
      throw new Error('Verification failed');
    }
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    throw error;
  }
};

const getChallenge = async (challengeId) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: process.env.PASSKEY_TABLE_NAME,
      Key: {
        id: challengeId,
      }
    }));

    const item = result.Item;
    if (!item || !item.challenge || !item.ttl) {
      throw new Error('No challenge found or challenge is invalid');
    }

    if (ttlHasExpired(item.ttl)) {
      throw new Error('Challenge has expired');
    }

    return item.challenge;
  } catch (error) {
    console.error(`getChallenge ERROR: ${error.message}`);
    throw new Error('Error getting challenge');
  }
};


const deleteChallenge = async (challengeId) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: process.env.PASSKEY_TABLE_NAME,
      Key: {
        id: challengeId,
      }
    }));
    return;
  } catch (error) {
    console.error(`deleteChallenge ERROR: ${error.message}`);
    return;
  }
};

const ttlHasExpired = (ttl) => {
  return Math.floor(Date.now() / 1000) > ttl;
};
