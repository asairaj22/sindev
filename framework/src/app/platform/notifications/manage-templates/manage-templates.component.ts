import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventsService } from '../service/events.service.js';
import { ApiService } from '../../util/api.service.js';
import { ManageTemplateService } from '../service/manage-template.service.js';
import { DomainService } from '../service/domain.service.js';
import { SidenavService } from '../service/sidenav.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-manage-templates',
  templateUrl: './manage-templates.component.html',
  styleUrls: ['./manage-templates.component.css', '../notification.module.css']
})
export class ManageTemplatesComponent implements OnInit {
  templatesForm: FormGroup;
  templatesGridData: object[];
  eventsDropDownData: object[];
  domainsData: object[];
  nodesData: object[];
  languageOptions: object[];
  ngMultiSelectDefaultSettings: object = {};
  ngMultiSelectEvents: object = {};
  ngMultiSelectLanguage: object = {};
  ngMultiSelectNodes: object = {};
  columnDefs: any;
  node: any;
  listTemplate: boolean;
  newTemplate: boolean = false;
  templateAttrContent: string;
  templateSystemContent: string;
  action: string;
  nodeAttribute: [];
  systemAttribute: object[];
  templates = [];
  templateValues: string;
  selectedEvent: any;
  selectedLang: any;
  attributeSearch = "";
  reqObj = {
    bodyFile: '',
    bodyTemplate: '',
    enabled: false,
    id: '',
    eventId: '',
    lang: '',
    subjectFile: '',
    subjectTemplate: ''

  };
  selectedNode: object[];
  selectedTemplate: any;

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private nav: SidenavService,
    private templateService: ManageTemplateService,
    private eventsService: EventsService,
    private formBuilder: FormBuilder,
    private domainService: DomainService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.nav.show();
    this.ngMultiSelectDefaultSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 7,
      allowSearchFilter: true,
      enableCheckAll: true,
      idField: 'id'
    };
    this.columnDefs = [
      { headerName: 'Language', field: 'lang', sortable: true },
      { headerName: 'Subject', field: 'subjectFile', sortable: true },
      { headerName: 'Body', field: 'bodyFile', sortable: true },
      { headerName: 'Enabled', field: 'enabled', sortable: true },
      { headerName: 'Action', sortable: false }
    ];
    this.initGridDetails();
    this.ngMultiSelectEvents = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
    this.ngMultiSelectLanguage = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
    this.ngMultiSelectNodes = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
  }

  initGridDetails() {
    this.templatesForm = this.formBuilder.group({
      bodyFile: ['', Validators.required],
      bodyTemplate: ['', Validators.required],
      enabled: [false],
      eventId: ['', Validators.required],
      lang: [''],
      subjectFile: ['', [Validators.required, this.subjectValidator.bind(this)]],
      subjectTemplate: ['', Validators.required],
      id: [null]
    });

    this.apiService.loaderShow('loader', 'Loading Templates...');
    this.eventsService.getEvents().subscribe(res => {
      this.eventsDropDownData = res.body._embedded.events;
      this.apiService.loaderHide('loader');
    }, err => {
      this.apiService.loaderHide('loader');
      
    });

    this.templateService.getTemplates().subscribe(res => {
      this.templatesGridData = res.body._embedded.messageTemplates;
    }); // Templatesdata._embedded.messageTemplates;
    this.languageOptions = [{ id: 'en', name: 'English' }, { id: 'fn', name: 'French' }];
        this.getNodesData();
    this.systemAttribute = [
      {
          "name": "URL",
          "type" : "system"
      },
      {
          "name": "EventName",
          "type" : "system"
      },
      {
          "name": "DomainName",
          "type" : "system"
      },
      {
          "name": "Subdomain",
          "type" : "system"
      },
      {
          "name": "Response",
          "type" : "system"
      }
  ];
    this.domainService.getDomains().subscribe(res => {
      this.domainsData = res.body._embedded.domains;
    }, err =>{
      this.toastr.error("Unable to fetch Domains");
      
    });
  }

  subjectValidator(input: FormGroup) {
    if(this.selectedTemplate){
      return this.templatesGridData ? (this.templatesGridData.find(template => template['subjectFile'] === input.value) && input.dirty && this.selectedTemplate.subjectFile !== input.value) ? { duplicateTemplateName: true} : null : true;
    }else{
      return this.templatesGridData ? (this.templatesGridData.find(template => template['subjectFile'] === input.value) && input.dirty) ? { duplicateTemplateName: true} : null : true;
    }
  }


  /**
	 * To Fetch Object data
	*/
	getNodesData() {
		this.templateService.getNodes().subscribe(res => {
			this.nodesData = res.body.objects;
		}, err =>{
      this.toastr.error("Unable to fetch Nodes Data");
      
    });
  }
  
  createTemplate(content, action) {
    this.templatesForm.setValue({
      bodyFile: "",
      bodyTemplate: "",
      enabled: false,
      eventId: "",
      lang: [''],
      subjectFile: "",
      subjectTemplate: "",
      id: ""
    });
    this.selectedEvent = '';
    this.selectedLang = '';
    this.node = "";
    this.selectedNode = [];
    this.selectedTemplate = null;
    this.openPopUp(content, action);
  }

  openPopUp(content, action) {
    this.modalService.open(content, { windowClass: "manage-template-popup" });
    this.action = action;
  }

  drop(event: CdkDragDrop<string[]>, attr) {
    if (event.previousContainer !== event.container) {
      copyArrayItem(event.previousContainer.data, event.container.data,
        event.previousIndex, event.currentIndex);
      let endTag = '{{/'+this.node+'}}';
      let newValue = '';
      if(attr == 'body'){
        newValue = this.templatesForm.value["bodyTemplate"].replace('\n'+endTag, "") +" "+ '{{'+ event.item.data.name +'}}' + '\n'+ endTag;
        this.templatesForm.patchValue({ bodyTemplate: newValue });
      }else{
        newValue = this.templatesForm.value["subjectTemplate"].replace('\n'+endTag, "") +" "+ '{{'+ event.item.data.name +'}}' + '\n'+ endTag;
        this.templatesForm.patchValue({ subjectTemplate: newValue});
      }
    } else {
      moveItemInArray(this.nodeAttribute, event.previousIndex, event.currentIndex);
      console.log(this.templates);
    }
  }
  pushDataintoTemplate(node, attrValue, attr) {
    const newValue = '{{#' + node + '}}' + '\nAdd Content Here ...' + attrValue + '\n{{/' + node + '}}';
    if (attr === 'body') {
      this.templatesForm.patchValue({ bodyTemplate: newValue });
    }
    if (attr === 'system') {
      this.templatesForm.patchValue({ subjectTemplate: newValue });
    }
    if (attr === '') {
      this.templatesForm.patchValue({ bodyTemplate: newValue });
      this.templatesForm.patchValue({ subjectTemplate: newValue });
    }
  }


  getRowData(content, rowData: any) {
    this.selectedEvent = [this.eventsDropDownData.find(eve => eve['id'] === rowData.eventId)][0]['id'];
    this.selectedLang = [this.languageOptions.find(lan => lan['id'] === rowData.lang)][0]['id'];
    this.selectedTemplate = rowData;
    this.templatesForm.setValue({
      bodyFile: rowData.bodyFile,
      bodyTemplate: rowData.bodyTemplate,
      enabled: rowData.enabled,
      eventId: rowData.eventId,
      lang: [''],
      subjectFile: rowData.subjectFile,
      subjectTemplate: rowData.subjectTemplate,
      id: rowData.id
    });
    this.selectedNode = this.nodesData.filter(item => {
      if (rowData.subjectTemplate.indexOf("{{#" + item['model'] + "}}") > -1) {
        const nodeAttributeObj = this.nodesData.filter(item => {
          return item['model'] === item['model'];
        });
        this.node = item['model'];
        this.nodeAttribute = nodeAttributeObj[0]['attributes'];
        return item['model'];
      }

    });

    this.openPopUp(content, 'Edit');

  }

  nodeSeleted(nodeValue) {
    this.templatesForm.patchValue({ bodyTemplate: null }); // controls['bodyTemplate'].setValue('');
    this.templatesForm.patchValue({ subjectTemplate: null });
    const nodeAttributeObj = this.nodesData.filter(item => {
      return item['model'] === nodeValue;
    });
    this.node = nodeValue;
    this.nodeAttribute = nodeAttributeObj[0]['attributes'];
    this.pushDataintoTemplate(nodeValue, '', '');
    console.log(this.nodeAttribute);
  }

  onSubmit(event) {

    if (this.templatesForm.valid) {
      var successMessage = this.templatesForm.value.id != "" ? "Updated Successfully" : "Saved Successfully";
      this.reqObj = {
        bodyFile: this.templatesForm.value.bodyFile,
        bodyTemplate: this.templatesForm.value.bodyTemplate,
        enabled: this.templatesForm.value.enabled,
        id: this.templatesForm.value.id === "" ? null : this.templatesForm.value.id,
        eventId: this.templatesForm.value.eventId,
        lang: this.templatesForm.value.lang,
        subjectFile: this.templatesForm.value.subjectFile,
        subjectTemplate: this.templatesForm.value.subjectTemplate
      };
      this.apiService.loaderShow('loader', 'Loading...');
      this.templateService.saveTemplate(this.reqObj).subscribe(res => {
        this.modalService.dismissAll();
        this.initGridDetails();
        this.apiService.loaderHide('loader');
        this.toastr.success(successMessage);
      }, err => {
        this.apiService.loaderHide('loader');
        this.toastr.error("Something went wrong");
        
      });
    }

  }
  showHighlited(event) {
    console.log(event.target.value);
    const searchText = event.target.value;
    $('.attributes-child').removeClass('highlight');
    $('.attributes-child').children().removeClass('highlight');
    $('.attributes-child').each((index, element) => {
      //let result = 'custom-panel-' + element.id+ '-header';

      if (searchText !== "" && $(element)[0].innerText.includes(searchText)) {
        $(element).addClass('highlight');
        $(element).children().addClass('highlight');
      }
    });
  }

}
