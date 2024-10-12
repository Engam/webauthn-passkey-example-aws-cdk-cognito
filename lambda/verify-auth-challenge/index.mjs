
import { webcrypto } from 'crypto';
import crypto from 'crypto';

import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import base64url from 'base64url';

const rpId = process.env.RP_ID;
const origin = process.env.RP_ID === 'localhost' ? 'http://' + rpId + ':4200' : 'https://' +rpId

export const handler = async (event) => {
  event.response.answerCorrect = false;
  if (!event.request.userAttributes['custom:public_passkey'] || !event.request.userAttributes['custom:passkey_id']) {
    return event;
  }
  return await handlePasskey(event);
}

const arrayToBuffer = (array) => {
  return Buffer.from(array);
}

const handlePasskey = async (event) => {
  const expectedOrigin = origin;
  const expectedRPID = rpId
  const expectedChallenge = event.request.privateChallengeParameters.challenge;
  const assertion = JSON.parse(event.request.challengeAnswer);

  if (assertion.response.userHandle) {
    assertion.response.userHandle = arrayToBuffer(assertion.response.userHandle);
  }

  const storedCredentialPublicKey = event.request.userAttributes['custom:public_passkey'];
  const credentialPublicKey = base64url.toBuffer(storedCredentialPublicKey);

  const storedCredentialId = event.request.userAttributes['custom:passkey_id'];

  const credentialIdFromAssertion = base64url.encode(assertion.rawId);
  if (storedCredentialId !== credentialIdFromAssertion) {
    console.error('Credential ID does not match the assertion ID');
  }

  assertion.rawId = base64url.encode(assertion.rawId);
  assertion.response.clientDataJSON = Buffer.from(assertion.response.clientDataJSON).toString('base64url');
  assertion.response.authenticatorData = Buffer.from(assertion.response.authenticatorData).toString('base64url');
  assertion.response.signature = Buffer.from(assertion.response.signature).toString('base64url');

  if (assertion.response.userHandle) {
    assertion.response.userHandle = assertion.response.userHandle.toString('base64url');
  }
  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge: expectedChallenge,
    expectedOrigin: expectedOrigin,
    expectedRPID: expectedRPID,
    authenticator: {
      credentialPublicKey,
      credentialID: storedCredentialId,
      counter: 0
    },
    requireUserVerification: true,
  });

  // alse you should implement counter protection. VerificationResponse will return a new counter (iphone/mac will always return 0), and you should store the counter
  // on the cognito user or in a database and check it on the next verification. If the counter is lower than the stored counter, the verification should fail.


  if (verification.verified === true) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event
}
