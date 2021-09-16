import { Directive, Input, OnInit, ElementRef, HostListener, EventEmitter, Output, IterableDiffer, IterableDiffers } from '@angular/core';

@Directive({
  selector: 'eplmsdlist'
})
export class EplmsdlistDirective implements OnInit {
  @Input() config: any;
  @Input() userEnteredDetails: any;
  @Output() onOpen: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onCheckAll: EventEmitter<any> = new EventEmitter();
  @Output() onUncheckAll: EventEmitter<any> = new EventEmitter();
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onWarning: EventEmitter<any> = new EventEmitter();
  @Output() onEscape: EventEmitter<any> = new EventEmitter();
  @Output() onScrollEnd: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onClear: EventEmitter<any> = new EventEmitter();

  id: string;
  domRenderObj: any;
  staticLabelDetails: any;
  needSingleSelect: boolean;
  maxSelectDeSelectCount: number;
  needClearButton: boolean;
  needSelectButtons: boolean;
  maxSelectSizeInKB: number;
  openByDefault: boolean;
  allowDeselectionMode: boolean;
  needFilterButton: boolean;
  hideTotalCount: boolean;
  isLanguageTranslationRequired: boolean;
  languageTranslationFunction: (val: any) => any;
  private attrListDiffer: IterableDiffer<any> | null;
  private enteredValueListDiffer: IterableDiffer<any> | null;

  // private variales
  _maxSelectDeSelectCount: number;
  _maxSelectDeselectSizeInKB: number;
  _maxHeight: number;
  _initialRenderLimit: number;
  _renderBeforePosition: number;
  _inputType: string;
  _inputName: string;
  _placeholderLabel: string;
  _textboxPlaceholderLabel: string;
  _ofLabel: string;
  _noMatchesLabel: string;
  _noRecordLabel: string;
  _selectedLabel: string;
  _deSelectedLabel: string;
  _allSelectedLabel: string;
  _clearButtonLabel: string;
  _buttonNameLabel: string;
  _blankDataLabel: string;
  _pleaseWaitLabel: string;
  _selectAllCheckboxLabel: string;
  _selectNoneCheckboxLabel: string;
  _selectAllCheckboxLabel_prefix: string;
  _selectAllCheckboxLabel_suffix: string;
  _restictMaxSize: boolean;
  _needDeselectionMode: any;
  _needSelectAllOption: boolean;
  _isListVisible: boolean;
  _needDefaultOpen: any;
  _allowKeyBoardShortCuts: boolean;
  _isSingleSelect: any;
  _needClearButton: any;
  _needSelectButtons: any;
  _needFilterButton: any;
  _hideTotalCount: any;
  _searchedText: string;
  _searchedText_previous: string;
  _widgetId: any;
  _widget: any;
  _optionList: any[];
  _optionList_id: any[];
  _optionListSize: number;
  _matchedOptionList: any[];
  _selectedOptionList: any[];
  _unSelectedOptionList: any[];
  _optionList_src: any[];
  _isDeselectionMode: boolean;
  _isSelectedAll: boolean;
  _isDisabled: boolean;
  _isLanguageTranslationRequired: boolean;
  _languageTranslationFunction: (val: any) => any;
  _warningSelectionMsg: string;
  _warningDeSelectionMsg: string;
  _warningExceedingMaxSizeMsg: string;
  _containerNode: HTMLDivElement;
  _buttonSectionNode: HTMLButtonElement;
  _selectedValuesNode: HTMLSpanElement;
  _listOuterContainerNode: HTMLDivElement;
  _searchBoxContainerNode: HTMLDivElement;
  _searchBoxNode: HTMLInputElement;
  _listOuterNode: HTMLUListElement;
  _selectAllParentNode: HTMLLIElement;
  _listNode: HTMLLIElement;
  _noMatchesNode: HTMLLIElement;
  _noRecordNode: HTMLLIElement;
  _overLayNode: HTMLDivElement;
  _buttonOuterNode: HTMLUListElement;
  _loadingNode: HTMLDivElement;
  _clearButtonNode: Element;
  _selectAllButtonNode: Element;
  _selectNoneButtonNode: Element;
  _selectAllNode: Element;
  _buttonNode: Element;

  @HostListener('window:keydown', ['$event'])
    onKeyDown(event: any) {    
      if(this._isListVisible && this._allowKeyBoardShortCuts){
        switch (event.which) {
                case 13: // Enter key
                  this.hideList(true);
                    break;
                case 27: // Esc key
                  this.hideList();
                    break;
            }
      }
      if (event.stopPropagation) 
          event.stopPropagation();
      else if (event.preventDefault) 
        event.preventDefault();
      else 
        event.cancelBubble = true;
  }

  constructor( private elRef: ElementRef, private iterable: IterableDiffers ) { 
    this.domRenderObj = elRef.nativeElement;
  }

