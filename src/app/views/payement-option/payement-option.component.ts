import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { BUSINESS_DATA_KEY, ORDER_DATA_KEY, PAYMENT_DATA_KEY, TRANSACTION_DATA_KEY, USER_API_KEY, USER_DATA_KEY } from 'src/app/models/constants';
import { MobileMoney, PaymentData } from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payement-option',
  templateUrl: './payement-option.component.html',
  styleUrls: ['./payement-option.component.scss'],
})
export class PayementOptionComponent implements OnInit {
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
  api_key:string;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private paymentService: PaymentService,
    private location: Location,
    private loader: NgxUiLoaderService
  ) {
    const paymentData = sessionStorage.getItem(PAYMENT_DATA_KEY) as string;
    const orderData = sessionStorage.getItem(ORDER_DATA_KEY) as string;
    const userDataString = sessionStorage.getItem(USER_DATA_KEY) as string;
    const checkout = sessionStorage.getItem(TRANSACTION_DATA_KEY)as string;
    const businessData = JSON.parse(
      sessionStorage.getItem(BUSINESS_DATA_KEY) as string
    );
    this.checkoutData = JSON.parse(checkout);
    this.userData = JSON.parse(userDataString)
    this.paymentData = JSON.parse(paymentData);
    this.businessData = businessData;
    this.orderData = JSON.parse(orderData);
    this.api_key = JSON.parse(sessionStorage.getItem(USER_API_KEY) as string)
    if (this.paymentData?.currency === 'GHS' || !this.paymentData?.currency) {
      this.country = 'Ghana';
    } else {
      this.country = 'Nigeria';
    }
  }

  ngOnInit(): void {
    this.userPP =
    this.userData.photo === null
      ? 'assets/checkout/profilPhotoAnimation.gif'
      : `https://noworri.com/api/public/uploads/images/pp/${this.userData.photo}`;

    this.getBankList(this.country);
    this.setUpForm();
  }

  setUpForm() {
    this.paymentForm = this.formBuilder.group({
      mobileMoneyNumber: [
        '',
        [Validators.required, Validators.pattern(this.digitsRegEx)],
      ],
      provider: [this.networkList[0].code, Validators.required],
    });
  }

  goBack(): void {
    this.location.back();
  }

  onLockFund() {
    this.loader.start();
    // paystack test mobile money number
    // 0551234987

    const mobileMoney: MobileMoney = {
      provider: this.paymentForm.value['provider'],
      phone: this.paymentForm.value['mobileMoneyNumber']
    }
    const data = {... this.paymentData};
    data.mobile_money = mobileMoney;

    this.paymentService
      .processPayment(data, this.userData.user_uid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        if(response &&  response.status === true) {
          this.reference = response.data.reference;
          this.checkSuccessSecuredFunds(this.reference);

        } else {
          this.hasError = true;
          this.errorMessage = response.message;  
        }
        return response;
      }),
      catchError((error) => {
        this.loader.stop();
        this.hasError = true;
        this.errorMessage = error.message;
        console.error(error);
        return throwError(error);
      });
  }

  checkSuccessSecuredFunds(ref: string | undefined) {
    this.paymentService
      .checkTransactionStatus(ref)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((statusData) => {
        if (statusData.data && statusData.data.status === 'success') {
          this.createTransaction();
        } else {
          this.loader.stop();
          this.hasError = true;
          this.errorMessage = statusData.message;        }
      });
  }

  createTransaction() {
    this.checkoutData['payment_id'] = this.reference;
    this.checkoutData['price'] = Number(this.paymentData?.amount).toFixed(2);
    this.checkoutData['name'] = this.businessData.trading_name;
    this.checkoutData['items'] = this.paymentData;
    this.paymentService
      .createTransaction(this.checkoutData, this.api_key, this.isTestTransaction)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (transaction: any) => {
          if (transaction) {
            this.loader.stop();
            const paymentData = this.paymentData;
            const order = JSON.stringify(paymentData);
            const callbackUrl = `${this.checkoutData.callback_url}?reference=${this.reference}&order_id=${this.checkoutData.order_id}&order-data=${order}`
            window.location.replace(callbackUrl);
          } else {
            this.loader.stop();
            this.hasError = true;
            this.errorMessage = 'Something went wrong';
          }
        },
        (error) => {
          this.loader.stop();
          console.error(error.message);
        }
      );
  }

  getBankList(country: string) {
    this.paymentService
      .getBanks(country)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        // this.banksData = data?.filter(
        //   (bank) => bank.type === "ghipss" || bank.type === "nuban"
        // );
        // this.networkList = data?.filter(
        //   (bank: any) => bank.type === 'mobile_money'
        // );
        this.banksList = data;
        // this.bankNames = this.networkList?.map((bank: any) => bank.name);
      });
  }

  get isTestTransaction(): boolean{
    return this.api_key.includes('test');
  }
}
