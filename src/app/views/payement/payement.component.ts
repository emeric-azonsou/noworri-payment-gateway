import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payement',
  templateUrl: './payement.component.html',
  styleUrls: ['./payement.component.scss']
})
export class PayementComponent implements OnInit {

  hasDisplayInput=false;

  buttonLabel='Proceed to lock funds'

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  onDisplayInput(){
    this.hasDisplayInput=!this.hasDisplayInput
    this.buttonLabel='update adress'
  }

  onProccedPayement(){
    this.router.navigate(['/payement-option'])
  }

}
