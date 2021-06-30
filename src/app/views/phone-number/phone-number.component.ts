import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  BUSINESS_DATA_KEY,
  ORDER_DATA_KEY,
  TRANSACTION_DATA_KEY,
  USER_API_KEY,
  USER_DATA_KEY,
} from 'src/app/models/constants';
import {
  BusinessTransactionData,
  BusinessTransactionItem,
  PaymentData,
} from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
})
export class PhoneNumberComponent implements OnInit, OnDestroy {
  paymentData: PaymentData | undefined;

  unsubscribe$ = new Subject();
  businessTransactionData?: BusinessTransactionData;
  prefixCountryCode?: string;
  user_phone?: string;
  user_api_key?: string;
  errorMessage?: string;
  userData: any;
  businessData: any;
  hasError = false;
  isValidInputType?: boolean;
  checkoutItemsData?: BusinessTransactionItem[];
  cancelUrl?: string;
  businessLogo: string | undefined;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    sessionStorage.removeItem(ORDER_DATA_KEY);
    this.getUrlParams(window.location.href);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmitNumber() {
    this.router.navigate(['/phone-verfication']);
  }

  isValidePhoneInput(phoneNumber: string) {
    if(phoneNumber === undefined) {
      return (this.isValidInputType = false);
    } else {
      const regEx = /^\d*\d*$/;
      if (phoneNumber?.match(regEx)) {
        return (this.isValidInputType = true);
      } else {
        return (this.isValidInputType = false);
      }
    }
  }

  onProceed(form: NgForm) {
    const telInputPlaceholderInputValue = document
      .getElementsByTagName('input')[0]
      .getAttribute('placeholder');
    const intelInputId = document
      .getElementsByTagName('input')[0]
      .getAttribute('data-intl-tel-input-id');
    if (telInputPlaceholderInputValue === '023 123 4567') {
      this.prefixCountryCode = '+233';
    } else if (telInputPlaceholderInputValue === '0802 123 4567') {
      this.prefixCountryCode = '+234';
    } else if (intelInputId === '2') {
      this.prefixCountryCode = '+225';
    }
    this.isValidePhoneInput(form.value['userPhone']?.trim());
    if (this.isValidInputType === true) {
      this.user_phone = `${this.prefixCountryCode}${form.value['userPhone']}`;
      const userData = {
        mobile_phone: this.user_phone,
      };
      this.loader.start();
      this.paymentService
        .sendVerificationCode(userData, `${this.user_api_key}`)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response: any) => {
          this.loader.stop();
          if (response?.status === 'success') {
            this.userData = response['data'];
            const transactionData = { ...this.businessTransactionData };
            transactionData.initiator_id = response['data'].user_uid;
            const transactionDetails = JSON.stringify(transactionData);
            sessionStorage.setItem(TRANSACTION_DATA_KEY, transactionDetails);
            const data = JSON.stringify(response['data']);
            sessionStorage.setItem(USER_DATA_KEY, data);
            this.router.navigate(['/phone-verfication']);
          } else {
            this.loader.stop();
            this.hasError = true;
            this.errorMessage = response['message'];
            setTimeout(() => {
              this.router.navigate(['create']);
            }, 4000);
          }
        });
    } else {
      this.hasError = true;
      this.errorMessage = 'Invalid Phone number';
    }
  }

  getBusinessData() {
    this.paymentService
      .getBusinessDetails(
        this.businessTransactionData?.user_id,
        `${this.user_api_key}`
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((businessData) => {
        this.businessData = businessData;
        this.businessLogo =
      this.businessData.business_logo === null
        ? 'assets/checkout/profilPhotoAnimation.gif'
        : `https://noworri.com/api/public/uploads/company/business/${this.businessData.business_logo}`;

        sessionStorage.setItem(
          BUSINESS_DATA_KEY,
          JSON.stringify(this.businessData)
        );
      });
  }

  getUrlParams(url: string) {
    const params = new URL(url).searchParams;
    const items = params.get('items');
    this.checkoutItemsData = JSON.parse(`${items}`);
    this.user_api_key = params.get('credentials') as string;
    this.cancelUrl = params.get('cancel_url') as string;
    this.businessTransactionData = {
      user_id: params.get('user_id') as string,
      initiator_id: '',
      initiator_role: 'buy',
      name: '',
      price: '',
      items: this.checkoutItemsData,
      description: 'e-commerce transaction',
      delivery_phone: params.get('delivery_phone') as string,
      payment_id: '',
      currency: params.get('currency') as string,
      callback_url: params.get('callback_url') as string,
      cancel_url: params.get('cancel_url') as string,
      order_id: params.get('order_id') as string,
    };
    sessionStorage.setItem(USER_API_KEY, this.user_api_key);
    this.getBusinessData();
  }
}
