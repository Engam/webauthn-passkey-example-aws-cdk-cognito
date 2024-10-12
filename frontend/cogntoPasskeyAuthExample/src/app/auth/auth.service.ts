import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router
  ) { }

  async signinPsw(username:string, password:string):Promise<any> {
   try {
    const res = await Auth.signIn(username, password);
    return res;
   } catch (error) {
    throw error;
   }
  }

async signinPasskey(username:string):Promise<any> {
  try {
    const res = await Auth.signIn(username);
    const options = JSON.parse(res.challengeParam.publicKeyCredentialRequestOptions);
    const arrayBufferId = this.base64urlToArrayBuffer(options.allowCredentials[0].id);
    options.challenge = this.base64urlToArrayBuffer(options.challenge);
    options.allowCredentials = options.allowCredentials.map((credential:any) => ({
      ...credential,
      id: arrayBufferId,
    }));
    const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;
    const assertionResponse = this.publicKeyCredentialToJSON(assertion);
    const signinres = await Auth.sendCustomChallengeAnswer(res, JSON.stringify(assertionResponse));
    return signinres;
  } catch (error) {
    throw error;
  }
}

  async completeNewPassword(user:any, newPassword:string):Promise<any> {
    return await Auth.completeNewPassword(user, newPassword);
  }


  async isSignedIn():Promise<boolean> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user ? true : false;
    } catch (error) {
      return false;
    }
  }

  async signOut():Promise<void> {
    try {
      await Auth.signOut();
      this.router.navigate(['login']);
    } catch (error) {
      throw error;
    }
  }



  async getIdToken():Promise<string> {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      throw error;
    }
  }

  base64urlToArrayBuffer(base64url:any) {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  publicKeyCredentialToJSON(pubKeyCred:any) {
    if (pubKeyCred instanceof ArrayBuffer) {
      return Array.from(new Uint8Array(pubKeyCred));
    } else if (pubKeyCred instanceof Object) {
      let obj: { [key: string]: any } = {};
      for (const key in pubKeyCred) {
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key]);
      }
      return obj;
    } else {
      return pubKeyCred;
    }
  }

}
