import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PAYMENT_DATA_KEY, ORDER_DATA_KEY, USER_DATA_KEY, TRANSACTION_DATA_KEY, BUSINESS_DATA_KEY, USER_API_KEY } from 'src/app/models/constants';
import { PaymentData } from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-otp-to-proceed',
  templateUrl: './otp-to-proceed.component.html',
  styleUrls: ['./otp-to-proceed.component.scss']
})
export class OtpToProceedComponent implements OnInit {
  paymentData: PaymentData | undefined;
  reference: string | undefined;
  country: string;
  paymentForm: any;
  digitsRegEx = /^\d+$/;

  unsubscribe$ = new Subject();
  networkList = [
    {
      name: 'MTN',
      code: 'mtn',
    },
    {
      name: 'Vodafone',
      code: 'vod',
    },
    {
      name: 'Airtel/Tigo',
      code: 'tgo',
    },
  ];
  banksList: any;
  bankNames: any;
  isSecuring: boolean = false;
  userData: any;
  userPP: string | undefined;
  hasError: boolean = false;
  errorMessage: string = '';
  checkoutData: any;
  businessData: any;
  orderData: any;
  api_key: string;
  paymentStatus: any;
  otp: any;
  hasPP: boolean;
  constructor(
    route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private loader: NgxUiLoaderService
  ) {
    route.params.pipe(take(1)).subscribe((param) => {
      this.reference = param.transactionKey;
    });
    const paymentData = sessionStorage.getItem(PAYMENT_DATA_KEY);
    const orderData = JSON.stringify(sessionStorage.getItem(ORDER_DATA_KEY));
    const userDataString = sessionStorage.getItem(USER_DATA_KEY) as string;
    const checkout = sessionStorage.getItem(TRANSACTION_DATA_KEY);
    const business = JSON.stringify(sessionStorage.getItem(BUSINESS_DATA_KEY));
    const key = JSON.stringify(sessionStorage.getItem(USER_API_KEY));
    const businessData = JSON.parse(business);
    this.checkoutData = JSON.parse(checkout as string);
    this.userData = JSON.parse(userDataString);
    this.paymentData = JSON.parse(paymentData as string);
    this.businessData = businessData;
    this.orderData = JSON.parse(orderData);
    this.api_key = key ? JSON.parse(key) : undefined;
    if (this.paymentData?.currency === 'GHS' || !this.paymentData?.currency) {
      this.country = 'Ghana';
    } else {
      this.country = 'Nigeria';
    }

    if(this.userData.photo) {
      this.userPP =  `https://noworri.com/api/public/uploads/images/pp/${this.userData.photo}`;
      this.hasPP = true;
    } else {
      this.hasPP = false;
    }
   }

  ngOnInit(): void {
    
  }


  checkSuccessSecuredFunds(ref: string | undefined) {
      setTimeout(() => {
        this.paymentService
          .checkTransactionStatus(ref)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((statusData) => {
            console.log('status.data', statusData);
            if (statusData.data && statusData.data.status === 'success') {
              this.createTransaction();
            } else {
              this.checkSuccessSecuredFunds(statusData.data.reference);
            }
          });
      }, 5000);
  }

  createTransaction() {
    this.checkoutData['payment_id'] = this.reference;
    this.checkoutData['price'] = Number(this.paymentData?.amount).toFixed(2);
    this.checkoutData['name'] = this.businessData.trading_name;
    this.checkoutData['items'] = this.paymentData;
    this.paymentService
      .createTransaction(
        this.checkoutData,
        this.api_key,
        this.isTestTransaction
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (transaction: any) => {
          if (transaction) {
            this.loader.stop();
            const paymentData = this.paymentData;
            const order = JSON.stringify(paymentData);
            const callbackUrl = `${this.checkoutData.callback_url}?reference=${this.reference}&order_id=${this.checkoutData.order_id}&order-data=${order}`;
            window.location.replace(callbackUrl);
          } else {
            this.loader.stop();
            this.hasError = true;
            this.errorMessage = 'Something went wrong';
          }
        },
        (error) => {
          this.loader.stop();
          this.hasError = true;
          this.errorMessage = error.message;
          console.error(error.message);
        }
      );
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  onSubmitCode() {
    this.loader.start();
    const data = {
      otp: this.otp,
      reference: this.reference
    }
    this.paymentService
      .verifyPaymentOTP(data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        this.loader.stop();
        if (response?.status === true) {
          this.checkSuccessSecuredFunds(this.reference);
        } else {
          this.hasError = true;
          this.errorMessage = response['message'];
        }
      });
  }
  get isTestTransaction(): boolean {
    return this.api_key.includes('test');
  }
}
