import { Directive, Input, OnInit, ElementRef } from '@angular/core';
import { ChartsService } from './../service/charts.service';
import { StringUtilService } from './../service/stringUtil.service';

@Directive({
  selector: 'epReportGraph'
})
export class EpReportGraphDirective implements OnInit {
  @Input() secObj: any;

  needImageContent: boolean;
  chartData: any;
  params: any;

  constructor( private chartService: ChartsService, private el: ElementRef, private strings: StringUtilService ) { }

  ngOnInit(): void {
    this.needImageContent = false;
    let currentElement: any = this.el.nativeElement;
    if(currentElement.hasAttribute('render-graph')){
      this.renderGraphContent();
    } else if (currentElement.hasAttribute('render-chart')) {
      this.renderChartContent();
    } else if(currentElement.hasAttribute('render-hidden-chart')) {
      this.needImageContent = true;
      if(this.secObj.reportType.toLowerCase() != "graphical"){
				this.renderChartContent();
			}else{
				this.renderGraphContent();
			}
    }

    this.params = {
      chartData: this.chartData, 
      needImageContent: this.needImageContent, 
      userValueList: this.secObj.userValueList || [], 
      sectionObject: this.secObj, 
      domObj: currentElement
    };
    this.chartService.renderChart(this.params, () => {
        if (this.needImageContent) {
          setTimeout( () => {
            this.loadImageContent(this.secObj);
          }, 1000);
        }
    });
  }

  renderGraphContent(){
    this.chartService.updateGraphSectionObject(this.secObj);
    this.chartData = this.secObj.graphContent;
  }

  renderChartContent(){
    this.chartService.updateChartSectionObject(this.secObj);
		this.chartData = this.secObj.chartContent;
  }

  loadImageContent(secbjRef: any){
    var svgToDataUrl = (svgString: any) => {
      var navigator = window.navigator;
      var c: boolean = -1 < navigator.userAgent.indexOf("WebKit") && 0 > navigator.userAgent.indexOf("Chrome");
      try {
        var DOMURL: any = self.URL || (<any>self).webkitURL || self;
        if (!c && 0 > navigator.userAgent.toLowerCase().indexOf("firefox")){
          return DOMURL.createObjectURL(new window.Blob([svgString], {
            type: "image/svg+xml;charset-utf-16"
          }));
        }
      } catch (d) { }
      return "data:image/svg+xml;charset\x3dUTF-8," + encodeURIComponent(svgString)
    };
    var sanitizeSVG = (svgDOM: any) => {
      var a = new XMLSerializer().serializeToString(svgDOM);
      //return a.replace(/zIndex="[^"]+"/g, "").replace(/isShadow="[^"]+"/g, "").replace(/symbolName="[^"]+"/g, "").replace(/jQuery[0-9]+="[^"]+"/g, "").replace(/url\(("|&quot;)(\S+)("|&quot;)\)/g, "url($2)").replace(/url\([^#]+#/g, "url(#").replace(/<svg /, '\x3csvg xmlns:xlink\x3d"http://www.w3.org/1999/xlink" ').replace(/ (|NS[0-9]+\:)href=/g, " xlink:href\x3d").replace(/\n/, " ").replace(/<\/svg>.*?$/, "\x3c/svg\x3e").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g, '$1\x3d"rgb($2)" $1-opacity\x3d"$3"').replace(/&nbsp;/g, "\u00a0").replace(/&shy;/g, "\u00ad");/
      return a;
    };
    if ($('svg').length > 0) {
      if (secbjRef != null) {
        var sectionObject = secbjRef;
      }
      var svgDOM = $("epReportGraph[render-hidden-chart][graph-section-id='" + sectionObject.sectionId + "'] svg")[0];
      var canvasId = 'CxtToImg_' + this.strings.getRandomId();
      var height = parseFloat($(svgDOM).attr('height'));
      var width = parseFloat($(svgDOM).attr('width'));
      var canvas: any = $('<canvas id="' + canvasId + '" width="' + width + '" height="' + height + '" class="temp_CxtToImg" style="display:none"></canvas>')[0];
      $('body').append(canvas);
      var svgString = sanitizeSVG(svgDOM);
      var ctx = canvas.getContext("2d");
      var img = new Image();
      $(img).attr('canvasId', canvasId);
      var url = svgToDataUrl(svgString);
      img.onload = () => {
        var relCanvas = $('#' + $(img).attr('canvasId'));
        ctx.drawImage(img, 0, 0);
        var imageurl = null;
        try {
          imageurl = canvas.toDataURL("image/png");
        } catch (e) {
          canvas = document.createElement("canvas");
          ctx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          ctx.drawSvg(svgString, 0, 0, width, height);
          imageurl = canvas.toDataURL("image/png");
        }
        var content = {"src": imageurl, "height": height, "width": width};
        sectionObject.imageContent = content;
        sectionObject.isImageLoaded = true;
        relCanvas.remove();
      };
      img.crossOrigin = "Anonymous";
      img.src = url;
    }
  }

}
