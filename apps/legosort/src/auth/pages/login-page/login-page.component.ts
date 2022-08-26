import { Component } from '@angular/core';

import { NavigationExtras, Router } from '@angular/router';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LoginData } from 'apps/legosort/src/app/interfaces/legosort.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'legosort-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent  {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}


  login(loginData: LoginData) {
    this.authService
      .login(loginData)
      .then(loginData => {
        const userName = loginData.user.email?.split('@')[0];
        const userState: NavigationExtras = { state: { userName } };

        console.log('biddie', userName);
        this.router.navigate(['/partfinder'], userState)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => console.log(e.message));
  }
}
