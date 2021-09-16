import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import *  as  productData from './product-detail.json';
import { CommonService } from '../common.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IsLoadingService } from "@service-work/is-loading";
import _ from 'lodash';
import { AppService } from "src/app/app.service";

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

    fixedBoxOffsetTop: number = 0;
    fixedBoxOffsetTopOtherMethod: number = 0;
    exceedScrollLimit: boolean = false;
    prodDetData: any = (productData as any).default;
    expandAll: boolean = false;
    dataid;
    paramId;
    productDetailData: any = [];
    currentSelectedProdName:any;
    productDetailSpecData: any = [];
    productBannerLogo;
    productFaq: any = [];
    productLogo;
    keyFeatures: any = [];
    testimonials: any = [];
    filtersLoaded: Promise<boolean>;
    selectedProduct: any = [];
    duplicateProductData: any;
    prodNameFirst: any;
    prodNameRemain: any;
    poObj: any;
    dataSource = [];
    master_bundle: any;
    isDataAvailable: boolean = false;
    wrapperheight = 0;
    headerHeight = 0;
    subHeaderHeight = 0;
    loginOrlogout = "";
    lastScrollTop = 0;
    topReach:boolean = false; 
    showToggle: boolean = false;
    whySingtelObj:any = {
        "highlighted":false,
        "offset":0,
        "offsetHgt":0
        };
    keyFeaturesObj:any = {
        "highlighted":false,
        "offset":0,
        "offsetHgt":0
        };
    subscDetailsObj:any = {
    "highlighted":false,
    "offset":0,
    "offsetHgt":0
    };

    @ViewChild('fixedBox', { static: false }) fixedBox: ElementRef;

    public config: SwiperConfigInterface = {
        loop: false,
        direction: 'horizontal',
        slidesPerView: 2,
        slidesPerColumn: 1,
        slidesPerGroup: 2,
        spaceBetween: 20,
        pagination: {
            el: '.carousel-container__pagination',
            type: 'bullets',
            clickable: true
        },
        navigation: {
            nextEl: '.carousel-container__button-next',
            prevEl: '.carousel-container__button-prev',
        },
        breakpoints: {
            992: {
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 100,
            }
        }
    };

    constructor(private _Mainservice: CommonService,
        private customerService: AppService,
        public activatedRoute: ActivatedRoute, private router: Router,
        private changeDetectorRef: ChangeDetectorRef, private isLoadingService: IsLoadingService) { }

    ngOnInit(): void {
        this.isLoadingService.add({ key: ["default"] });

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        this.dataid = this.activatedRoute.params.subscribe(params => {
            this.dataid = params['id'];
            this.dataid = +this.dataid;
            this.paramId = this.dataid;
            this.getProdDetails(this.dataid);
        })

        this.customerService.headerheight.subscribe(
            data => {
                this.headerHeight = data;
            }
        );
        this.customerService.subHeaderheight.subscribe(
            data => {
                this.subHeaderHeight = data;
            }
        );
        this.customerService.loginOrLogout.subscribe(
            data => {
                this.loginOrlogout = data;
            }
        );

       

    }

    ngOnDestroy() {
    this.customerService.anyQuestionProductName.next(null);  
  }

    ngAfterViewInit(): void {
        this.wrapperheight = this.headerHeight + this.subHeaderHeight;
        window.scrollTo(0, 0);
        // const rect = this.fixedBox.nativeElement.getBoundingClientRect();
        // this.fixedBoxOffsetTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
    }
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.wrapperheight = this.headerHeight + this.subHeaderHeight;
    }

    afterViewInit() {
        const rect = this.fixedBox.nativeElement.getBoundingClientRect();
        this.fixedBoxOffsetTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
    }

    getProdDetails(id) {
        var _model = {
            "id": id
        }
        this._Mainservice.getProductDetails(_model).subscribe((data: any) => {


            this.productDetailData = data.body[0];
            var productDetailDatas = data.body[0];
            if(this.productDetailData.name){
                if(this.productDetailData.name.toUpperCase().includes("AWS")){
                    this.currentSelectedProdName = "aws";
                }
                else if(this.productDetailData.name.toUpperCase().includes("AZURE")){
                    this.currentSelectedProdName = "azure";
                }
                else if(this.productDetailData.name.toUpperCase().includes("GCP")){
                    this.currentSelectedProdName = "gcp";
                }
            }
            this.prodNameFirst = this.productDetailData.name.split(" ")[0];
            this.prodNameRemain = this.productDetailData.name.substr(this.productDetailData.name.indexOf(" ") + 1);
            this.productDetailSpecData = data.body[0].productSpecificationRelationship.productSpecification.productSpecCharacteristic;
            this.productDetailSpecData.forEach((val) => {
                if (val.name == "productLogo") {
                    this.productLogo = val.type;
                }
                if (val.name == "bannerLogo") {
                    this.productBannerLogo = val.type;
                }
                if (val.tag == "resource") {
                    this.keyFeatures.push(val);
                }
                if (val.name == "testimonials") {
                    var testimonials = JSON.parse(val.productSpecCharacteristicValue[0].value);
                    var tempVar = []
                    Object.keys(testimonials).forEach((val, i) => {
                        tempVar.push(testimonials[val]);
                    })
                    if (tempVar.length > 0) {
                        tempVar.forEach((val, i) => {
                            this.testimonials.push(JSON.parse(testimonials[i].value));
                        })
                    }
                }
                if (val.type == "faqs") {
                    this.productFaq.push({ "question": val.name, "answer": val.productSpecCharacteristicValue[0].value });
                }
                this.isLoadingService.remove({ key: ["default"] });
                this.isDataAvailable = true;
                this.changeDetectorRef.detectChanges();
                this.afterViewInit();
                this.filtersLoaded = Promise.resolve(true);
            })


            this.selectedProduct = {
                id: productDetailDatas.products[0].id,
                name: productDetailDatas.products[0].name,
                priceAmount: productDetailDatas.products[0].productOfferingPrice[0].recurringChargePeriodLength,
                priceUnit: productDetailDatas.products[0].productOfferingPrice[0].tax[0].taxAmount.units,
                period: productDetailDatas.products[0].productOfferingPrice[0].name,
                eachPlanId: productDetailDatas.products[0].productOfferingPrice[0].id,
                isselected: true,
                btntype: 'radio'
            };

            this.customerService.anyQuestionProductName.next({prodName: this.productDetailData.name});

        },
            (err: HttpErrorResponse) => {

            });
    }

    mapSelectedProduct(productObj) {
        let test = Object.assign({}, this.productDetailData);
        this.selectedProduct = productObj;
        if (productObj.btntype == "radio") {
            if (this.productDetailData.category[0].name == 'Cloud') {

            }
            this.productDetailData.products.forEach((x: any, index) => {
                if (this.selectedProduct.id == x.id) {
                    x.isSelected = true;

                    x.quantity = x.quantity ? x.quantity : 1;
                    x.productOfferingPrice.forEach((y: any) => {
                        if (this.selectedProduct.eachPlanId == y.id) {
                            y.isSelected = true;

                        } else {
                            y.isSelected = false;
                        }
                    })
                } else {
                    x.isSelected = false;
                    x.quantity = 0;
                }
            })
            this.duplicateProductData = _.cloneDeep(this.productDetailData);
            if (this.duplicateProductData) {
                this.duplicateProductData.products.forEach((product: any) => {
                    product.productOfferingPrice = product.productOfferingPrice.filter(productOffer => productOffer.isSelected == true);
                })
                this.duplicateProductData.products = this.duplicateProductData.products.filter(product => product.productOfferingPrice.length > 0);
            }
            // if (productObj.hasOwnProperty("isAddedToCart") && productObj.isAddedToCart == true) {
            this.addCartItem();
            // }
        }
        if (productObj.btntype == 'checkbox') {
            this.productDetailData.products.forEach((x: any, index) => {
                if (this.selectedProduct.id == x.id) {

                    x.quantity = x.quantity ? x.quantity : 1;
                    x.productOfferingPrice.forEach((y: any) => {
                        if (this.selectedProduct.eachPlanId == y.id) {
                            y.isSelected = this.selectedProduct.isselected;
                        }
                    })
                }
            });

            this.duplicateProductData = _.cloneDeep(this.productDetailData);
            if (this.duplicateProductData) {
                this.duplicateProductData.products.forEach((product: any) => {
                    product.productOfferingPrice = product.productOfferingPrice.filter(productOffer => productOffer.isSelected == true);
                })
                this.duplicateProductData.products = this.duplicateProductData.products.filter(product => product.productOfferingPrice.length > 0);
            }
            if (productObj.hasOwnProperty("isAddedToCart") && productObj.isAddedToCart == true) {
                this.addCartItem();
            }
        }
    }

    addCartItem() {
        this.poObj = _.cloneDeep(this.duplicateProductData);

        // this.poObj.quantity = this.licenceCount;

        this.poObj = this.chcekbundle(this.poObj);
        // sessionStorage.setItem('billingAccount', this.billing_account);
        // let cartSessionID = sessionStorage.getItem('cartSessionID')
        // localStorage.setItem('productID', this.productID);
        // localStorage.setItem('productName', this.productData.name);
        if (this.poObj.products) {
            this.poObj.products = this.poObj.products.filter(product => product.id == this.productDetailData.products[0].id);
        }

        let shoppingSessionInput = {};
        shoppingSessionInput = {
            Customer_id: JSON.parse(sessionStorage.getItem('userAccountDetails')).customerid,
            individualId: JSON.parse(sessionStorage.getItem('userAccountDetails')).id,
            userIndividualId: (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
        }


        this.customerService.getShoppingSession(shoppingSessionInput)
            .subscribe(res => {
                sessionStorage.setItem('cartSessionID', res.body.shoppingSessionId);
                let cartSessionID = res.body.shoppingSessionId;
                if (this.poObj) {
                    this.poObj.userIndividualId = (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '';
                }
                this._Mainservice.addtoCartFromPO(cartSessionID, [this.poObj]).subscribe(res => {
                    this.dataSource = res.body[0].cartItem;
                    this.dataSource = JSON.parse(JSON.stringify(res.body[0].cartItem));

                    // < static binding 
                    //this.dataSource[0].action = 'showincart';
                    // static binding >
                    this.master_bundle = this.dataSource.filter(x => {
                        return x.hasOwnProperty('action') && x.action == 'showInCart';
                        // return x.itemType == 'MasterBundle';
                    })
                    sessionStorage.setItem('cartItemId', this.master_bundle[0].id);
                    if (res) {
                        this.router.navigateByUrl(
                            "/offer-customize/" + this.paramId
                        );

                    }
                });
            });


    }

    chcekbundle(data) {
        Object.keys(data).forEach(bundleKey => {
            if (bundleKey != "isBundle" && bundleKey != "lifecycleStatus" && bundleKey != "isMasterBundle"
                && bundleKey != "id" && bundleKey != "productId" && bundleKey != "isSellable" && bundleKey != "parentId"
                && bundleKey != "name" && bundleKey != "isBaseProduct" && bundleKey != "products" && bundleKey != "productSpecificationRelationship"
                && bundleKey != "category" && bundleKey != "place" && bundleKey != "productOfferingPrice" && bundleKey != "quantity") {
                delete data[bundleKey];
            }
        });
        // check products
        if (data.products) {
            data.products.forEach(bundle => {
                this.checkOtherprops(data)
                var A = this.chcekbundle(bundle);
            });
        } else {
            this.checkOtherprops(data)
        }
        return data;
    }

    checkOtherprops(data) {
        // check prod spec        
        Object.keys(data.productSpecificationRelationship).forEach(specRel => {
            if (specRel != "productSpecification" && specRel != "id") {
                delete data.productSpecificationRelationship[specRel];
            }
        });
        Object.keys(data.productSpecificationRelationship.productSpecification).forEach(charKey => {
            if (charKey != "validFor" && charKey != "name" && charKey != "id"
                && charKey != "productSpecCharacteristic") {
                delete data.productSpecificationRelationship.productSpecification[charKey]
            }
        });
        if (data.productSpecificationRelationship.productSpecification.productSpecCharacteristic) {
            let _productSpecCharacteristic = data.productSpecificationRelationship.productSpecification.productSpecCharacteristic;
            _productSpecCharacteristic.forEach(function (spec, key) {
                if ((spec.requiredAt == "Ordering") || (spec.requiredAt == 'Provisioning')) {
                    // check the needed columns and delete remaining
                    Object.keys(spec).forEach(specKey => {
                        if (specKey != "requiredAt" && specKey != "type" && specKey != "isPriceField"
                            && specKey != "name" && specKey != "productSpecCharacteristicValue" && specKey != "configurable"
                            && specKey != "extensible" && specKey != "id" && specKey != "tag") {
                            delete spec[specKey];
                        }
                    });
                }
                else {
                    // not matched with 'IF', just mark it..
                    spec.isDeleted = true;
                }
                if (_productSpecCharacteristic.length - 1 == key) {
                    data.productSpecificationRelationship.productSpecification.productSpecCharacteristic = _productSpecCharacteristic.filter(currentspec => !currentspec.isDeleted);
                }
            });
        }
        // check prod offering
        if (data.productOfferingPrice) {
            data.productOfferingPrice.forEach(po => {
                Object.keys(po).forEach(poKey => {
                    if (poKey != "unitOfMeasure" && poKey != "priceType" && poKey != "recurringChargePeriodType"
                        && poKey != "tax" && poKey != "recurringChargePeriodLength" && poKey != "name" && poKey != "id"
                        && poKey != "price" && poKey != "priceAlteration") {
                        delete po[poKey];
                    }
                });
                // pop -> price 
                po.price.taxIncludedAmount.amount = null;
                po.price.dutyFreeAmount.amount = null;
                // pop -> priceAlteration
                po.priceAlteration.forEach(priceAlter => {
                    Object.keys(po.priceAlteration).forEach(alterKey => {
                        if (alterKey != "unitOfMeasure" && alterKey != "id" && alterKey != "recurringChargePeriodType" &&
                            alterKey != "price" && alterKey != "name" && alterKey != "priceType" && alterKey != "recurringChargePeriodLength") {
                            delete po.priceAlteration[alterKey];
                        }
                    });
                    priceAlter.price.taxIncludedAmount.amount = null;
                    priceAlter.price.dutyFreeAmount.amount = null;
                });
            });
        }
        // check place
        if (data.place) {
            data.place.forEach(place => {
                Object.keys(place).forEach(placeKey => {
                    if (placeKey != "id" && placeKey != "name" && placeKey != "isRoot") {
                        delete place[placeKey];
                    }
                });
            });
        }
        // check category
        if (data.category) {
            data.category.forEach(category => {
                Object.keys(category).forEach(categoryKey => {
                    if (categoryKey != "id" && categoryKey != "name" && categoryKey != "isRoot") {
                        delete category[categoryKey];
                    }
                });
            });
        }
    }

    scrollToDiv(el: HTMLElement) {
        // el.scrollIntoView();
        // if(document.documentElement.scrollTop == 0){
        //     document.documentElement.scrollTop = el.offsetTop - 300 - this.wrapperheight;
        // } else {
        document.documentElement.scrollTop = el.offsetTop + 100 - this.wrapperheight;
        document.body.scrollTop = el.offsetTop + 100 - this.wrapperheight;
        this.showToggle = false;
        // }
    }

    @HostListener("window:scroll", [])

    onWindowScroll() {

///to Highlight the scroll section heading
if(window.pageYOffset==0){
this.whySingtelObj.highlighted = false;
this.keyFeaturesObj.highlighted = false;
this.subscDetailsObj.highlighted = false;
}
else if(window.pageYOffset >= 500 && window.pageYOffset <= this.whySingtelObj.offsetHgt){
    this.whySingtelObj.highlighted = true;
    this.keyFeaturesObj.highlighted = false;
    this.subscDetailsObj.highlighted = false;
}
else if(window.pageYOffset >= this.keyFeaturesObj.offset && window.pageYOffset <= this.keyFeaturesObj.offsetHgt){
    this.whySingtelObj.highlighted = false;
    this.keyFeaturesObj.highlighted = true;
    this.subscDetailsObj.highlighted = false;
}
else if(window.pageYOffset >= this.subscDetailsObj.offset && window.pageYOffset <= this.subscDetailsObj.offsetHgt){
    this.whySingtelObj.highlighted = false;
    this.keyFeaturesObj.highlighted = false;
    this.subscDetailsObj.highlighted = true;
}
else{
    this.whySingtelObj.highlighted = false;
    this.keyFeaturesObj.highlighted = false;
    this.subscDetailsObj.highlighted = false;
}

        this.wrapperheight = this.headerHeight + this.subHeaderHeight;
        // var windowScroll = this.fixedBoxOffsetTop - this.wrapperheight;
        var windowScroll = this.fixedBoxOffsetTop - 96;
        // var scrollHeight = window.pageYOffset + this.wrapperheight;
        var scrollHeight = window.pageYOffset;


        if (scrollHeight >= windowScroll && window.pageYOffset != 0) {
            this.exceedScrollLimit = true;
        } else if (window.pageYOffset < windowScroll) {
            this.exceedScrollLimit = false;
        }

        this.getScrollEvent();

        // if (window.pageYOffset >= windowScroll && window.pageYOffset != 0) {
        //     this.exceedScrollLimit = true;
        // } else if (window.pageYOffset < windowScroll) {
        //     this.exceedScrollLimit = false;
        // }


        // if (window.pageYOffset >= this.fixedBoxOffsetTop && window.pageYOffset != 0) {
        //     this.exceedScrollLimit = true;
        // } else if (window.pageYOffset < this.fixedBoxOffsetTop) {
        //     this.exceedScrollLimit = false;
        // }
    }

    getScrollEvent(){
        let st = window.pageYOffset || document.documentElement.scrollTop; 
        if (st > this.lastScrollTop){
            if(st > 60){
                this.topReach = true;
            }
        } else {
            this.topReach = false;
        }
        this.lastScrollTop = st <= 0 ? 0 : st;
    }


    expandCollapse() {
        this.expandAll = !this.expandAll;
    }
scrollFunction(whySingtel,keyFeatures,subscDetail){
    this.whySingtelObj.offset = 500;
    this.whySingtelObj.offsetHgt = 764;

    this.keyFeaturesObj.offset = this.whySingtelObj.offsetHgt;
    this.keyFeaturesObj.offsetHgt = this.whySingtelObj.offsetHgt + keyFeatures.offsetHeight;

    this.subscDetailsObj.offset = this.keyFeaturesObj.offsetHgt;
    this.subscDetailsObj.offsetHgt = this.keyFeaturesObj.offsetHgt + subscDetail.offsetHeight;




}
    moveToCustomize() {
        if (sessionStorage.getItem('ep-username')) {
            this.mapSelectedProduct(this.selectedProduct);
            // Already logged user, if billing account number is not updated
            var companyDetail = JSON.parse(sessionStorage.getItem('companyDetails'));
            if(companyDetail && !companyDetail.billingAccountNumber) {
                var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));
                if (userAccDetail.customerid) {
                    this.customerService.getCompanyDetails({ "id": userAccDetail.customerid }).subscribe(res => {
                        sessionStorage.setItem('companyDetails', JSON.stringify(res.body));
                    });
                }
            }
        } else {
            sessionStorage.setItem('productDetail', "true");
            sessionStorage.setItem('routeURL', this.router.url);
            this.router.navigateByUrl("/auth/login");
        }

    }

    toggleMobile() {
        this.showToggle = !this.showToggle;
    }

}