  ngOnInit() {
    let _this = this;
    this.config = this.config || {};
    this.id = this.config.id;
    this.staticLabelDetails = this.config.staticLabelDetails;
    this.needSingleSelect = this.config.isSingleSelect;
    this.maxSelectDeSelectCount = this.config.maxSelectDeSelectCount;
    this.needClearButton = this.config.needClearButton;
    this.needSelectButtons = this.config.needSelectButtons;
    this.maxSelectSizeInKB = this.config.maxSelectSizeInKB;
    this.openByDefault = this.config.openByDefault;
    this.allowDeselectionMode = this.config.allowDeselectionMode;
    this.needFilterButton = this.config.needFilterButton;
    this.hideTotalCount = this.config.hideTotalCount;
    this.isLanguageTranslationRequired = this.config.isLanguageTranslationRequired;
    this.languageTranslationFunction = this.config.languageTranslationFunction;
    this.userEnteredDetails.hideLoaderFunction = () => {
      _this._hideLoader();
    };
    this.userEnteredDetails.getSelectedValueList = () => {
      return _this.getSelectedValueList();
    };
    this.userEnteredDetails.getSelectedIdList = () => {
      return _this.getSelectedIdList();
    };
    this._maxSelectDeSelectCount = this.maxSelectDeSelectCount || 0;
    this._maxSelectDeselectSizeInKB = this.maxSelectSizeInKB;
    this._maxHeight = 250;
    this._initialRenderLimit = 50;
    this._renderBeforePosition = 100;
    this._inputType = 'checkbox';
    this._inputName = 'selectItem';
    this._placeholderLabel = 'Select';
    this._textboxPlaceholderLabel = 'Enter text for search';
    this._ofLabel = 'of';
    this._noMatchesLabel = 'No matches found';
    this._noRecordLabel = 'No Record for Search';
    this._selectedLabel = 'Selected';
    this._deSelectedLabel = 'De-Selected';
    this._allSelectedLabel = 'All Selected';
    this._clearButtonLabel = 'Clear';
    this._buttonNameLabel = 'Filter';
    this._blankDataLabel = '(Blanks)';
    this._pleaseWaitLabel = 'Please Wait...';
    this._selectAllCheckboxLabel = 'Select All';
    this._selectNoneCheckboxLabel = 'Select None';
    this._selectAllCheckboxLabel_prefix = '[ ';
    this._selectAllCheckboxLabel_suffix = ' ]';
    this._restictMaxSize = false;
    this._needDeselectionMode = this.allowDeselectionMode || false;
    if (this.maxSelectSizeInKB)
      this._restictMaxSize = true;
    this._needSelectAllOption = true,
      this._isListVisible = false;
    this._needDefaultOpen = this.openByDefault || false;
    this._allowKeyBoardShortCuts = true;
    this._isSingleSelect = this.needSingleSelect || false;
    this._needClearButton = this.needClearButton || false;
    this._needSelectButtons = this.needSelectButtons || false;
    this._needFilterButton = this.needFilterButton || false;
    this._hideTotalCount = this.hideTotalCount || false;
    this._searchedText = '';
    this._searchedText_previous = '';
    this._widgetId = this.id;
    this._widget = this.domRenderObj || document.getElementById(this.id);
    this._optionList = [];
    this._optionList_id = [];
    this._optionListSize = 0;
    this._matchedOptionList = [];
    this._selectedOptionList = [];
    this._unSelectedOptionList = [];

    this._optionList_src = [];

    this._isDeselectionMode = false;
    this._isSelectedAll = false;
    this._isDisabled = false;

    this._isLanguageTranslationRequired = false;
    this._languageTranslationFunction = (val) => {return val;};
    if(this.isLanguageTranslationRequired && typeof(this.languageTranslationFunction) == "function"){
      this._isLanguageTranslationRequired = true;
      this._languageTranslationFunction = this.languageTranslationFunction;
    }
    
    this._warningSelectionMsg = "Maximum selection allowed is " + this._maxSelectDeSelectCount;
    this._warningDeSelectionMsg = "Maximum de-selection allowed is " + this._maxSelectDeSelectCount;
    this._warningExceedingMaxSizeMsg = "You are Exceeding maximum search criteria";
    this.staticLabelDetails = this.staticLabelDetails || {};
    if(this.staticLabelDetails["maxSelection_allow"]){
      this._warningSelectionMsg = this.staticLabelDetails["maxSelection_allow"] + " " + this._maxSelectDeSelectCount;
      delete this.staticLabelDetails["maxSelection_allow"];
    }
    if(this.staticLabelDetails["maxDeSelection_allow"]){
      this._warningDeSelectionMsg = this.staticLabelDetails["maxDeSelection_allow"] + " " + this._maxSelectDeSelectCount;
      delete this.staticLabelDetails["maxDeSelection_allow"];
    }
    if(this.staticLabelDetails["exceedingMaxSearchCriteria"]){
      this._warningExceedingMaxSizeMsg = this.staticLabelDetails["exceedingMaxSearchCriteria"];
      delete this.staticLabelDetails["exceedingMaxSearchCriteria"];
    }
    this.updateStaticText(this.staticLabelDetails);
    
    if(this._isSingleSelect){
      this._inputType = "radio";
      this._inputName = this._widgetId + "_" + this._inputName;
      this._needDefaultOpen = false;
      this._needSelectAllOption = false;
    }
    
    // ====================================================================//
    // ========================= CONSTRUCTOR
    // ====================================================================//
  
    this._containerNode = document.createElement("div");
    this._buttonSectionNode = document.createElement("button");
    this._selectedValuesNode = document.createElement("span");
    this._listOuterContainerNode = document.createElement("div");
    this._searchBoxContainerNode = document.createElement("div");
    this._searchBoxNode = document.createElement("input");
    this._listOuterNode = document.createElement("ul");
    this._selectAllParentNode = document.createElement("li");
    this._listNode = document.createElement("li");
    this._noMatchesNode = document.createElement("li");
    this._noRecordNode = document.createElement("li");
    this._buttonOuterNode = document.createElement("ul");
    this._overLayNode = document.createElement("div");
    this._loadingNode = document.createElement("div");
    
  
    // ====================================================================//
    // ORGANIZE DOM NODES INTO MEANINGFUL STRUCTURE
    // ====================================================================//
  
    this._containerNode.appendChild(this._buttonSectionNode);
    this._buttonSectionNode.appendChild(this._selectedValuesNode);
    this._containerNode.appendChild(this._listOuterContainerNode);
    this._listOuterContainerNode.appendChild(this._searchBoxContainerNode);
    this._searchBoxContainerNode.appendChild(this._searchBoxNode);
    this._listOuterContainerNode.appendChild(this._listOuterNode);
    if(!this._isSingleSelect && this._needFilterButton)
      this._listOuterContainerNode.appendChild(this._buttonOuterNode);
    /*this._listOuterContainerNode.appendChild(this._overLayNode);*/
    if(!this._needClearButton){
    this._containerNode.appendChild(this._overLayNode);
    }
    this._listOuterContainerNode.appendChild(this._loadingNode);
    
    // ====================================================================//
    // ASSIGN CSS CLASSES TO EACH NODE
    // ====================================================================//
  
    this._containerNode.className = "ms-parent " + (this._isSingleSelect ? "textSingleSelect" : "textMultiSelect");
    this._buttonSectionNode.className = "ms-choice";
    this._selectedValuesNode.className = "placeholder";
    this._listOuterContainerNode.className = "ms-drop bottom";
    this._searchBoxContainerNode.className = "ms-search";
    this._selectAllParentNode.className = "multiple";
    this._listNode.className = "multiple";
    this._noMatchesNode.className = "ms-no-results";
    this._overLayNode.className = "overLay";
    this._loadingNode.className = "loading";
    
    // ====================================================================//
    // SET INITIAL VALUES OF NODES
    // ====================================================================//
  
  //	this._containerNode.style.width = this._width + "px";
    this._buttonSectionNode.type = "button";
    this._selectedValuesNode.innerHTML = this._placeholderLabel;
    this._searchBoxNode.setAttribute("placeholder", this._textboxPlaceholderLabel);
    this._searchBoxNode.type = "text";
    this._searchBoxNode.autocomplete = "off";
    this._searchBoxNode['autocorrect'] = "off";
    this._searchBoxNode['autocapitilize'] = "off";
    this._searchBoxNode.spellcheck = false;
    this._listOuterNode.style.maxHeight = this._maxHeight + "px";
    this._listOuterNode.style.overflowX = "hidden";
  //	this._selectAllParentNode.style.width = this._width + "px";
    if(this._needSelectButtons){
      this._selectAllParentNode.innerHTML = "<div class='col-md-12' style='padding: 0;'><button class='btn-xs btn-default col-md-6 selAllBtn' style='padding: 5px 0px 5px 0px;float: left;width: 49%;'>" + this._selectAllCheckboxLabel + "</button><button class='btn-xs btn-default col-md-6 selAllNoneBtn' style='padding: 5px 0px 5px 0px;float: right;width: 49%;'>" + this._selectNoneCheckboxLabel + "</button></div>";
    }else{
      this._selectAllParentNode.innerHTML = "<label class='option-label'><input type='checkbox' name='selectItem' value=''><label class='ms-option-label'>" + this._selectAllCheckboxLabel_prefix +  this._selectAllCheckboxLabel + this._selectAllCheckboxLabel_suffix +"</label></label>";
    }
  //	this._listNode.style.width = this._width + "px";
    this._noMatchesNode.style.display = "list-item"; 
    this._noMatchesNode.innerHTML = this._noMatchesLabel;
  //	this._noRecordNode.style.display = "list-item"; 
    this._noRecordNode.innerHTML = this._noRecordLabel;
    //this._buttonOuterNode.style.marginTop = "10px";
         //this._buttonOuterNode.style.marginTop = (this._maxHeight) - (this._listOuterNode.style.height) + 10 +"px";
    this._buttonOuterNode.style.marginBottom = "10px";
    if(this._needClearButton){
      this._buttonOuterNode.innerHTML = "<li><button class='btn-xs btn-default ep-lmsd-filter' style='position:relative;right: 10px;float: right;border-radius:4px;'>" + this._buttonNameLabel + "</button><button class='btn-xs btn-default' style='position:relative;right: 25px;float: right;border-radius:4px;'>" + this._clearButtonLabel + "</button></li>";
      this._clearButtonNode = this._buttonOuterNode.firstElementChild.lastElementChild;
    }else{
      this._buttonOuterNode.innerHTML = "<li><button class='btn btn-default ep_lmsd_filter_btn' style='position:relative;right: 10px;float: right;border-radius:4px;' > " + this._buttonNameLabel + "</button></li>";
    }
    this._loadingNode.innerHTML = "<div class='loading-overlay'></div><i class='loading-img fa fa-spinner fa-pulse'><i>";
  
    if(this._needSelectButtons){
      this._selectAllButtonNode = this._selectAllParentNode.firstElementChild.firstElementChild;
      this._selectNoneButtonNode = this._selectAllParentNode.firstElementChild.lastElementChild;
    }else{
      this._selectAllNode = this._selectAllParentNode.firstElementChild.firstElementChild;
    }
    this._buttonNode = this._buttonOuterNode.firstElementChild.firstElementChild;
    
    // ====================================================================//
    // ATTACH EVENT HANDLERS
    // ====================================================================//
    
    if(this._needSelectButtons){
      this._selectAllParentNode.firstElementChild['onclick'] = (e: Event) => {
        e.target['parentNode'].click();
      };
    }else{
      this._selectAllParentNode.firstElementChild.lastElementChild['onclick'] = (e: Event) => {
        e.target['parentNode'].click();
      };
    }
  
    this._buttonSectionNode.onclick = () => {
      if(!this._isDisabled) this._toggleList();
    };
    
    if(!this._needSelectButtons){
      this._selectAllNode['onclick'] = (e: Event) => {
        this._updateCheckBox(e, true);
      };
    }
    
    if(this._needSelectButtons){
      this._selectAllButtonNode['onclick'] = (e: Event) => {
        this._updateOtherCheckBox(e, true);
      };
    }
    
    if(this._needSelectButtons){
      this._selectNoneButtonNode['onclick'] = (e: Event) => {
        this._updateOtherCheckBox(e, false);
      };
    }
    
    this._searchBoxNode.onkeydown = (e: any) => {
      this._searchedText_previous = e.target.value.trim();
    };
    
    this._searchBoxNode.onkeyup = (e: any) => {
      var current_search_text = e.target.value.trim();
      if(current_search_text == "" || this._searchedText_previous != current_search_text){
        this._search(current_search_text.toLowerCase());
        if(this.onSearch) this.onSearch.emit(this._searchBoxNode.value.trim());
      }
    };
    
    this._overLayNode.onclick = (e: any) => {
      e.stopPropagation();
      this.hideList();
      var obj = document.elementFromPoint(e.clientX, e.clientY);
      if(obj && !obj.matches("strong")){
        let params: any = {
          "bubbles" : e.bubbles,
          "cancelable" : e.cancelable,
          "which": e.which,
          "clientX": e.clientX,
          "clientY": e.clientY
        };
        obj.dispatchEvent(new MouseEvent('click', params));
      }
    };
    
    this._listOuterNode.onscroll = (e: Event) => {
       this._appendOption(e);
    };
    
    this._buttonNode['onclick'] = (e: Event) => {
      this.hideList(true);
    };
    
    if(this._clearButtonNode){
      this._clearButtonNode['onclick'] = (e: Event) => {
        this.clearAllSelectedData();
      };
    }
  
    this.init();
    this.load(this.getWidgetLoadDetailsObj());
    this.attrListDiffer = this.iterable.find(this.userEnteredDetails.attrList).create();
    this.enteredValueListDiffer = this.iterable.find(this.userEnteredDetails.enteredValue).create();
  }

