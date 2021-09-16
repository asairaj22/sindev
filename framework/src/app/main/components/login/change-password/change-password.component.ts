import { Component, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { PasswordStrengthValidator } from "./password-strength.validators";
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import {ApiService} from "src/app/platform/util/api.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  public myForms: FormGroup;
  passwordModel='';
  passwordStrength;

  updateSuccess:boolean = false;
  emailId:string;
  successToken: boolean = false;
  token:string;
  activeToken:boolean = false;
  passFieldTextType:boolean = false;
  confirmPassFieldTextType:boolean = false;
  statusMessage:string;

  constructor(fb: FormBuilder, private customerService: AppService, private toastr: ToastrService,private route: ActivatedRoute, private router: Router, private apiService :ApiService) {
    this.myForms = fb.group({
      password: [null, Validators.compose([Validators.required])],
      confirmPassword: [null, Validators.compose([Validators.required])]
      },{ validator: this.passwordMatchValidator }
    );
  }

ngOnInit(): void {
  //if (this.route.snapshot.params['token'] && this.route.snapshot.params['email']) {
      this.route.queryParams.subscribe(param => {
        if(param['email'] && param['token']){
      this.emailId = param['email'];
      this.token =param['token']; 
       if(param['channel']){
      this.activateIndividual();
      }    
    else {
      this.checkTokenStatus();
    }
        }else{
          this.statusMessage = "Unable to retrieve request information";
        }    
  });  
}

  detectChange( value:string) {
   

    this.passwordStrength = this.measureStrength(`${value}`);
   
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get("password").value === g.get("confirmPassword").value ? null : { mismatch: true };
  }

  measureStrength(pass: string) {
    let score = 0;
    // award every unique letter until 5 repetitions
    let letters = {};
    for (let i = 0; i < pass.length; i++) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
    }
    // bonus points for mixing it up
    let variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (let check in variations) {
      variationCount += variations[check] ? 1 : 0;
    }
    score += (variationCount - 1) * 10;
    return Math.trunc(score);
  }
  onSavePassword(){
    this.updateSuccess = false;
    let password = (this.myForms.controls.password.value)? this.myForms.controls.password.value :"";
    let encryptPswd = this.apiService.crypto.encrypt(password);
   let inputObj = {
  "email":(this.emailId)? this.emailId : '',
  "password":(encryptPswd)? encryptPswd : ''
  };
    this.customerService.submitChangePassword(inputObj).subscribe(res => {
      if(res && res.body && res.body.errorMessage) {
        this.toastr.error(res.body.errorMessage);
      } else {
        let passwordResetDet = res.body;
        this.updateSuccess = true;
        this.toastr.success("Password is changed successfully");
        setTimeout(()=>{
          this.redirectToLogin();
        }, 2000); 
      }           
    });
  }
 togglePassFieldType(){
   this.passFieldTextType = !this.passFieldTextType;
 } 
 toggleConfirmPassFieldType(){
   this.confirmPassFieldTextType = !this.confirmPassFieldTextType;
 } 
 redirectToLogin(){
   this.router.navigateByUrl('/auth/login');
 }
 checkTokenStatus(){
this.customerService.validateTokenStatus(this.token).subscribe(res => {

      if(res.body && res.body.passwordStatus &&  res.body.passwordStatus=="Activated"){
        this.activeToken =  true;
      }
      else{
        this.activeToken = false;
      }

    });
 }
 activateIndividual(){
   this.customerService.activateIndividual(this.token).subscribe(res => {
      if(res.body && res.body.status &&  res.body.status=="Active"){
        this.activeToken =  true;
      }
      else{
        this.activeToken = false;
      }
    });
 }
}
