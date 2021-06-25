import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss']
})
export class PhoneNumberComponent implements OnInit {




  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  onSubmitNumber(){
    this.router.navigate(['/phone-verfication'])
  }
 

}