  ngDoCheck() {
    const attrListChanges = this.attrListDiffer.diff(this.userEnteredDetails.attrList);
    const enteredValueListChanges = this.enteredValueListDiffer.diff(this.userEnteredDetails.enteredValue);
    // if(!this.needSingleSelect && !this.userEnteredDetails.enteredValue && this.userEnteredDetails.isSelectedAll){
    //   this.userEnteredDetails.isSelectedAll = false;
    // }
    // this._isSelectedAll = this.userEnteredDetails.isSelectedAll;
    if (attrListChanges || (enteredValueListChanges && JSON.stringify(this.getSelectedIdList()) != JSON.stringify(this.userEnteredDetails.enteredValue))) {
      this.load(this.getWidgetLoadDetailsObj());
    }
  }

  init() {
    this._renderLayout();
  }

  getWidgetLoadDetailsObj(){
    this.userEnteredDetails.attrList = this.userEnteredDetails.attrList || [];
    this.userEnteredDetails.enteredValue = this.userEnteredDetails.enteredValue || [];
    return { optionList: this.userEnteredDetails.attrList, optionList_id: this.userEnteredDetails.attrIdList || this.userEnteredDetails.attrList, selectedOptionList: this.userEnteredDetails.enteredValue };
    //return { optionList: this.userEnteredDetails.attrList, optionList_id: this.userEnteredDetails.attrList, selectedOptionList: this.userEnteredDetails.isSelectedAll ? this.userEnteredDetails.attrList : this.userEnteredDetails.enteredValue };
  }

