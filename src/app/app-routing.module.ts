import { PhoneVerificationComponent } from './views/phone-verification/phone-verification.component';
import { EmptyUserPageComponent } from './views/empty-user-page/empty-user-page.component';
import { OtpToProceedComponent } from './views/otp-to-proceed/otp-to-proceed.component';
import { PayementOptionComponent } from './views/payement-option/payement-option.component';
import { PayementComponent } from './views/payement/payement.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhoneNumberComponent } from './views/phone-number/phone-number.component';

const routes: Routes = [
  {
    path: '',
    component: PhoneNumberComponent
  },
  {
    path: 'phone-verfication',
    component: PhoneVerificationComponent
  },
  {
    path: 'payements',
    component: PayementComponent
  },
  {
    path: 'payement-option',
    component: PayementOptionComponent
  },
  {
    path: "otp-to-proceed",
    component: OtpToProceedComponent
  },
  {
    path: 'empty',
    component: EmptyUserPageComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
