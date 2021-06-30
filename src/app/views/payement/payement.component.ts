import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BUSINESS_DATA_KEY, ORDER_DATA_KEY, PAYMENT_DATA_KEY, TRANSACTION_DATA_KEY, USER_API_KEY, USER_DATA_KEY } from 'src/app/models/constants';
import { BusinessTransactionData, BusinessTransactionItem, PaymentData } from 'src/app/models/payment.interface';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payement',
  templateUrl: './payement.component.html',
  styleUrls: ['./payement.component.scss']
})
export class PayementComponent implements OnInit {
  paymentData: PaymentData | undefined;
  transactionData: BusinessTransactionData;
  country: string | undefined;

  unsubscribe$ = new Subject();
  userData: any;
  isSecuring: boolean | undefined;
  orderData: BusinessTransactionItem[]  = [];
  errorMessage: string | undefined;
  hasError = false;
  hasParams = false;

  transaction_ref: string | undefined;
  amount: number | undefined;
  totalPrice: number | undefined;
  checkoutData: any;
  savedOrderData: any;
  api_key: string;
  businessData: any;
  userPP: string | undefined;
  businessLogo: string | undefined;
  address: string;
  isChangingAddress = false;
  isUpdatingAddress = false;
  noworriFee: number | undefined;
  hasDisplayInput=false;

  buttonLabel='Proceed to lock funds';

  constructor(private router:Router,
    private loader: NgxUiLoaderService,
    private paymentService: PaymentService
    ) {
    const transactionData = JSON.parse(sessionStorage.getItem(TRANSACTION_DATA_KEY) as string);
    const userData = JSON.parse(sessionStorage.getItem(USER_DATA_KEY) as string);
    const businessData = JSON.parse(
      sessionStorage.getItem(BUSINESS_DATA_KEY) as string
    );
    const savedDataString = sessionStorage.getItem(ORDER_DATA_KEY);
    const orderDataSaved = savedDataString !== 'undefined' ? JSON.parse(savedDataString as string) : undefined;
    this.savedOrderData = orderDataSaved;
    this.checkoutData = transactionData;
    this.userData = userData;
    this.address = userData.address;
    this.api_key = sessionStorage.getItem(USER_API_KEY) as string;
    this.businessData = businessData;

    const data =  sessionStorage.getItem(TRANSACTION_DATA_KEY) as string;
    this.transactionData = JSON.parse(data);
  }

  ngOnInit(): void {
    this.userPP =
      this.userData.photo === null
        ? 'assets/checkout/profilPhotoAnimation.gif'
        : `https://noworri.com/api/public/uploads/images/pp/${this.userData.photo}`;

    this.businessLogo =
      this.businessData.business_logo === null
        ? 'assets/checkout/profilPhotoAnimation.gif'
        : `https://noworri.com/api/public/uploads/company/business/${this.businessData.business_logo}`;

    this.getOrderData();
  }


  onDisplayInput(){
    this.hasDisplayInput=!this.hasDisplayInput
    this.buttonLabel='update adress'
  }

  onProccedPayement(){
    const transactionData = {...this.transactionData};
    transactionData.price = `${Math.round(this.totalPrice as number)}`;
    const paymentData: PaymentData = {
      email: this.userData.email,
      amount: `${this.totalPrice}`,
      currency: this.checkoutData.currency,
      callback_url: `${window.location.href}`,
    };
    sessionStorage.setItem(PAYMENT_DATA_KEY, JSON.stringify(paymentData));
    this.router.navigate(['/payement-option'])
  }

  
  getOrderData() {
    let itemsData = this.checkoutData.items;

    if (typeof itemsData === 'string') {
      itemsData = JSON.parse(this.checkoutData.items);
    }
    if (!!itemsData.name) {
      const data =
      {
        name: itemsData.name,
        price: itemsData.price,
        description: itemsData.description,
        items_qty: itemsData.items_qty,
        item_id: itemsData.item_id,
      };
      this.orderData?.push(data);
    } else {
      itemsData.forEach((item: any) => {
        this.orderData?.push({
          name: item.name,
          price: item.price,
          description: item.description,
          items_qty: item.items_qty,
          item_id: item.item_id,
          });
      });
    }
    let priceList = this.orderData?.map((data: any) => data.price);
    if (!this.savedOrderData) {
      this.setAmount(priceList);
      const formattedOrderData = JSON.stringify(this.orderData);
      sessionStorage.setItem(ORDER_DATA_KEY, formattedOrderData);
      return this.orderData;
    } else {
      priceList = this.savedOrderData.map((orderData: any) => orderData.price);
      this.setAmount(priceList);
      return this.savedOrderData;
    }
  }