  load(obj: any) {
    this._optionList = [].concat(obj.optionList || []);
    this._optionList_id = [].concat(obj.optionList_id || []);
    this._optionListSize = this._optionList.length;
    this._matchedOptionList = [].concat(obj.optionList || []);
    if(typeof obj.showSelectAll == "boolean")
      this._needSelectAllOption = obj.showSelectAll;
    if(typeof obj.needKeyboardShotcuts == "boolean")
      this._allowKeyBoardShortCuts = obj.needKeyboardShotcuts;
    this._updateSelectAndUnSelectList(obj);
    this._searchedText = this._searchBoxNode.value = "";

    var translate = (key: string, srcKey?: string) => {
      var ref: any = this[key];
      this[key] = [];
      ref.forEach((val: any) => {
        this[key].push(this._languageTranslationFunction(val));
      });
      if (srcKey) {
        this[srcKey] = ref;
      }
    }
    if (this._isLanguageTranslationRequired) {
      translate("_optionList", "_optionList_src");
      translate("_selectedOptionList");
      translate("_unSelectedOptionList");
    }

    this._clearOptions();
    this._renderOptions();
    this._hideLoader();
    if(this._needDefaultOpen)
      this.showList();
  }

  _updateSelectAndUnSelectList(obj: any) {
    this._maxSelectDeselectSizeInKB = obj.maxSelectDeselectSizeInKB || this._maxSelectDeselectSizeInKB || 0;
    var selectedOptionList = [].concat(obj.selectedOptionList || []);
    var unSelectedOptionList = [].concat(obj.unSelectedOptionList || []);
    var selectedOptionList_length = selectedOptionList.length;
    var unSelectedOptionList_length = unSelectedOptionList.length;
    this._isSelectedAll = false;
    this._isDeselectionMode = false;
    if(selectedOptionList_length != 0){
      if(obj.validateMatchedList){
        selectedOptionList = selectedOptionList.filter((opt: any) => {
          if(this._optionList.indexOf(opt) != -1)
            return true;
        });			
      }
      this._selectedOptionList = selectedOptionList;
      if(selectedOptionList_length == this._optionListSize){
        this._isSelectedAll = true;
        if(this._needDeselectionMode)
          this._isDeselectionMode = true;
      }else{
        this._unSelectedOptionList = this._optionList.filter((opt: any) => {
          if(selectedOptionList.indexOf(opt) == -1)
            return true;
        });
      }
      this._maxSelectDeselectSizeInKB += this._getSizeInKB(selectedOptionList.join(","));
    }else if(unSelectedOptionList_length != 0){
      if(obj.validateMatchedList){
        unSelectedOptionList = unSelectedOptionList.filter((opt: any) => {
          if(this._optionList.indexOf(opt) != -1)
            return true;
        });
      }
      this._unSelectedOptionList = unSelectedOptionList;
      if(unSelectedOptionList_length != this._optionListSize){
        if(this._needDeselectionMode)
          this._isDeselectionMode = true;
        this._selectedOptionList = this._optionList.filter((opt: any) => {
          if(unSelectedOptionList.indexOf(opt) == -1)
            return true;
        });
      }
      this._maxSelectDeselectSizeInKB += this._getSizeInKB(unSelectedOptionList.join(","));
    }else{
      this._unSelectedOptionList = [].concat(this._optionList);
      this._selectedOptionList = [];
    }
      
  };

