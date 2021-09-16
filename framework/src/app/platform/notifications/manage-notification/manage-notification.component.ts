import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../util/api.service';
import { ManageNotificationService } from '../service/manage-notification.service';
import { INST_OPERATORS, INST_TYPES } from '../models/constants';
import { copyArrayItem } from '@angular/cdk/drag-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

import { ManageTempNotificationService } from '../service/manage-temp-notification';
import { NotificationActiveCheckboxComponent } from './notification-active-checkbox/notification-active-checkbox.component';
import moment from 'moment';
import { MapTemplateService } from '../service/map-template.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, } from '@angular/forms';



@Component({
	selector: 'app-manage-notification',
	templateUrl: './manage-notification.component.html',
	styleUrls: ['./manage-notification.component.css', '../notification.module.css'],
	encapsulation: ViewEncapsulation.None
})
export class ManageNotificationComponent implements OnInit {
	@Input() label: string;
	activeDataList: object[];
	draftDataList: object[];
	@Input() nodesData: object[];
	instOperators = INST_OPERATORS;
	instTypes = INST_TYPES;
	outPutName: string = '';
	columnDefs: any;
	context: any;
	private defaultColDef: any;
	private notificationType;
	selectedInputs = {};
	selectedPlaceHoldeInputs = [];
	nodeAttributes: any[] = [];
	nodesData_Dummy: any[] = [];
	dmnDissemination: any;
	action: string;
	ngMultiSelectNodes: object = {};
	objectKeys = Object.keys;
	reqObj = {};
	domainsData: object[];
	subdomainsData: object[];
	eventsData: object[];
	templatesData: object[];
	highlight = '';
	selectedRules: any[] = [];
	toggleActiveIds: any[] = [];
	isToEnabled: any;
	isCCEnabled: any;
	isBCCEnabled: any;
	// selectedNotificationType: any;
	toEamilAttribute: any;
	selectedDomainId: any;
	selectedSubdomainId: any;
	selectedEventId: any;
	toRecipients: any;
	ccRecipients: any;
	bccRecipients: any;
	selectedTemplateId: any;
	selectedLanguage: any;
	isVisible: any;
	rowSelection: string;
	gridApiActive: any;
	gridApiDraft: any;
	selectedRow: any[];
	frameworkComponents: any;
	istoggle: boolean;
	draggedAttributes: any[];
	selectedIndex: any;
	ruleId: any;
	selectedRuleObject: any;
	createFlag: boolean;
	selectedNodes: any[];
	singleRuleJson: {};
	REQUEST_JSON: any;
	notificationJson: {};
	isEdit: boolean;
	GET_DMNDISSEMINATION: {};
	SELECTED_RULE: any;
	SELECTED_EVENTS: any;
	DOMAINS: any[];
	GET_NODES_output: any[];
	GET_PUSH_TEMPLATE: {};
	status: any;
	searchText: any;
	pageSize: any;
	ruleForm: FormGroup;
	draggedEmail: any[];
	domLayout : any;


	constructor(
		private apiService: ApiService,
		private manageNotificatioService: ManageNotificationService,
		private modalService: NgbModal,
		private manageTempNotificationService: ManageTempNotificationService,
		private mapTemplateService: MapTemplateService,
		private formBuilder: FormBuilder,
		private toastr: ToastrService) {
		this.frameworkComponents = {
			notificationActiveCheckboxComponent: NotificationActiveCheckboxComponent,
		}
	}

	/**
	 * To initiate the Active Grid
	 * @param params 
	 */
	onActiveGridReady(params) {
		this.gridApiActive = params.api;
		this.getActiveRules();
	}
	onDraftGridReady(params) {
		this.gridApiDraft = params.api;
		this.getDraftRules();
	}
	/**
	 * To Fetch all the Active Rules
	 */
	getActiveRules() {
		const activeData = { 'dmnLabel': this.apiService.accountName + '_DMN', 'status': 'Active', 'input': '{}' };
		this.manageNotificatioService.getSubscriptionsActive(activeData).subscribe(res => {
			const response = res.body.tableBody;
			this.activeDataList = response ? Object.keys(response).map(i => response[i]) : [];
		}, err => {
			
		});
	}
	/**
	 * To Fetch all the Draft Rules
	 */
	getDraftRules() {
		const draftData = { 'dmnLabel': this.apiService.accountName + '_DMN', 'status': 'Draft', 'input': '{}' };
		this.manageNotificatioService.getSubscriptionsDraft(draftData).subscribe(res => {
			const response = res.body.tableBody;
			this.draftDataList = response ? Object.keys(response).map(i => response[i]) : [];
		}, err => {
			
		});
	}

	/**
	 * To Fetch Object data
	 */
	getNodesData() {
		this.manageTempNotificationService.getNodes().subscribe(res => {
			this.nodesData = res.body.objects;
			this.nodeAttributes = this.nodesData;
			this.nodesData.forEach((element) => {
				var name = element['model'];
				element['attributes'].forEach((attr) => {
					attr['parentId'] = name;
				});
			})
		});
	}

	/**
	 * To get all the available domains
	 */
	getDomains() {
		this.DOMAINS = [];
		this.manageNotificatioService.getDomains().subscribe(res => {
			if (res.body) {
				var output = res.body;
				if (output.hasOwnProperty("_embedded")) {
					var outputData = output["_embedded"];
					if (outputData.hasOwnProperty("domains")) {
						var domainList = outputData["domains"];
						for (var i = 0; i < domainList.length; i++) {
							var obj = {};
							obj["type"] = "option";
							obj["id"] = domainList[i].id;
							obj["name"] = domainList[i].name;
							this.DOMAINS.push(obj);
						}
					}
				}
			}
		});
	}

