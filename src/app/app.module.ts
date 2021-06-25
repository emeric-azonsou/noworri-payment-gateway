import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PhoneNumberComponent } from './views/phone-number/phone-number.component';
import { PhoneVerificationComponent } from './views/phone-verification/phone-verification.component';
import { PayementComponent } from './views/payement/payement.component';
import { PayementOptionComponent } from './views/payement-option/payement-option.component';
import { OtpToProceedComponent } from './views/otp-to-proceed/otp-to-proceed.component';
import { EmptyUserPageComponent } from './views/empty-user-page/empty-user-page.component';
import { HeaderComponent } from './views/header/header.component';
import { NgOtpInputModule } from  'ng-otp-input';
import { IntlTelInputNgModule } from 'intl-tel-input-ng';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    PhoneNumberComponent,
    PhoneVerificationComponent,
    PayementComponent,
    PayementOptionComponent,
    OtpToProceedComponent,
    EmptyUserPageComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOtpInputModule,
    IntlTelInputNgModule.forRoot(),
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