  _renderLayout () {
    var _widget: any = this.getWidget();
    this.setWidget(_widget);
    this._removeAllChildNode(_widget);
    _widget.appendChild(this._containerNode);
  }

  getWidget() {
    return this._widget;
  }

  setWidget(widget: any) {
    this._widget = widget;
  }

  updateStaticText(staticLabelDetails: object) {
    if(staticLabelDetails){
      Object.keys(staticLabelDetails).forEach((key: any) => {
        var newKey = "_" + key + "Label";
        if(this[newKey])
          this[newKey] = staticLabelDetails[key];
      });
    }
  }

  hideList(needTrigger?: boolean) {
    this._listOuterContainerNode.classList.remove("open");
    this._isListVisible = false;
    var decodeTranslation = (val: any) => {
      if(val instanceof Array){
        var valList = [];
        val.forEach((_val: any) => {
          valList.push(this._optionList_src[this._optionList.indexOf(_val)]);
        });
        return valList;
      }else if(val != ""){
        return this._optionList_src[this._optionList.indexOf(val)];
      }else{
        return val;
      }
    }
    var methodName = needTrigger ? "onClose" : "onEscape";
    if(this._isSingleSelect){
      var selectedValue = this._selectedOptionList[0] || "";
      if(this._isLanguageTranslationRequired){
        selectedValue = decodeTranslation(selectedValue);
      }
      this.userEnteredDetails.enteredValue = this.getSelectedIdList();
      if(this[methodName]) this[methodName].emit((selectedValue));
    }else{
      var totalDetails = {
        isDeselectionMode: this._isDeselectionMode,
        selectedList: [].concat(this._selectedOptionList),
        unSelectedList: [].concat(this._unSelectedOptionList),
        isSelectedAll: this._isSelectedAll,
        isDeselectedMode: this._isDeselectionMode
      };
      if(this._isLanguageTranslationRequired){
        totalDetails.selectedList = selectedValue = decodeTranslation(totalDetails.selectedList);
        totalDetails.unSelectedList = selectedValue = decodeTranslation(totalDetails.unSelectedList);
      }
      //this.userEnteredDetails.isSelectedAll = this.isSelectedAll();
      this.userEnteredDetails.enteredValue = this.getSelectedIdList();
      if(this[methodName]) this[methodName].emit(totalDetails.selectedList, totalDetails);			
    }
  }

  _toggleList() {
    if(this._isListVisible)
      this.hideList();
    else
      this.showList(true);
  }

  showList(requiredClearSearch?: boolean) {
    if(requiredClearSearch){
      this._searchBoxNode.value = "";
      this._search("");		
    }
    if(!this.userEnteredDetails.isAttrLoaded) this._showLoader();
    this._listOuterContainerNode.classList.add("open");
    this._isListVisible = true;
    if(this.userEnteredDetails.customize && this.userEnteredDetails.isAttrLoaded){
      this.userEnteredDetails.prevCustomizeTabValues = {attrList : this.userEnteredDetails.attrList, attrIdList : this.userEnteredDetails.attrIdList, selectedOptionList : this.getSelectedValueList()};
    }
    if(this.onOpen) this.onOpen.emit(this.userEnteredDetails);
  }

  _search(searchedText: string) {
    this._searchedText = searchedText;
    this._updateMatchedOptionList();
    this._clearOptions();
    this._renderOptions();
  }

  _updateMatchedOptionList() {
    var searchedText = this._searchedText;
    if(searchedText == ''){
      this._matchedOptionList = this._optionList.concat([]);
    }else{
      this._matchedOptionList = this._optionList.filter((opt: any) => {
        var _opt: string = (opt + '');
        _opt = _opt.replace(/<br>/g, "\n");
        _opt = _opt.replace(/&quot;/g, "\"");
        if(_opt.toLowerCase().indexOf(searchedText) != -1)
          return true;
      });
    }
  }