	/**
	 * To initialize the grid data
	 */
	initGridDetails() {
		this.context = { componentParent: this };
		this.notificationType = ['Event', 'Push'];
	}

	/**
	 * To validate the given Email
	 */
	emailValidator(input: FormGroup) {
		var emailPattern = /([\w+\._%-]+@[\w+\.-]+\.[\w+]{2,4}[^,;\s])$/i;
		var isValidEmail = emailPattern.test(input.value);
		if (!isValidEmail && input.dirty && input.value !== "") {
			return { incorrectEmail: true };
		} else {
			return true;
		}
	}

	ngOnInit() {
		this.isToEnabled = false;
		this.isCCEnabled = false;
		this.isBCCEnabled = false;
		this.isVisible = false;
		this.pageSize = 10;
		this.domLayout = 'autoHeight';
		this.getNodesData();
		this.getDomains();
		this.addDefaultsToGrid();
		this.initGridDetails();
		this.ruleForm = this.formBuilder.group({
			name: ['', Validators.required],
			toEmailId: ['', [this.emailValidator.bind(this)]],
			ccEmailId: ['', [this.emailValidator.bind(this)]],
			bccEmailId: ['', [this.emailValidator.bind(this)]]
		});
	}

	/**
	 * To set default values to the grid
	 */
	addDefaultsToGrid() {
		this.dmnDissemination = {
			bcc: '',
			cc: '',
			lang: '',
			primaryRecipients: '',
			ruleId: '',
			ruleType: '',
			templateprefix: '',
			events: [{
				domainId: '',
				eventid: '',
				subdomainId: '',
				templateId: ''
			}]
		};

		this.columnDefs = [
			{
				width: 250,
				headerName: 'Output', valueGetter(value) {
					return value.data.ruleOutputs[0].outputTextValue;
				}, sortable: false
			},
			{
				width: 120,
				headerName: 'Active',
				field: 'active',
				cellRenderer: 'notificationActiveCheckboxComponent',
				cellRendererParams: {
					onClick: this.onActiveStatusChange.bind(this),
				},
				sortable: false
			},
			{ width: 530, headerName: 'Rules', field: 'id', sortable: false },
			{
				width: 400,
				headerName: 'Conditions', valueGetter(value) {
					const attr = value.data.ruleInputs[0].Name.split('.');
					return attr[0] + ' ' + attr[1] + value.data.ruleInputs[0].actualTextValue;
				}, sortable: false
			}
		];
		this.rowSelection = "single";
	}


	/**
	 * To check the checkbox of the the selected Node in edit mode
	 */
	checkNodeName(node) {
		if (this.selectedNodes.includes(node.model)) {
			this.onNodeSelected(node, true);
			return true;
		}
		else
			return false;
	}

	/**
	 * Functionality behind the checkbox selection
	 * To display the selected node in the Attribute field
	 */
	onNodeSelected(node, event) {
		let isChecked;
		if (event == true) {
			isChecked = true;
		}
		else {
			isChecked = event.target.checked;
		}
		if (!isChecked) {
			this.nodeAttributes.splice(this.nodesData.indexOf(node), 1);
		} else if (this.nodeAttributes.find(ele => ele['id'] == node['id']) == undefined) {
			this.nodeAttributes.push(node);
		}
	}

	/**
	 * To drop the draged attribute into the droped area
	 */
	drop(event, type) {
		if (event.previousContainer !== event.container) {
			copyArrayItem(event.previousContainer.data, event.container.data,
				event.previousIndex, event.currentIndex);
			if (type === "to") {
				this.notificationJson['primaryRecipients'] = '$.' + event.item.data.parentId + '[0].' + event.item.data.name;
			} else if (type === "cc") {
				this.notificationJson['cc'] = '$.' + event.item.data.parentId + '[0].' + event.item.data.name;
			} else if (type == "bcc") {
				this.notificationJson['bcc'] = '$.' + event.item.data.parentId + '[0].' + event.item.data.name;
			}else {
				var name = "";
				event.container.data.forEach(element => {
				name = element['parentId'] + '.' + event.item.data.name;
				});

				this.draggedAttributes.push(name);
				var newAttrJson = {};
				newAttrJson['node'] = name;
				if (newAttrJson['node'].indexOf(".") != -1) {
					var columnName = newAttrJson['node'].split(".");
					newAttrJson['node'] = columnName[0];
				}
				var index = name.indexOf(".");
				newAttrJson['attribute'] = name.substring(index + 1, name.length);
				newAttrJson['value'] = "";

				var isPresent = false;
				for (var i = 0; i < this.singleRuleJson['columns'].length; i++) {
					if (this.singleRuleJson['columns'][i].name == name) {
						isPresent = true
						break;
					}
				}
				if (!isPresent) {
					var json = {};
					json['name'] = name;
					json['type'] = "";
					json['values'] = [];
					this.singleRuleJson['columns'].push(json);
				}

				this.singleRuleJson['rules'][0].inputs.push(newAttrJson);

			}

		}

	}