  toggleChangeAddress() {
    this.isChangingAddress = !this.isChangingAddress;
  }

  changeDeliveryAddress(address: string) {
    this.isUpdatingAddress = true;
    const data = {
      mobile_phone: this.userData.mobile_phone,
      address: address,
    };
    this.paymentService
      .updateUserAddress(data, this.api_key)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        if (response && response.status === true) {
          this.address = response.address;
          this.isChangingAddress = false;
          this.isUpdatingAddress = false;
        } else {
          this.isUpdatingAddress = false;
          // do something here
        }
      });
  }

  removeItem(index: number) {
    this.orderData?.splice(index, 1);
    const formattedOrderData = JSON.stringify(this.orderData);
    sessionStorage.setItem(ORDER_DATA_KEY, formattedOrderData);
    const priceList = this.orderData?.map((data: any) => data.price);
    this.setAmount(priceList);
  }

  getUrlParams(url: string) {
    let params = new URL(url).searchParams;
    this.transaction_ref = params.get('reference') as string;
    if (params.get('reference')) {
      this.hasParams = true;
    }

    if (this.transaction_ref) {
      this.checkSuccessSecuredFunds(this.transaction_ref);
    }
  }

  setAmount(prices: any) {
    this.totalPrice = prices?.reduce((acc: any, cur: any) => acc + Number(cur), 0)
      .toFixed(2);
    this.noworriFee = this.getNoworriFee(this.totalPrice);
    const sum = Number(this.totalPrice) + this.getNoworriFee(this.totalPrice);
    this.amount = Number(sum.toFixed(2));
  }

  getNoworriFee(price: any): number {
    const fee = ((price / 100) * 1).toFixed(2);
    return Number(fee);
  }

  onPay() {
    this.loader.start();
    this.isSecuring = true;
    const transactionData = {
      email: this.userData.email,
      amount: Math.round(this.totalPrice as number),
      currency: this.checkoutData.currency,
      callback_url: `${window.location.href}`,
    };
    this.loader.stop();
    this.paymentService
      .payStackPayment(transactionData, this.api_key)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        window.location.replace(`${response.data.authorization_url}`);
        return false;
      });
  }

  checkSuccessSecuredFunds(ref: string) {
    this.paymentService
      .checkTransactionStatus(ref, this.api_key)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((statusData) => {
        if (statusData.data && statusData.data.status === 'success') {
          this.createTransaction();
        } else {
          this.hasError = true;
          this.errorMessage = statusData.message;
        }
      });
  }

  createTransaction() {
    this.checkoutData['payment_id'] = this.transaction_ref;
    this.checkoutData['price'] = Number(this.totalPrice).toFixed(2);
    this.checkoutData['name'] = this.businessData.trading_name;
    this.checkoutData['items'] = this.getOrderData();
    this.paymentService
      .createTransaction(this.checkoutData, this.api_key, this.isTestTransaction)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (transaction: any) => {
          if (transaction) {
            let order = this.getOrderData();
            order = JSON.stringify(order);
            const callbackUrl = `${this.checkoutData.callback_url}?reference=${this.transaction_ref}&order_id=${this.checkoutData.order_id}&order-data=${order}`
            window.location.replace(callbackUrl);
          } else {
            this.hasError = true;
            this.errorMessage = 'Something went wrong';
          }
        },
        (error) => {
          console.log(error.message);
        }
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get isTestTransaction(): boolean{
    return this.api_key.includes('test');
  }
}
