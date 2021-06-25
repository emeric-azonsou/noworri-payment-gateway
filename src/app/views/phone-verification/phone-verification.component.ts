import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss']
})
export class PhoneVerificationComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
  }


  onSubmitCode(){
    this.router.navigate(['/payements'])
  }
}
