import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

enum LoginState {
  INIT = 'INIT',
  LOADING = 'LOADING',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

enum LoginType {
  PASSWORD = 'PASSWORD',
  PASSKEY = 'PASSKEY'
}

@Component({
  selector: 'app-login-route',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login-route.component.html',
  styleUrl: './login-route.component.scss'
})
export class LoginRouteComponent {
  
  state:LoginState = LoginState.INIT;
  LoginStates = LoginState;

  showPassword:boolean = false;
  loginType = LoginType.PASSKEY;
  LoginTypes = LoginType;

  phoneNumber:string = '';
  password:string = '';
  newPassword:string = '';
  
  user:any;

  @ViewChild('usernameInput') usernameInput?: ElementRef;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.state = LoginState.INIT;
  }

  login():void {
    if (this.loginType === LoginType.PASSWORD) {
      this.loginPsw();
    } else if (this.loginType === LoginType.PASSKEY) {
      this.loginPasskey();
    }
  }

  async loginPsw():Promise<void> {
    try {
      this.state = LoginState.LOADING;
      if (!this.phoneNumber || this.phoneNumber.length < 8) return this.handleError('Invalid phone number');
      const res = await this.auth.signinPsw('+47' + this.phoneNumber, this.password);
      this.user = res;
      if (res && res.challengeName === 'NEW_PASSWORD_REQUIRED') {
        this.state = LoginState.NEW_PASSWORD_REQUIRED;
        return;
      }
      this.state = LoginState.SUCCESS;
      this.router.navigate(['']);


    } catch (error) {
      console.error(error);
      this.handleError("Failed to login with password");
    }
  }

  async loginPasskey():Promise<void> {
    try {
      this.state = LoginState.LOADING;
      if (!this.phoneNumber || this.phoneNumber.length < 8) return this.handleError('Invalid phone number');
      const res = await this.auth.signinPasskey('+47' + this.phoneNumber);
      this.user = res;
      this.router.navigate(['']);
    } catch (error) {
      console.error(error);
      this.handleError("Failed to login with passkey");
    }
  }

  async completeNewPassword():Promise<void> {
    try {
      this.state = LoginState.LOADING;
      const res = await this.auth.completeNewPassword(this.user, this.newPassword);
      this.state = LoginState.SUCCESS;
      this.router.navigate(['']);
    } catch (error) {
      this.handleError("Failed to complete new password");
    }
  }

  


  handleError(message:string):void {
    this.state = LoginState.ERROR;
    console.error(message);
  }

  focusUsernameInput():void {
    if (this.usernameInput) {
      this.usernameInput.nativeElement.focus();
      return;
    }
    console.error('usernameInput not found');

  }

  changeLoginType( ) {
    this.loginType  = this.showPassword ? LoginType.PASSWORD : LoginType.PASSKEY;
  }
}
