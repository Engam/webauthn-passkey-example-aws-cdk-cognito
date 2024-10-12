import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { AuthService } from '../auth/auth.service';



export const authenticationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const signedIn = await authService.isSignedIn();
  if (!signedIn) {
    router.navigate(['/login']);
    return false;
  }
  return true;
  
};