	/**
	 * To deleted the dragged attribute from dropped area
	 */
	deleteType(eachType) {
		this.selectedInputs[eachType['parentId']].splice(this.selectedInputs[eachType['parentId']].indexOf(eachType), 1);
		if (!this.selectedInputs[eachType['parentId'].length]) {
			delete this.selectedInputs[eachType['parentId']];
		}
		this.selectedPlaceHoldeInputs.splice(this.selectedPlaceHoldeInputs.indexOf(eachType), 1);
	}

	/**
	 * To Create or Edit the rule
	 */
	createRule(content, action) {
		this.selectedDomainId = null;
		this.selectedSubdomainId = null;
		this.selectedEventId = null;
		this.isVisible = false;
		this.toRecipients = null;
		this.ccRecipients = null;
		this.bccRecipients = null;
		this.selectedTemplateId = null;
		this.selectedLanguage = null;
		this.selectedRules = [];
		this.nodeAttributes = [];
		this.selectedInputs = {};
		this.outPutName = '';
		this.subdomainsData = [];
		this.eventsData = [];
		this.selectedPlaceHoldeInputs = [];
		this.notificationJson = {};
		this.SELECTED_EVENTS = [];
		this.SELECTED_RULE = [];
		this.selectedRow = [];
		this.draggedEmail = [];

		if (action == "Create") {
			this.draggedAttributes = [];
			this.createFlag = true;
			this.selectedNodes = [];
			this.singleRuleJson = {};
			this.singleRuleJson['columns'] = [];
			this.singleRuleJson['rules'] = [];

			this.notificationJson['ruleType'] = "event";
			this.notificationJson['ruleId'] = "";
			this.notificationJson['events'] = [];

			var obj = {};
			obj['domainId'] = "";
			obj['subdomainId'] = "";
			obj['eventid'] = "";

			this.notificationJson['events'].push(obj);
			this.selectedRow.push(obj);

			this.notificationJson['primaryRecipients'] = "";
			this.notificationJson['cc'] = "";
			this.notificationJson['bcc'] = "";
			this.notificationJson['templateprefix'] = "";
			this.notificationJson['lang'] = "";

			var json = {};
			json["output"] = {
				"name": "",
				"description": "",
				"requestedFields": []
			};
			json["inputs"] = [];
			json["active"] = "1";
			json["horizontal"] = "0";
			json["grouping"] = "0";

			this.singleRuleJson['rules'].push(json);
			this.openPopUp(content, action);
		} else {
			this.apiService.loaderShow('loader', 'Loading...');
			if (this.selectedIndex != undefined) {
				this.isEdit = true;
				var obj = {};
				obj['id'] = this.selectedIndex;
				obj['dmnLabel'] = this.apiService.accountName + '_DMN';
				obj['status'] = this.status;
				
				this.manageNotificatioService.retriveRuleById(obj).subscribe(data => {
					if (data.body) {
						this.draggedAttributes = [];
						this.selectedNodes = [];
						this.singleRuleJson = {};
						this.singleRuleJson['columns'] = [];
						this.singleRuleJson['rules'] = [];
						var json = {};
						if (data.body) {
							var outputData = data.body.Rule.ruleOutputs[0];
							json["output"] = {
								"name": outputData.Name,
								"description": outputData.description,
								"requestedFields": outputData.requestedFields ? outputData.requestedFields : []
							};
							json["active"] = data.body.Rule.active;
							json["horizontal"] = data.body.Rule.horizontal;
							json["grouping"] = data.body.Rule.grouping;

							var inputArray = this.parseRuleInputs(data.body.Rule.ruleInputs);
							json["inputs"] = inputArray;
						} else {
							json["output"] = {
								"name": "",
								"description": ""
							};
							json["inputs"] = [];
							json["active"] = "1";
							json["horizontal"] = "0";
							json["grouping"] = "0";
						}


						this.singleRuleJson['rules'].push(json);
					}
				}, err =>{
					
				});

				this.notificationJson['ruleType'] = "event";
				this.notificationJson['ruleId'] = "";
				this.notificationJson['events'] = [];

				var obj = {};
				obj['domainId'] = "";
				obj['subdomainId'] = "";
				obj['eventid'] = "";

				this.notificationJson['events'].push(obj);
				this.SELECTED_RULE.push(obj);

				this.notificationJson['primaryRecipients'] = "";
				this.notificationJson['cc'] = "";
				this.notificationJson['bcc'] = "";
				this.notificationJson['templateprefix'] = "";
				this.notificationJson['lang'] = "";

				var eventObj = {};
				eventObj['ruleId'] = this.selectedIndex;
				this.manageNotificatioService.getDraftDataToEdit(eventObj).subscribe(resp => {
					if (resp.body) {
						var output = resp.body;
						this.notificationJson = output;
						if (!this.notificationJson['events']) {
							this.notificationJson['events'] = [];
						}
						if (!this.notificationJson['primaryRecipients'] || this.notificationJson['primaryRecipients'] == "null") {
							this.notificationJson['primaryRecipients'] = "";
						} else {
							if (this.notificationJson['primaryRecipients'].startsWith("$.")) {
								this.notificationJson['primaryRecipientsIsDynamic'] = true;
							}
						}
						if (!this.notificationJson['cc'] || this.notificationJson['cc'] == "null") {
							this.notificationJson['cc'] = "";
						} else {
							if (this.notificationJson['cc'].startsWith("$.")) {
								this.notificationJson['ccIsDynamic'] = true;
							}
						}
						if (!this.notificationJson['bcc'] || this.notificationJson['bcc'] == "null") {
							this.notificationJson['bcc'] = "";
						} else {
							if (this.notificationJson['bcc'].startsWith("$.")) {
								this.notificationJson['bccIsDynamic'] = true;
							}
						}
						if (!this.notificationJson['pushDomainId'] || this.notificationJson['pushDomainId'] == "null") {
							this.notificationJson['pushDomainId'] = "";
						} else {

							this.getSubdomains(this.notificationJson['pushDomainId'], undefined);
						}
						if (!this.notificationJson['pushSubDomainId'] || this.notificationJson['pushSubDomainId'] == "null") {
							this.notificationJson['pushSubDomainId'] = "";
						} else {

							this.getEvents(this.notificationJson['pushSubDomainId'], undefined);
						}
						if (!this.notificationJson['pushEventId'] || this.notificationJson['pushEventId'] == "null") {
							this.notificationJson['pushEventId'] = "";
						} else {
							this.getTemplates(this.notificationJson['pushEventId']);
						}

						if (!this.notificationJson['templateprefix'] || this.notificationJson['templateprefix'] == "null") {
							this.notificationJson['templateprefix'] = "";
						}
						if (!this.notificationJson['lang'] || this.notificationJson['lang'] == "null") {
							this.notificationJson['lang'] = "";
						}

						if (this.notificationJson['events'].length > 0) {
							for (var i = 0; i < this.notificationJson['events'].length; i++) {
								var obj = this.notificationJson['events'][i];
								this.getSubdomains(obj.domainId, i);
								this.getEvents(obj.subdomainId, i);
								this.updateEvents(obj.eventid, i);
								this.selectedRow.push(obj);
								this.apiService.loaderHide('loader');
								this.openPopUp(content, action);
							}
						} else {
							var obj = {};
							obj.domainId = "";
							obj.subdomainId = "";
							obj.eventid = "";

							this.notificationJson['events'].push(obj);
							this.selectedRow.push(obj);
							this.apiService.loaderHide('loader');
							this.openPopUp(content, action);
						}

					}
				}, err =>{
					this.apiService.loaderHide('loader');
					this.toastr.error("Something went wrong");
				});
			}
		}

	}

