
import { webcrypto } from 'crypto';
import crypto from 'crypto';

export const handler = async (event) => {
  try {
    
    if (!event.request.session || event.request.challengeName !== 'CUSTOM_CHALLENGE') {
      throw new Error("NO SESSION OR NO CUSTOM CHALLENGE");
    }
    // get the passkey id to guid the user to the correct passkey to signin with;
    const userAttributes = event.request.userAttributes;
    const passkey_id = userAttributes['custom:passkey_id'];
    if (!passkey_id) return event;

    event.response.challengeMetadata = 'PASSKEY';
    
    // create the challenge
    const challenge = crypto.randomBytes(32).toString('base64url');
    const rpId = process.env.RP_ID
    
    // create the public key credential request options
    const publicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials: [{
          type: 'public-key',
          id: passkey_id,
      }],
      timeout: 60000,
      userVerification: 'preferred',
      rpId: rpId,
    };
    event.response.privateChallengeParameters = {
      challenge: challenge,
    };
    event.response.publicChallengeParameters = {
      publicKeyCredentialRequestOptions: JSON.stringify(publicKeyCredentialRequestOptions),
    };
    return event;
  } catch (error) {
      console.error("E1: ", error);
      throw error;
  }
};
