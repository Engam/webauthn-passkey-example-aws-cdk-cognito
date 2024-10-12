import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PasskeyRegistrationService {

  constructor(
    private auth:AuthService
  ) { }

  async register():Promise<void> {
    try {
      const {challengeId, options } = await this.getChallenge();
      if (!challengeId || !options) {
        throw new Error('Invalid challenge');
      }

      const publicKeyCredentialCreationOptions = this.preformatMakeCredReq(options); // get the credential options into the correct format for the webauthn api;

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;
      
      const credentialJSON = this.publicKeyCredentialToJSON(credential);
      const verificationResponse = await this.sendVerifiedChallenge(JSON.stringify({
        credential: credentialJSON,
        rawId:credential.rawId,
        challengeId: challengeId
      }));
      if (verificationResponse.verified) {
        return;
      }
      throw new Error('Failed to verify challenge');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendVerifiedChallenge(data:string) {
    try {
      const url = 'https://52qlbq4cfk.execute-api.eu-north-1.amazonaws.com/dev';
      const idtoken = await this.auth.getIdToken();
      const res = await axios.post(url + '/verify', data, {
        headers: {
          Authorization: `Bearer ${idtoken}`
        }
      });
      return res.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }



  async getChallenge() {
    try {
      const url = 'https://52qlbq4cfk.execute-api.eu-north-1.amazonaws.com/dev';
      const idtoken = await this.auth.getIdToken();

      const res = await axios.get(url + '/generate', {
        headers: {
          Authorization: `Bearer ${idtoken}`
        }
      });

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }



  private preformatMakeCredReq(makeCredReq: any) {
    makeCredReq.challenge = this.base64urlToBuffer(makeCredReq.challenge);
    makeCredReq.user.id = this.base64urlToBuffer(makeCredReq.user.id);
  
    if (makeCredReq.excludeCredentials) {
      for (let cred of makeCredReq.excludeCredentials) {
        cred.id = this.base64urlToBuffer(cred.id);
      }
    }
  
    return makeCredReq;
  }

  private base64urlToBuffer(base64urlString: string): ArrayBuffer {
    // Pad the base64 string
    const padLength = (4 - (base64urlString.length % 4)) % 4;
    const paddedString = base64urlString + '='.repeat(padLength);
    const base64String = paddedString.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64String);
    const buffer = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }
    return buffer;
  }

  private publicKeyCredentialToJSON(pubKeyCred: any): any {
    if (Array.isArray(pubKeyCred)) {
      return pubKeyCred.map(item => this.publicKeyCredentialToJSON(item));
    } else if (pubKeyCred instanceof ArrayBuffer) {
      return this.bufferToBase64url(pubKeyCred);
    } else if (pubKeyCred && typeof pubKeyCred === 'object') {
      const obj: any = {};
  
      // Explicitly process known properties
      obj.id = pubKeyCred.id;
      obj.type = pubKeyCred.type;
  
      if (pubKeyCred.rawId) {
        obj.rawId = this.bufferToBase64url(pubKeyCred.rawId);
      }
  
      if (pubKeyCred.response) {
        obj.response = {
          clientDataJSON: this.bufferToBase64url(pubKeyCred.response.clientDataJSON),
          attestationObject: this.bufferToBase64url(pubKeyCred.response.attestationObject),
        };
      }
  
      if (pubKeyCred.authenticatorAttachment !== undefined) {
        obj.authenticatorAttachment = pubKeyCred.authenticatorAttachment;
      }
      if (pubKeyCred.clientExtensionResults !== undefined) {
        obj.clientExtensionResults = pubKeyCred.clientExtensionResults;
      }
      if (pubKeyCred.transports !== undefined) {
        obj.transports = pubKeyCred.transports;
      }
  
      return obj;
    } else {
      return pubKeyCred;
    }
  }
  private bufferToBase64url(buffer:any) {
    // Convert ArrayBuffer to base64url-encoded string
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(buffer)]))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
}