	/**
	 * To update the events
	 */
	updateEvents(eventId, index) {
		if (this.SELECTED_EVENTS.indexOf(eventId) != -1) {
			this.notificationJson['events'][index].eventid = "";
			this.SELECTED_EVENTS[index] = "";
			this.toastr.error("Event Already Selected")
		} else {
			this.SELECTED_EVENTS.push(eventId);
		}
	}

	/**
	 * To get the events associated with the given subdomain
	 */
	getEvents(subdomainId, index) {

		if (this.notificationJson['ruleType'] == "event" && index != undefined) {
			this.SELECTED_RULE[index] ? this.SELECTED_RULE[index].EVENTS = [] : this.SELECTED_RULE.push({ EVENTS: [] });
		} else {
			this.notificationJson['PUSH_EVENTS'] = [];
		}
		this.apiService.loaderShow('loader', 'Loading...');
		this.apiService.invokePlatformApi('/events/' + subdomainId, 'GET').subscribe(res => {

			if (res.body) {
				var output = res.body;
				if (output.hasOwnProperty("_embedded")) {
					var outputData = output["_embedded"];
					if (outputData.hasOwnProperty("events")) {
						var eventsList = outputData["events"];
						for (var i = 0; i < eventsList.length; i++) {
							var obj = {};
							obj["type"] = "option";
							obj["id"] = eventsList[i].id;
							obj["name"] = eventsList[i].name;
							if (this.notificationJson['ruleType'] == "event") {
								this.SELECTED_RULE[index].EVENTS.push(obj);
							} else if (this.notificationJson['ruleType'] == "push") {
								this.notificationJson['PUSH_EVENTS'].push(obj);
							}
						}
					}
				}
			}
			this.apiService.loaderHide('loader');
		}, err => {
			this.apiService.loaderHide('loader');
			this.toastr.error("Unable to fetch Events");
		});
	}

	/**
	 * To Fetch the subdomains associated with the given domain
	 */
	getSubdomains(domainId, index) {
		if (this.notificationJson['ruleType'] == "event" && index != undefined) {
			this.SELECTED_RULE[index] ? this.SELECTED_RULE[index].SUBDOMAINS = [] : this.SELECTED_RULE.push({ SUBDOMAINS: [] });
		} else {
			this.notificationJson['PUSH_SUBDOMAINS'] = [];
		}
		this.apiService.loaderShow('loader', 'Loading...');
		this.apiService.invokePlatformApi('/subdomains/' + domainId, 'GET').subscribe(res => {
			if (res.body) {
				var output = res.body;
				if (output.hasOwnProperty("_embedded")) {
					var outputData = output["_embedded"];
					if (outputData.hasOwnProperty("subdomains")) {
						var subdomainList = outputData["subdomains"];
						for (var i = 0; i < subdomainList.length; i++) {
							var obj = {};
							obj["type"] = "option";
							obj["id"] = subdomainList[i].id;
							obj["name"] = subdomainList[i].name;
							if (this.notificationJson['ruleType'] == "event") {
								this.SELECTED_RULE[index].SUBDOMAINS.push(obj);
							} else if (this.notificationJson['ruleType'] == "push") {
								this.notificationJson['PUSH_SUBDOMAINS'].push(obj);
							}
						}
					}
				}
			}
			this.apiService.loaderHide('loader');
		}, err =>{
			this.apiService.loaderHide('loader');
			this.toastr.error("Unable to fetch Subdomains");
		});
	}

