import { Component } from '@angular/core';
import { PasskeyRegistrationComponent } from '../../components/passkey-registration/passkey-registration.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home-route',
  standalone: true,
  imports: [
    PasskeyRegistrationComponent
  ],
  templateUrl: './home-route.component.html',
  styleUrl: './home-route.component.scss'
})
export class HomeRouteComponent {

  constructor(
    private auth: AuthService
  ) { }

  logout():void {
    this.auth.signOut();
  }
}
