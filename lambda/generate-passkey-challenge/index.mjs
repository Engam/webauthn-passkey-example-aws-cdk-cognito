
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
*/
export const handler = async (event) => {
  try {
    if (event.path !== '/generate') throw new Error("INVALID_PATH");
    if (event.httpMethod !== 'GET') throw new Error("INVALID_METHOD");
    if (!event.requestContext?.authorizer?.claims) throw new Error("NO_IDENTITY");

    const identity = event.requestContext.authorizer.claims;

    const userId = identity.sub;
    if (!userId) throw new Error("NO IDENTITY FOUND");

    const phoneNumber = identity.phone_number;
    
    const challenge = crypto.randomBytes(32).toString('base64url');
    const challengeId = uuid();

    const userIdBuffer = Buffer.from(userId, 'utf8');
    const userIdBase64Url = userIdBuffer.toString('base64url');

    const rpId = process.env.RP_ID;

    const options = {
      challenge: challenge,
      rp: {
        name: "Engam passkey example",
        id: rpId
      },
      user: {
        id: userIdBase64Url,
        name: phoneNumber,
        displayName: phoneNumber
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7
        },
        {
          type: "public-key",
          alg: -257
        }
      ],
      authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred"
      },
      timeout: 60000,
      excludeCredentials: [],
      attestation: "none"
    };
    await createChallenge(userId, { challenge: challenge, challengeId: challengeId, ttl: Math.floor(Date.now() / 1000) + 300 });
    
    const returnval =  JSON.stringify({
      options,
      challengeId
    })
    return {
      statusCode: 200,
      body: returnval,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  } catch(error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

const createChallenge = async (userId, challenge) => {
  try {   

    await docClient.send(new PutCommand({
      TableName: process.env.PASSKEY_TABLE_NAME,
      Item: {
        id: challenge.challengeId,
        ttl: challenge.ttl,
        challenge: challenge.challenge,
        userId: userId
      }
    }))
    return;

  } catch(error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
}