import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { USER_API_KEY, USER_DATA_KEY } from 'src/app/models/constants';
import { BusinessTransactionData } from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss']
})
export class PhoneVerificationComponent implements OnInit,  OnDestroy {
  unsubscribe$ = new Subject();
  user_api_key: string;
  errorMessage?: string;
  hasError = false;
  otp?: string;

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 5,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      width: '50px',
      height: '50px',
    },
  };
  userData: any;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private loader: NgxUiLoaderService
  ) {
    this.user_api_key = sessionStorage.getItem(USER_API_KEY) as string;
    const data = JSON.parse(sessionStorage.getItem(USER_DATA_KEY) as string);
    this.userData = data;
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  onSubmitCode() {
    this.loader.start();
    this.paymentService
      .verifyUser(this.otp, this.user_api_key)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        if (response['status'] === 200) {
          this.loader.stop();
          this.router.navigate(['/process-payment'])
        } else {
          this.loader.stop();
          this.hasError = true;
          this.errorMessage = response['message'];
        }
      });
  }
}