  _clearOptions() {
    this._removeAllChildNode(this._listOuterNode);
    this._selectedValuesNode.innerHTML = this._placeholderLabel;
    this._selectedValuesNode.classList.add("placeholder");
  }

  _removeAllChildNode(obj: any, needRemoveExceptFirstChild?: boolean) {
    if(typeof obj == "string")
      obj = document.getElementById(obj);
    while(obj.hasChildNodes() && !(needRemoveExceptFirstChild == true && obj.childElementCount == 1))
      obj.removeChild(obj.lastChild);
  }

  _renderOptions() {
    var _this = this;
    if(this._matchedOptionList.length > 0){
      try{
        var lastIndex = 0;
        var matchedOptionList = this._matchedOptionList;
        if(this._listOuterNode.hasChildNodes()){
          lastIndex = this._listOuterNode.lastElementChild.firstElementChild.firstElementChild['value'];
          lastIndex = Number(lastIndex) + 1;
          matchedOptionList = this._matchedOptionList.slice(lastIndex);
        }else if(this._needSelectAllOption){
          this._updateSelectAllStatus();
          this._listOuterNode.appendChild(this._selectAllParentNode);
        }
        matchedOptionList.forEach((opt: any, index: number) => {
          var currentIndex = lastIndex + index;
          var listNode: any = _this._listNode.cloneNode(true);
          var opt_tooltip = opt + ""; 
          opt_tooltip = opt_tooltip.replace(new RegExp("<br>", "g"), "\n");
          opt_tooltip = opt_tooltip.replace(new RegExp("&quot;", "g"), "\"");
          opt_tooltip = opt_tooltip.replace(new RegExp("<", "g"), "&lt");
          opt_tooltip = opt_tooltip.replace(new RegExp(">", "g"), "&gt");
          var opt_view = opt_tooltip;
          var newLine_position = opt_view.indexOf("\n");
          if(newLine_position != -1)
            opt_view = opt_view.substr(0, newLine_position) + "...";
          if(currentIndex == 0 && opt_view == "")
            listNode['innerHTML'] = "<label class='option-label'><input type='" + _this._inputType + "' name='" + _this._inputName + "' value='" + currentIndex + "'><label class='ms-option-label'>" + _this._blankDataLabel + "</label></label>";
          else
            listNode['innerHTML'] = "<label class='option-label'><input type='" + _this._inputType + "' name='" + _this._inputName + "' value='" + currentIndex + "'><label class='ms-option-label' title='" + opt_tooltip + "'>" + opt_view + "</label></label>";
          listNode.firstElementChild.lastElementChild.onclick = (e: any) => {
            e.target.parentNode.click();
          };
          _this._listOuterNode.appendChild(listNode);
          var checkBoxObj = listNode.firstElementChild.firstElementChild;
          checkBoxObj.checked = _this._selectedOptionList.indexOf(opt) != -1 ? true : false;
          checkBoxObj.onclick = (e: Event) => {
            this._updateCheckBox(e, false);
          };
          if(index >= _this._initialRenderLimit)
            throw new Error('breakException');
        });
        this._listOuterNode.removeAttribute("need-lazyloading");
      }catch(e){
        this._listOuterNode.setAttribute("need-lazyloading", "true");
      }
    }else if(this._optionListSize > 0){
      this._listOuterNode.appendChild(this._noMatchesNode);
    }else {
      this._listOuterNode.appendChild(this._noRecordNode);
    }
    this._updateSelectedDetails();
  }

  _updateSelectAllStatus(target?: any) {
    if(target && !target.checked){
      if(this._selectAllNode){
        this._selectAllNode['checked'] = false;
      }else{
        this._selectAllButtonNode['checked'] = false;
      }
    }else{
      var searchedText = this._searchedText;
      if(searchedText == "")
        if(this._selectAllNode){
          this._selectAllNode['checked'] = (this._selectedOptionList.length == this._optionListSize);
        }else{
          this._selectAllButtonNode['checked'] = (this._selectedOptionList.length == this._optionListSize);
        }
      else{
        var matchedSelectedList = this._selectedOptionList.filter((opt: any) => {
          var _opt = (opt + "");
          _opt = _opt.replace(/<br>/g, "\n");
          _opt = _opt.replace(/&quot;/g, "\"");
          if(_opt.toLowerCase().indexOf(searchedText) != -1)
            return true;
        });
        if(this._selectAllNode){
          this._selectAllNode['checked'] = (this._matchedOptionList.length == matchedSelectedList.length);
        }else{
          this._selectAllButtonNode['checked'] = (this._matchedOptionList.length == matchedSelectedList.length);
        }
      }
    }
  }

  _updateCheckBox(e: any, isSelectAllCb: boolean) {
    var target: any = e.target;
    var statusObj: any = {};
    if(isSelectAllCb)
      statusObj = this._updateChildCheckbox(target);
    else
      statusObj = this._updateParentCheckbox(target);
    this._hideLoader();
    if(this._isSingleSelect){
      if(this.onChange) this.onChange.emit(this._selectedOptionList[0]);
      this.hideList();
    }else if(statusObj.statusCode != 200){
      target.checked = !target.checked;
      this.showWarningMessage(statusObj.statusCode);
    }else{
      if(this.onChange) this.onChange.emit(this._selectedOptionList);
    }
    if (e.stopPropagation) 
        e.stopPropagation();
    else if (e.preventDefault) 
      e.preventDefault();
    else 
        e.cancelBubble = true;
  }

