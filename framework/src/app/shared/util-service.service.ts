import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class UtilService {
    constructor() { }

    fileNameValidation(fileName) {
        var index = fileName.lastIndexOf('.');
        var fileNamewithoutExt = fileName.slice(0, index);
        var regex = new RegExp("[:\/*?|<>()$#@!~%+=;.,{}^|]");
        return regex.test(fileNamewithoutExt);
    }
}

