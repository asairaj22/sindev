import { AbstractControl, ValidationErrors } from "@angular/forms";

export const PasswordStrengthValidator = function (
  control: AbstractControl
): ValidationErrors | null {
  let value: string = control.value || "";

  
  let msg = "";
  if (!value) {
    return null;
  }

  // let upperCaseCharacters = /[A-Z]+/g;
  // let lowerCaseCharacters = /[a-z]+/g;
  // let numberCharacters = /[0-9]+/g;
  // let specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  // if (upperCaseCharacters.test(value) === false || lowerCaseCharacters.test(value) === false || numberCharacters.test(value) === false || specialCharacters.test(value) === false) {
  //   return {
  //     passwordStrength: 'Password must contain at least two of the following: numbers, lowercase letters, uppercase letters, or special characters.'
  //   }

  // }

  let p = 4;
  let q = 3;
  let r = 1;
  let s = 3;

  var constructedRegEx =
    "^(?=(?:.*[0-9]){" +
    p +
    ",})(?=(?:.*[a-z]){" +
    q +
    ",})(?=(?:.*[A-Z]){" +
    r +
    ",})(?=(?:.*[[!@#$%^&*()_+]){" +
    s +
    ",}).+$";

  var PasswordRegEx = new RegExp(constructedRegEx, "m");

  

  if (!PasswordRegEx.test(value)) {
    return {
      passwordStrength:
        "Password must contain at least " +
        p +
        " " +
        " numbers, " +
        q +
        " " +
        " lowercase letters, " +
        r +
        " " +
        " uppercase letters, " +
        s +
        " " +
        " special characters.",
    };
  }

  /*let upperCaseCharacters = /[A-Z]+/g
  if (upperCaseCharacters.test(value) === false) {
    return { passwordStrength: `Upper case required` };
  }

  let lowerCaseCharacters = /[a-z]+/g
  if (lowerCaseCharacters.test(value) === false) {
    return { passwordStrength: `lower case required` };
  }


  let numberCharacters = /[0-9]+/g
  if (numberCharacters.test(value) === false) {
    return { passwordStrength: `number required` };
  }

  let specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  if (specialCharacters.test(value) === false) {
    return { passwordStrength: `Special char required` };
  }
   return { 
    passwordStrength:null  
  }*/
};