  showWarningMessage(statusCode: number) {
    if(this.onWarning){
      if(statusCode == 101)
        this.onWarning.emit({ErrorCode: statusCode, Message: this._warningSelectionMsg});
      else if(statusCode == 102)
        this.onWarning.emit({ErrorCode: statusCode, Message: this._warningDeSelectionMsg});
      else if(statusCode == 151)
        this.onWarning.emit({ErrorCode: statusCode, Message: this._warningExceedingMaxSizeMsg});
    }
  }

  _showLoader() {
    this._loadingNode.classList.add("show");
  }
  
  _hideLoader() {
    this._loadingNode.classList.remove("show");
  }

  _updateParentCheckbox(target: any) {
    var value: any = this._matchedOptionList[target.value];
    if(this._isSingleSelect){
      this._selectedOptionList = [value];
    }else{
      if(target.checked){
        if(this._maxSelectDeSelectCount != 0 && !this._isDeselectionMode){
          if(this._selectedOptionList.length + 1 > this._maxSelectDeSelectCount)
            return {statusCode: 101};
          else if(this._isExceedingMaxLimit(this._selectedOptionList, value))
            return {statusCode: 151};
        }
        this._selectedOptionList.push(value);
        var index = this._unSelectedOptionList.indexOf(value);
        if(index != -1)
          this._unSelectedOptionList.splice(index, 1);
        if(this._unSelectedOptionList.length == 0){
          this._isSelectedAll = true;
          if(this._needDeselectionMode)
            this._isDeselectionMode = true;
        }
      }else{
        if(this._maxSelectDeSelectCount != 0 && this._isDeselectionMode){
          if(this._unSelectedOptionList.length + 1 > this._maxSelectDeSelectCount)
            return {statusCode: 102};
          else if(this._isExceedingMaxLimit(this._unSelectedOptionList, value))
            return {statusCode: 151};
        }
        this._isSelectedAll = false;
        this._unSelectedOptionList.push(value);
        var index = this._selectedOptionList.indexOf(value);
        if(index != -1)
          this._selectedOptionList.splice(index, 1);
        if(this._selectedOptionList.length == 0)
          this._isDeselectionMode = false;
      }
      this._updateSelectAllStatus(target);
    }
    this._updateSelectedDetails();
    return {statusCode: 200};
  }

  _updateChildCheckbox(target: any) {
    var searchedText = this._searchedText;
    if(searchedText == ""){
      [].forEach.call(this._listOuterNode.querySelectorAll("input[type=checkbox]"), (cbObj: any) => {
        cbObj.checked = target.checked;
      });
      if(target.checked){
        this._isSelectedAll = true;
        if(this._needDeselectionMode)
          this._isDeselectionMode = true;
        this._selectedOptionList = this._matchedOptionList.concat([]);
        this._unSelectedOptionList = [];
      }else{
        this._isSelectedAll = false;
        this._isDeselectionMode = false;
        this._selectedOptionList = [];
        this._unSelectedOptionList = this._matchedOptionList.concat([]);
      }
      this._updateSelectedDetails();
    }else{
      var selectedOptionList = this._selectedOptionList.filter((opt: any) => {
        var _opt: string = (opt + "");
        _opt = _opt.replace(/<br>/g, "\n");
        _opt = _opt.replace(/&quot;/g, "\"");
        if(_opt.toLowerCase().indexOf(searchedText) == -1)
          return true;
      });
      var unSelectedOptionList = this._unSelectedOptionList.filter((opt: any) => {
        var _opt: string = (opt + "");
        _opt = _opt.replace(/<br>/g, "\n");
        _opt = _opt.replace(/&quot;/g, "\"");
        if(_opt.toLowerCase().indexOf(searchedText) == -1)
          return true;
      });
      var _isSelectedAll: boolean = this._isSelectedAll;
      var _isDeselectionMode: boolean = this._isDeselectionMode;
      if(target.checked){
        selectedOptionList = selectedOptionList.concat(this._matchedOptionList);
        if(unSelectedOptionList.length == 0){
          _isSelectedAll = true;
          _isDeselectionMode = true;
        }
      }else{
        unSelectedOptionList = unSelectedOptionList.concat(this._matchedOptionList);
        _isSelectedAll = false;
        if(selectedOptionList.length == 0)
          _isDeselectionMode = false;
      }
      if(this._maxSelectDeSelectCount != 0){
        if(this._isDeselectionMode){
          if(unSelectedOptionList.length > this._maxSelectDeSelectCount)
            return {statusCode: 102};
          else if(this._isExceedingMaxLimit(unSelectedOptionList))
            return {statusCode: 151};
        }else{
          if(selectedOptionList.length > this._maxSelectDeSelectCount)
            return {statusCode: 101};
          else if(this._isExceedingMaxLimit(selectedOptionList))
            return {statusCode: 151};
        }
      }
      this._selectedOptionList = selectedOptionList;
      this._unSelectedOptionList = unSelectedOptionList;
      this._isSelectedAll = _isSelectedAll;
      this._isDeselectionMode = _isDeselectionMode;
      [].forEach.call(this._listOuterNode.querySelectorAll("input[type=checkbox]"), (cbObj: any) => {
        cbObj.checked = target.checked;
      });
      this._updateSelectedDetails();
    }
    return {statusCode: 200};
  }

