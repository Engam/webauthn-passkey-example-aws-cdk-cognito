import { Component } from '@angular/core';
import { PasskeyRegistrationService } from '../../services/passkey-registration.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-passkey-registration',
  standalone: true,
  imports: [

  ],
  templateUrl: './passkey-registration.component.html',
  styleUrl: './passkey-registration.component.scss'
})
export class PasskeyRegistrationComponent {

  registering:boolean = false;
  
  constructor(
    private service: PasskeyRegistrationService,
    private auth: AuthService,
  ) { }

  async register():Promise<void> {
    try {
      this.registering = true;
      await this.service.register();
      await this.auth.signOut();
    } catch (error) {
      console.error(error);
      this.registering = false;
    }
  }



}