	/**
	 * To open the modal popup
	 */
	openPopUp(content, action) {
		this.modalService.open(content, { size: 'lg' });
		this.action = action;
	}

	/**
	 * To Save the rule in create or edit mode
	 */
	save() {
		if (!this.singleRuleJson['rules'][0].horizontal) {
			this.singleRuleJson['rules'][0].horizontal = '0';
		}

		this.formatRuleInputs();

		console.log(JSON.stringify(this.singleRuleJson));
		this.saveDMN();
	}

	/**
	 * To archive the selected rule
	 */
	archiveData() {
		const inputData = {
			id: this.selectedIndex,
			dmnLabel: this.apiService.accountName + '_DMN'
		}
		this.apiService.loaderShow('loader', 'Loading...');
		this.manageNotificatioService.archiveData(inputData).subscribe(res => {
			this.getActiveRules();
			this.apiService.loaderHide('loader');
			this.selectedIndex = undefined;
			this.toastr.success("Rule Archived");
		}, err=>{
			this.apiService.loaderHide('loader');
			this.toastr.error("Something went wrong");
		})
	}

	/**
	 * To activate the rule
	 */
	activateRule() {
		let reqObj = {
			"id": this.selectedIndex,
			"dmnLabel": this.apiService.accountName + "_DMN"
		};
		this.apiService.loaderShow('loader', 'Loading...');
		this.manageNotificatioService.activateRule(reqObj).subscribe(res => {
			this.getDraftRules();
			this.getActiveRules();
			this.apiService.loaderHide('loader');
			this.selectedIndex = undefined;
			this.toastr.success("Rule Activated");
		}, err =>{
			this.apiService.loaderHide('loader');
			this.toastr.error("Something went wrong");
		})
	}

	/**
	 * To set the selected row on changing the row selection in grid
	 */
	onDraftSelectionChanged(event: any) {
		this.status = "Draft";
		this.pageSize = 10;
		this.selectedIndex = this.gridApiDraft.getSelectedRows()[0].id;
	}

	/**
	 * To set the selected row on changing the row selection in grid
	 */
	onActiveSelectionChanged(event: any) {
		this.status = "Active";
		this.pageSize = 10;
		this.selectedIndex = this.gridApiActive.getSelectedRows()[0].id;
	}

	/**
	 * To change the status of rule (Active/In Active)
	 */
	onActiveStatusChange(obj) {
		obj = obj.rowData;
		this.istoggle = true;
		this.draggedAttributes = [];
		this.selectedIndex = obj.id;
		this.ruleId = obj.id;
		this.selectedRuleObject = obj;
		this.createFlag = false;
		this.selectedNodes = [];
		this.singleRuleJson = {};
		this.singleRuleJson['columns'] = [];
		this.singleRuleJson['rules'] = [];

		var json = {};
		if (this.selectedRuleObject.ruleOutputs && this.selectedRuleObject.ruleOutputs[0]) {
			var outputData = this.selectedRuleObject.ruleOutputs[0];
			json["output"] = {
				"name": outputData.Name,
				"description": outputData.description
			};
			json["active"] = obj.active;
			json["horizontal"] = this.selectedRuleObject.horizontal;

			var inputArray = this.parseRuleInputs(this.selectedRuleObject.ruleInputs);
			json["inputs"] = inputArray;
		}
		this.singleRuleJson['rules'].push(json);
		this.formatRuleInputs();
		console.log(JSON.stringify(this.singleRuleJson));
		this.saveDMN();
	}

	/**
	 * To save the data in both create and edit mode
	 * To Crete a Rule
	 */
	saveDMN() {

		var isValid = this.saveDMNContent();
		if (isValid && this.createFlag) {
			var obj = {};
			var reqObj = {};
			obj['dmnLabel'] = this.apiService.accountName + '_DMN';
			reqObj = obj;
			reqObj['input'] = JSON.parse(JSON.stringify(this.REQUEST_JSON));
			this.apiService.loaderShow('loader', 'Loading...');
			this.manageNotificatioService.createNewRule(reqObj).subscribe((res) => {
				if (res.body) {
					var output = res.body;
					if (output.hasOwnProperty("ruleId")) {
						// toastr.success("Rule Created");
						var ruleId = output["ruleId"];
						this.updateNotificationEntry(ruleId,this.createFlag);
					}
				}
				this.createFlag = false;
			}, err =>{
				this.apiService.loaderHide('loader');
				this.toastr.error("Something went wrong");
				
			});
		} else if (isValid && !this.createFlag) {
			var obj = {};
			var reqObj = {};
			obj['id'] = this.selectedIndex;
			obj['dmnLabel'] = this.apiService.accountName + '_DMN';
			reqObj = obj;
			reqObj['input'] = JSON.parse(JSON.stringify(this.REQUEST_JSON));
			this.manageNotificatioService.updateRule(reqObj).subscribe((res) => {
				if (res.body) {
					var output = res.body;
					if (output.hasOwnProperty("ruleId")) {
						var ruleId = output["ruleId"];
						this.updateNotificationEntry(ruleId,false);
					}
				}
				this.createFlag = false;
			})
		}
	}