  _updateSelectedDetails() {
    var selectedOptionSize: number = this._selectedOptionList.length;
    var unSelectedOptionSize: number = this._unSelectedOptionList.length;
    if(selectedOptionSize == 0){
      this._selectedValuesNode.classList.add("placeholder");
      this._selectedValuesNode.innerHTML = this._placeholderLabel;
    }else{
      this._selectedValuesNode.classList.remove("placeholder");
      if(this._isSingleSelect)
        this._selectedValuesNode.innerHTML = this._selectedOptionList[0];
      else if(selectedOptionSize == this._optionListSize)
        this._selectedValuesNode.innerHTML = this._allSelectedLabel;
      else if(this._isDeselectionMode)
        this._selectedValuesNode.innerHTML = unSelectedOptionSize + " " + (this._hideTotalCount ? "" : (this._ofLabel + " " + this._optionListSize + " ")) + this._deSelectedLabel;
      else
        this._selectedValuesNode.innerHTML = selectedOptionSize + " " + (this._hideTotalCount ? "" : (this._ofLabel + " " + this._optionListSize + " ")) + this._selectedLabel;
    }
  }

  _isExceedingMaxLimit(list: any[], additionalText?: string) {
    if(this._restictMaxSize && (this._maxSelectDeselectSizeInKB < this._getSizeInKB(list.join(",") + (additionalText || ""))))
      return true;
    return false;
  }

  _getSizeInKB(text: string) {
    return parseFloat((this._getSizeInBytes(text) / 1024).toFixed(2));
  }

  _getSizeInBytes(text: string) {
    return encodeURI(text).split(/%..|./).length - 1;
  }

  _updateOtherCheckBox(e: Event, isSelected: boolean) {
    var target: any = e.target;
    var statusObj: any = {};
    if(isSelected){
      target.checked = true;
      statusObj = this._updateBtnCheckbox(target);
    }else{
      target.checked = false;
      statusObj = this._updateBtnCheckbox(target);
    }
    this._hideLoader();
    if(this._isSingleSelect){
      if(this.onChange) this.onChange.emit(this._selectedOptionList[0]);
      this.hideList();
    }else if(statusObj.statusCode != 200){
      target.checked = !target.checked;
      this.showWarningMessage(statusObj.statusCode);
    }else{
      if(this.onChange) this.onChange.emit(this._selectedOptionList);
    }
    if (e.stopPropagation) 
        e.stopPropagation();
    else if (e.preventDefault) 
      e.preventDefault();
    else 
      e.cancelBubble = true;
  }

  _updateBtnCheckbox(target: any) {
    [].forEach.call(this._listOuterNode.querySelectorAll("input[type=checkbox]"), (cbObj: any) => {
      cbObj.checked = target.checked;
    });
    if(target.checked){
      this._isSelectedAll = true;
      if(this._needDeselectionMode)
      this._isDeselectionMode = true;
      this._selectedOptionList = this._matchedOptionList.concat([]);
      this._unSelectedOptionList = [];
    }else{
      this._isSelectedAll = false;
      this._isDeselectionMode = false;
      this._selectedOptionList = [];
      this._unSelectedOptionList = this._matchedOptionList.concat([]);
    }
    this._updateSelectedDetails();
    return {statusCode: 200};
  }

  _appendOption(e: any) {
    var target = e.target;
    if((target.offsetHeight + target.scrollTop + this._renderBeforePosition) >= target.scrollHeight){
      if(target.matches("[need-lazyloading]"))
        this._renderOptions();
      else
        if(this.onScrollEnd) this.onScrollEnd.emit();
    }
  }
  
  clearAllSelectedData(needToShowLoader?: boolean) {
    this._searchedText = "";
    [].forEach.call(this._listOuterNode.querySelectorAll("input[type=checkbox]"), (cbObj: any) => {
      cbObj.checked = false;
    });
    this._isSelectedAll = false;
    this._isDeselectionMode = false;
    this._selectedOptionList = [];
    this._unSelectedOptionList = this._matchedOptionList.concat([]);
    this._updateSelectedDetails();
    if(this.onClear) this.onClear.emit();
  }

  getSelectedIdList() {
    var selectedIdList: any[] = [];
    this._selectedOptionList.forEach((value: any) => {
      selectedIdList.push(this._optionList_id[this._optionList.indexOf(value)]);
    });
    return selectedIdList;
  }

  getSelectedId() {
    var value = this.getSelectedValue();
    var index = this._optionList.indexOf(value);
    if(index != -1){
      return this._optionList_id[index] || "";
    }else
      return "";
  }

  getSelectedValue() {
    if(this._selectedOptionList.length > 0)
      return this._selectedOptionList[0];
    else
      return "";
  }

  getSelectedValueList() {
    return this._selectedOptionList.concat([]);
  }
  
  setSelectedValue(value: any) {
    this._selectedOptionList = [value];
  }

  ignoreDeselectionMode() {
    this._needDeselectionMode = false;
  }

  isOpen(value: any) {
    return this._isListVisible;
  }
  
  close(needTrigger: boolean) {
    if(this._isListVisible)
      this.hideList(needTrigger);
  }
  
  setDisabled(disabled: boolean) {
    this._isDisabled = disabled || false;
    if(this._isDisabled){
      this._buttonSectionNode.style.cursor = "not-allowed";
      if(this._isListVisible){
        this._listOuterContainerNode.classList.remove("open");
        this._isListVisible = false;
      }
    }else{
      this._buttonSectionNode.style.removeProperty("cursor");
    }
  }
  
  isDisabled() {
    return this._isDisabled;
  }

  isSelectedAll() {
    return this._isSelectedAll;
  }

}
