import { Component, OnInit } from '@angular/core';
import { BUSINESS_DATA_KEY, USER_DATA_KEY } from 'src/app/models/constants';

@Component({
  selector: 'app-empty-user-page',
  templateUrl: './empty-user-page.component.html',
  styleUrls: ['./empty-user-page.component.scss']
})
export class EmptyUserPageComponent implements OnInit {
  businessData: any;
  userPhoneNumber: string | null;

  constructor() {
    const business = sessionStorage.getItem(BUSINESS_DATA_KEY);
    this.userPhoneNumber = sessionStorage.getItem(USER_DATA_KEY);
    const businessData = JSON.parse(business as string);
    this.businessData = businessData;
  }

  ngOnInit(): void {
  }

}