	/**
	 * To create dmn disemination for the created rule
	 */
	updateNotificationEntry(ruleId, isCreate) {
		this.notificationJson['ruleId'] = ruleId;
		this.manageNotificatioService.createDmnDissemination(this.notificationJson).subscribe((res) => {
			this.getDraftRules();
			this.getActiveRules();
			if(isCreate){
				this.toastr.success("Saved Successfully");
			}else{
				this.toastr.success("Updated Successfully");
			}
			this.apiService.loaderHide('loader');
			this.modalService.dismissAll();
		})

	}

	/**
	 * To check whether the rule data are valid or invalid
	 */
	saveDMNContent(): boolean {

		var valid = true;
		if (this.singleRuleJson && this.singleRuleJson['rules'] && this.singleRuleJson['rules'][0].output
			&& this.singleRuleJson['rules'][0].output.name == "") {
			this.toastr.error("Output is mandatory");
			return false;
		};

		var dmnStr = JSON.stringify(this.singleRuleJson);
		var dmn = dmnStr.replace(/,"\\$\\$hashKey"[^},]+/g, '');

		this.REQUEST_JSON = JSON.parse(dmn);

		var columnAttributeArr = [];
		var symtomNameArr = [];
		for (var i = 0; i < this.REQUEST_JSON['rules'][0].inputs.length; i++) {
			var ruleArr = this.REQUEST_JSON.rules[0].inputs;
			var symptomObject = this.REQUEST_JSON.rules[0].output;
			if (!this.REQUEST_JSON.rules[0].horizontal) {
				this.REQUEST_JSON.rules[0].horizontal = '0';
			}
			var symptomObjectName = symptomObject.name.trim();
			var dataStr = "";
			for (var j = 0; j < ruleArr.length; j++) {
				var node = ruleArr[j].node;
				var attr = ruleArr[j].attribute;

				if (!ruleArr[j].isNode) {
					ruleArr[j].isNode = 'false';
				}
				var ruleIsNode = ruleArr[j].isNode;

				if (!ruleArr[j].groupBy) {
					ruleArr[j].groupBy = 'false';
				}

				var value = this.getRuleValue(ruleArr[j]);
				if (ruleArr[j].groupBy == 'true') {
					var valueExp = "";
					var values = value.split(" ");
					if (isNaN(values[1])) {
						valueExp = 'eportalJEXL.All("' + values[0] + '","' + values[1] + '",payload)';
					} else {
						valueExp = 'eportalJEXL.AllDouble("' + values[0] + '","' + values[1] + '",payload)';
					}
					value = ruleArr[j].value = valueExp;
				} else if (ruleArr[j].availability == 'true') {
					var valueExp = "";
					if (ruleArr[j].param1 && ruleArr[j].param2 && ruleArr[j].param3 && ruleArr[j].param4) {
						valueExp = 'eportaljexl.aggregate.availability(' + ruleArr[j].param1 + ',' + ruleArr[j].param2 + ',' + ruleArr[j].param3 + ',' + ruleArr[j].param4 + ')';
					}
					value = ruleArr[j].value = valueExp;
				}

				dataStr += node + attr + value + ruleIsNode;
			}

		}
		$("#spinner").show();

