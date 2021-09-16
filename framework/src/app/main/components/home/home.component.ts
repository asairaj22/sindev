import { Component, OnInit } from "@angular/core";
import { MatCarousel, MatCarouselComponent } from "@ngmodule/material-carousel";
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { AppService } from "src/app/app.service";
import { IsLoadingService } from "@service-work/is-loading";
import { Router, NavigationExtras } from "@angular/router";
import { GlobalDataService } from 'src/app/main/services/global.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})

export class HomeComponent implements OnInit {
  interval: any = 5000;
  slides: any;
  featuredProducts: any;
  testimonials: any;
  epAccountName: string = '';
  filterProps: any = { "isBundle": "true", "category": ["Cloud Services"], "status": ["Launched", "Active"] };
  productDetails: any = [];
  awsId: any;
  azureId: any;

  public config: SwiperConfigInterface = {
    a11y: true,
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    navigation: true,
    pagination: true,
    autoplay: {
      delay: 2000,
    },
  };

  public testimonialConfig: SwiperConfigInterface = {
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

  constructor(private customerService: AppService,
    private isLoadingService: IsLoadingService,
    private router: Router,
    private globalDataService: GlobalDataService) {

  }

  ngOnInit(): void {
    this.isLoadingService.add({ key: ["default"] });
    if (sessionStorage.getItem("slides")) {
      this.slides = JSON.parse(sessionStorage.getItem("slides"))
    }

    if (sessionStorage.getItem("featuredProducts")) {
      this.featuredProducts = JSON.parse(sessionStorage.getItem("featuredProducts"))
    }

    if (sessionStorage.getItem("testimonials")) {
      this.testimonials = JSON.parse(sessionStorage.getItem("testimonials"))
    }

    this.customerService.getBannerImages("image").subscribe(resp => {
      this.slides = resp.body.cmsArr
      sessionStorage.setItem("slides", JSON.stringify(this.slides));
    });

    this.customerService.getAllFeaProductsTestimonials().subscribe(resp => {
      this.featuredProducts = resp.body.find(x => x["featuredProducts"]).featuredProducts
      this.testimonials = resp.body.find(x => x["testimonials"]).testimonials
      sessionStorage.setItem("testimonials", JSON.stringify(this.testimonials));
      sessionStorage.setItem("featuredProducts", JSON.stringify(this.featuredProducts));
      this.isLoadingService.remove({ key: ["default"] })
    });

    window.scrollTo(0, 0)
    this.epAccountName = sessionStorage.getItem('ep-accountname');
    this.fetchProductCategory();
  }

  fetchProductCategory() {
    this.customerService.getProductCategory(this.filterProps).subscribe((res: any) => {
      if (res && res.body && res.body.length > 0) {
        res.body.forEach((val, i) => {
          var tempStr = val.name.toLowerCase();
          if (tempStr.includes("aws")) {
            this.awsId = val.po_id;
          }
          if (tempStr.includes("azure")) {
            this.azureId = val.po_id;
          }
        })
      }
    })
  }

  showFeaturedArticles(detailedStory) {
    this.customerService.passFeaturedArticles(detailedStory);
    this.router.navigate(['home/featured-articles']);
  }
}
