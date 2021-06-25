import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payement-option',
  templateUrl: './payement-option.component.html',
  styleUrls: ['./payement-option.component.scss']
})
export class PayementOptionComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onLockFund() {
    this.router.navigate(['/otp-to-proceed'])
  }

}