		return valid;
	}

	/**
	 * To get the rule value
	 */
	getRuleValue(rule: any) {
		if (rule.groupBy == "true") {
			var startIndx = rule.value.indexOf("(");
			var endIndex = rule.value.indexOf(")");
			if (rule.value.indexOf("eportalJEXL") != -1 && startIndx != -1 && endIndex != -1) {
				var data = rule.value.substring(startIndx + 1, endIndex);
				var dataArr = data.split(",");
				var operator = dataArr[0].substring(1, dataArr[0].length - 1);
				var content = dataArr[1].substring(1, dataArr[1].length - 1);
				return (rule.value = operator + " " + content);
			} else if (rule.value.indexOf("eportalJEXL") == -1) {
				return (rule.value);
			}
		} else {
			return (rule.value);
		}
	}

	/**
	 * To format the rule information in a correct format
	 */
	formatRuleInputs() {

		for (var i = 0; i < this.singleRuleJson['rules'][0].inputs.length; i++) {
			var node = this.singleRuleJson['rules'][0].inputs[i].node;
			var attribute = this.singleRuleJson['rules'][0].inputs[i].attribute;
			var attributeName = node + "." + attribute;
			var ruleObj = this.singleRuleJson['rules'][0].inputs[i];
			if (!ruleObj.operator) {
				ruleObj.operator = "";
			}
			if (ruleObj.type == "date") {
				if (!ruleObj.dateValue || ruleObj.dateValue.trim() == "") {
					var days = (ruleObj.days && ruleObj.days.trim() != "") ? ruleObj.days : '0';
					var months = (ruleObj.months && ruleObj.months.trim() != "") ? ruleObj.months : '0';
					var years = (ruleObj.years && ruleObj.years.trim() != "") ? ruleObj.years : '0';
					if (isNaN(days) || isNaN(months) || isNaN(years)) {
						this.toastr.error("Date is not Valid");
						return;
					}
					ruleObj.value = days.trim() + " Days" + "/" + months.trim() + " Months" + "/" + years.trim() + " Years";
				} else {
					var formats = ["yyyy-MM-DDTHH:mm:ss"];
					var isValid = moment(ruleObj.dateValue, formats).isValid();
					if (!isValid) {
						this.toastr.error("Date is not Valid");
						return;
					}
					ruleObj.value = ruleObj.dateValue;

				}
			}

			if (!ruleObj.value) {
				ruleObj.value = "";
			}

			ruleObj.value = ruleObj.operator + " " + "\"" + ruleObj.value + "\"";
			delete ruleObj.operator;
			for (var j = 0; j < this.singleRuleJson['columns'].length; j++) {
				if (this.singleRuleJson['columns'][j].name == attributeName) {
					this.singleRuleJson['columns'][j].type = ruleObj.type ? ruleObj.type : "";
					this.singleRuleJson['columns'][j].values = [];
					break;
				}
			}
			delete ruleObj.type;
			delete ruleObj.values;

			if (ruleObj.dateValue || ruleObj.dateValue == "") {
				delete ruleObj.dateValue;
			}

			if (ruleObj.days || ruleObj.days == "") {
				delete ruleObj.days;
			}
			if (ruleObj.months || ruleObj.months == "") {
				delete ruleObj.months;
			}
			if (ruleObj.years || ruleObj.years == "") {
				delete ruleObj.years;
			}

			if (!ruleObj.isNode) {
				ruleObj.isNode = 'false';
			}
		}

		for (var i = 0; i < this.singleRuleJson['rules'][0].inputs.length; i++) {
			if (this.singleRuleJson['rules'][0].inputs[i] == undefined || this.singleRuleJson['rules'][0].inputs[i] == null) {
				this.singleRuleJson['rules'][0].inputs.splice(i, 1);
			}
		}
	}

	/**
	 * To Parse the rule input
	 */
	parseRuleInputs(input) {

		var inputArr = [];
		for (var i = 0; i < input.length; i++) {
			var obj = input[i];
			var resp = {};
			if (obj.Name) {
				resp['node'] = obj.Name;
				if (resp['node'].indexOf(".") != -1) {
					var columnName = resp['node'].split(".");
					resp['node'] = columnName[0];
					if (this.selectedNodes.indexOf(columnName[0]) == -1) {
						this.selectedNodes.push(columnName[0]);
					}
				}
				var index = obj.Name.indexOf(".");
				resp['attribute'] = obj.Name.substring(index + 1, obj.Name.length);
			}
			var isColumnPresent = false;
			for (var j = 0; j < this.singleRuleJson['columns'].length; j++) {
				if (this.singleRuleJson['columns'][j].name == obj.Name) {
					resp['type'] = obj.typeName;
					resp['values'] = [];
					isColumnPresent = true;
					break;
				}
			}
			if (!isColumnPresent) {
				var json = {};
				json['name'] = obj.Name;
				json['type'] = obj.typeName;
				json['values'] = [];
				this.singleRuleJson['columns'].push(json);
				resp['type'] = obj.typeName;
			}
			var value = obj.actualTextValue;
			if (value) {
				resp['operator'] = "";
				if (obj.groupBy == "true") {
					var startIndx = value.indexOf("(");
					var endIndex = value.indexOf(")");
					if (value.indexOf("eportalJEXL") != -1 && startIndx != -1 && endIndex != -1) {
						var data = value.substring(startIndx + 1, endIndex);
						var dataArr = data.split(",");
						resp['operator'] = dataArr[0].substring(1, dataArr[0].length - 1);
						resp['value'] = dataArr[1].substring(1, dataArr[1].length - 1);
					} else if (value.indexOf("eportalJEXL") == -1) {
						var valueArray = value.split(" ");
						resp['operator'] = valueArray[0]; //value.charAt(0);
						resp['value'] = value.substring(value.indexOf(" ") + 2, value.length - 1).trim();
					}
				} else if (value.indexOf("eportaljexl.aggregate.availability") != -1) {
					var startIndx = value.indexOf("(");
					var endIndex = value.indexOf(")");
					if (startIndx != -1 && endIndex != -1) {
						var data = value.substring(startIndx + 1, endIndex);
						var dataArr = data.split(",");
						resp['param1'] = dataArr[0];
						if (resp['param1'].indexOf(".") != -1) {
							var param1Resp = resp['param1'].split(".");
							if (this.selectedNodes.indexOf(param1Resp[0]) == -1) {
								this.selectedNodes.push(param1Resp[0]);
							}
						}
						resp['param2'] = dataArr[1];
						if (resp['param2'].indexOf(".") != -1) {
							var param2Resp = resp['param2'].split(".");
							if (this.selectedNodes.indexOf(param2Resp[0]) == -1) {
								this.selectedNodes.push(param2Resp[0]);
							}
						}
						resp['param3'] = dataArr[2];
						if (resp['param3'].indexOf(".") != -1) {
							var param3Resp = resp['param3'].split(".");
							if (this.selectedNodes.indexOf(param3Resp[0]) == -1) {
								this.selectedNodes.push(param3Resp[0]);
							}
						}
						resp['param4'] = dataArr[3];
						if (resp['param4'].indexOf(".") != -1) {
							var param4Resp = resp['param3'].split(".");
							if (this.selectedNodes.indexOf(param4Resp[0]) == -1) {
								this.selectedNodes.push(param4Resp[0]);
							}
						}
						resp['availability'] = "true";
						resp['value'] = "";
					}
				} else if (/^[<>=!]/.test(value)) {
					var valueArray = value.split(" ");
					resp['operator'] = valueArray[0]; //value.charAt(0);
					resp['value'] = value.substring(value.indexOf(" ") + 2, value.length - 1).trim();
				} else {
					var valueArray = value.split(" ");
					resp['operator'] = valueArray[0]; //value.charAt(0);
					resp['value'] = value.substring(value.indexOf(" ") + 2, value.length - 1).trim();
				}
				resp['value'] = resp['value'].trim();
			}
			resp['isNode'] = obj.isNode ? obj.isNode : "false";
			resp['anyTrue'] = obj.anyTrue ? obj.anyTrue : "false";
			resp['processVertically'] = obj.processVertical ? obj.processVertical : "false";
			resp['returnIfMissing'] = obj.returnIfMissing ? obj.returnIfMissing : "false";
			resp['group'] = obj.group ? obj.group : "";

			if (obj.typeName && obj.typeName == "date") {
				if (resp['value'].indexOf("/") != -1) {
					var datesArray = resp['value'].split("/");
					if (datesArray[0]) {
						var date = datesArray[0].split(" ")[0];
						resp['days'] = date;
					}
					if (datesArray[1]) {
						var month = datesArray[1].split(" ")[0];
						resp['months'] = month;
					}

					if (datesArray[2]) {
						var year = datesArray[2].split(" ")[0];
						resp['years'] = year;
					}
					resp['value'] = "";

				} else {
					resp['dateValue'] = resp['value'];
				}
			}
			inputArr.push(resp);
		}
		return inputArr;
	}

	/**
	 * To set the language while selecting the template value
	 */
	setTemplateLanguage(template) {
		var filtered = this.notificationJson['PUSH_TEMPLATE'].filter(function (value) {
			return value.id === template;
		});
		if (filtered.length > 0) {
			this.notificationJson['lang'] = filtered[0].lang;
		} else {
			this.notificationJson['lang'] = "";
		}
	}

	/**
	 * To get the templates associated with the given event
	 */
	getTemplates(eventId) {

		this.notificationJson['PUSH_TEMPLATE'] = [];
		this.notificationJson['PUSH_LANGUAGE'] = [];

		var obj = {};
		obj["eventId"] = eventId;
		this.GET_PUSH_TEMPLATE = obj;
		this.apiService.loaderShow('loader', 'Loading...');
		this.mapTemplateService.getTemplatesByEventId(obj).subscribe(res => {
			if (res.body) {
				var output = res.body;
				if (output.hasOwnProperty("_embedded")) {
					var outputData = output["_embedded"];
					if (outputData.hasOwnProperty("notificationTemplates")) {
						var notificationTemplatesList = outputData["notificationTemplates"];
						for (var i = 0; i < notificationTemplatesList.length; i++) {
							var obj = {};
							obj["type"] = "option";
							obj["id"] = notificationTemplatesList[i].body;
							obj["name"] = notificationTemplatesList[i].subject;
							obj["lang"] = notificationTemplatesList[i].language;
							obj["subject"] = notificationTemplatesList[i].subject;
							this.notificationJson['PUSH_TEMPLATE'].push(obj);
						}
					}
				}
			}
			this.apiService.loaderHide('loader');
		}, err =>{
			this.toastr.error("Something went wrong");
		});
	};

	/**
	 * To delete the selected rule
	 */
	deleteRule() {
		let obj = {
			'id': this.selectedIndex
		}
		this.manageNotificatioService.deleteRule(obj).subscribe(res => {
			this.toastr.success("Deleted Successfully");
			this.selectedIndex = undefined;
			this.getDraftRules();
		});
	}

	/**
	 * To delete the attribute
	 */
	deleteAttribute(obj) {
		var nodeName = obj.node;
		var attribute = obj.attribute;
		var attributeName = nodeName + "." + attribute;
		if (this.draggedAttributes.indexOf(attributeName) > -1) {
			var attrIndex = this.draggedAttributes.indexOf(attributeName);
			this.draggedAttributes.splice(attrIndex, 1);
		}
		var index = this.singleRuleJson['rules'][0].inputs.indexOf(obj);
		this.singleRuleJson['rules'][0].inputs.splice(index, 1);
		this.toastr.success('Attribute Deleted');

	};

	/**
	 * To filter the data in the grid
	 */
	onFilterTextBoxChanged(isActive) {
		if (isActive) {
			this.gridApiActive.setQuickFilter(this.searchText);
		} else {
			this.gridApiDraft.setQuickFilter(this.searchText);
		}

	}

	/**
	 * To change the page size and apply pagination
	 */
	onPageSizeChanged(isActive) {
		if (isActive) {
			this.gridApiActive.paginationSetPageSize(Number(this.pageSize));
		} else {
			this.gridApiDraft.paginationSetPageSize(Number(this.pageSize));
		}

	}

	/**
	 * To submit the data if everything is valid
	 */
	onSubmit(form) {
		if (this.ruleForm.valid) {
			this.save();
		}
	}

	/**
	 * To search the attributes in Nodes
	 */
	showHighlited(event) {
		console.log(event.target.value);
		const searchText = event.target.value;
		$('.attributes-child').removeClass('highlight');
		$('.attributes-child').children().removeClass('highlight');
		$('.attributes-child').each((index, element) => {
			if (searchText !== "" && $(element)[0].innerText.includes(searchText)) {
				$(element).addClass('highlight');
				$(element).children().addClass('highlight');
			}
		});
	}

	/**
	 * To reset the values on changing the tabs
	 */
	tabClick(tab) {
		this.selectedIndex = undefined;
		this.searchText = "";
		this.gridApiActive.deselectAll();
		this.gridApiDraft.deselectAll();
		console.log(tab);
	}
}
