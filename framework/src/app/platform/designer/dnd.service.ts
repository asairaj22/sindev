import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { PropertyService } from './property.service';

declare var $: any;
@Injectable( {
    providedIn: 'root'
} )
export class DndService {
    CONTAINER_ELEMENTS = ['HTML', 'BODY', 'DIV', 'TH', 'TD', 'LI'];
    constructor( private utilityService: UtilityService, private propertyService: PropertyService ) {
        this.initBindEvent();
    }

    initBindEvent() {
        this.bindEvent( window, 'message', ( e ) => {
            const data = e.data;
            if ( data && data.type === 'eportal' ) {
                const messageBody = data.message;
                switch ( data.subtype ) {

                    case 'dnd':
                        this.handleDndOperation( messageBody );
                        break;
                        
                    case 'show-popup':
                        this.showPopup(data.popupId);
                        break;

                    case 'add-tab':
                        this.addNewTab(messageBody);
                        break;
                    
                    case 'tab-position':
                        this.changeTabPosition(messageBody);
                        break;

                    case 'css-update':
                        this.propertyService.updateDomWithNewProperties( messageBody );
                        break;

                    case 'dom-outline-update':
                        this.propertyService.drawOutlineContainer();
                        break;

                    case 'toggleGrid':
                        this.handleToggleGrid( messageBody );
                        break;

                    case 'confirm-ui-studio':
                        this.propertyService.init();
                        break;

                    case 'column-layout-update':
                        this.propertyService.updateColumnLayout( messageBody );
                        break;

                    case 'class-list-update':
                        this.propertyService.updateClassList( messageBody );
                        break;

                    case 'bind-api':
                        this.getRequestResponseContainer( messageBody );
                        break;

                    case 'view-all-mapping':
                        this.propertyService.viewMappedBindings( messageBody );
                        break;

                    case 'do-un-map':
                        this.propertyService.unMap( messageBody );
                        break;

                    case 'remove-mapping':
                        this.propertyService.removeMapping( messageBody );
                        break;

                    case 'update-scope-name':
                        this.propertyService.updateScopeName( messageBody );
                        break;

                    case 'manual-binding':
                        this.getElementDetailsForManualBinding( messageBody );
                        break;

                    case 'view-event-element':
						this.propertyService.viewCurrentEventElement( messageBody );
                        break;
                    
                    case 'add-event-map':
                        this.propertyService.addEventMap( messageBody);
                        break;

                    case 'remove-event-map':
                        this.propertyService.removeEventMap( messageBody );
					    break; 
					    
                    case 'xpath-details-auto-binding':
                        this.getXpathDetailsForAutoBinding(messageBody);
                        break;
                        
                    default:
                        break;
                }
            }
        } );
    }

    getXpathDetailsForAutoBinding(data: any) {
        let returnObject: any = {};
        try {
            const currElement = document.elementFromPoint(data.pageXPos, data.pageYPos);
            const currentElementTagName = currElement.tagName.toLowerCase();
            const bindingType = data.data.bindingType;
            const xPathDetails = this.utilityService.getXPathByElement(currElement, data);
            if (currElement.closest('[ep-model][ep-scope][ep-scope-name][ep-bind-type]')
                || currentElementTagName !== 'div' && (currentElementTagName !== 'select' && bindingType.toLowerCase() === 'output')
                || !xPathDetails) {
                throw new Error('Invalid Drop Location');
            }
            data.isDroppedOnSelect = (currentElementTagName === 'select');
            returnObject = { iframeData: data, xPathDetails };
        } catch (error) {
            returnObject = {isValid: false, errorMessage: error.message};
        }
        this.utilityService.sendMessageToParent( 'xpath-details-auto-binding-callback', returnObject );
    }

    getRequestResponseContainer (data) {
        let mappingDetails = data.dataBinding.mappingDetails;
        let apiDetails = mappingDetails.apiDetails;
        let requestContainer = document.querySelector('[ep-model="' + apiDetails.input + '"][ep-bind-type="INPUT"][ep-scope]');
        let responseContainer = document.querySelector('[ep-model="' + apiDetails.output + '"][ep-bind-type="OUTPUT"][ep-scope]');
        if(requestContainer) {
            mappingDetails.request.scopeKey = requestContainer.getAttribute('ep-scope');
        }
        if (responseContainer) {
            mappingDetails.response.scopeKey = responseContainer.getAttribute('ep-scope');
        }
        this.utilityService.sendMessageToParent( 'bind-api', data );
    }

    handleDndOperation( data ) {
        const currElement = document.elementFromPoint( data.pageXPos, data.pageYPos );
        const xPathDetails = this.utilityService.getXPathByElement(currElement, data);
        if ( xPathDetails ) {
            switch (data.elementType) {
                case 'popup':
                    this.updateDOM( xPathDetails, currElement, data.popupId );
                    break;
                case 'auto-binding':
                    this.updateDOMForAutoBinding(data, xPathDetails, currElement);
                    break;
                default:
                    this.updateDOM( xPathDetails, currElement, null );
                    break;
            }
            this.propertyService.drawOutlineContainer();
            if (!data.isCallbackNotRequired) {
                this.utilityService.sendMessageToParent( 'dnd', xPathDetails );
            }
        }
    }
    updateDOMForAutoBinding(data: any, xPathDetails: any, currElement: Element) {
        let autoBindingDetailsObj: any = {isValid: true};
        try {
            if (data.elementType === 'auto-binding') {
                const dataBindingDetails = data.dataBinding;
                const domContent = xPathDetails.additionalDetails.elementDOM;
                if (currElement.children.length === 0 || dataBindingDetails.type.toLowerCase() === 'output') {
                    if (data.isDroppedOnSelect) {
                        $(currElement).replaceWith($(domContent));
                    } else {
                        $(currElement).append($(domContent));
                    }
                } else {
                    $(currElement).attr('ep-model', dataBindingDetails.model);
                    $(currElement).attr('ep-scope', dataBindingDetails.scopeKey);
                    $(currElement).attr('ep-scope-name', dataBindingDetails.scopeName);
                    $(currElement).attr('ep-bind-type', dataBindingDetails.type);
                    this.propertyService.handleSelectedElement(currElement);
                    const _this = this;
                    setTimeout(() => {
                        _this.propertyService.handleMappingDetails(currElement);
                    }, 1000);
                }
            }
        } catch (error) {
            autoBindingDetailsObj = { isValid: false, errorMessage: error.message };
            console.error(error);
        }
        xPathDetails.autoBindingDetailsObj = autoBindingDetailsObj;
    }

    updateDOM( xPathDetails, currElement, popupId ) {
        xPathDetails.isTargetElementContainer =
            ( this.CONTAINER_ELEMENTS.indexOf( xPathDetails.additionalDetails.targetDomTagName || '' ) !== -1 );
        const domContent = xPathDetails.additionalDetails.elementDOM;
        if ( ['HTML', 'BODY'].indexOf( currElement.tagName ) !== -1 || popupId != null ) {
            currElement = document.querySelector( 'app-' + xPathDetails.additionalDetails.rootComponentName );
        }
        if(popupId != null){
            $(currElement).append($(domContent));
            $('#' + popupId).modal('show');
        }else if (xPathDetails.isTargetElementContainer) {
            if (xPathDetails.additionalDetails.isManualBindingDom) {
                if (xPathDetails.additionalDetails.isSingleBindingDom) { // check it is dropped single from the tree(insert only mapped element)
                    $(currElement).append($(domContent).find('input, textarea, select, span'));
                } else { // (insert all the children)
                    $(currElement).append($(domContent).children());
                }
            } else {
                $(currElement).append($(domContent));
            }
        } else if (xPathDetails.additionalDetails.isToReplaceSingleBindingDom) {
            //$(currElement).replaceWith($(domContent).find('input, textarea, select'));
            //updating only ngModel dom attribute
            $(currElement).attr('ep-ng-model', $(domContent).find('input, textarea, select').attr('ep-ng-model'));
        } else {
            $(currElement).after($(domContent));
        }
        if (popupId != null) {
            $('#' + popupId).modal('show');
        }
    }

    getElementDetailsForManualBinding(data: any) {
        const returnObject: any = {};
        try {
            const currElement = document.elementFromPoint(data.pageXPos, data.pageYPos);
            let querySelector = '[ep-model="' + data.mappingDetails.model + '"]';
            querySelector = querySelector + '[ep-scope-name="' + data.mappingDetails.scopeName + '"]';
            querySelector = querySelector + '[ep-scope="' + data.mappingDetails.scopeKey + '"]';
            querySelector = querySelector + '[ep-bind-type="' + data.mappingDetails.bindingType + '"]';
            if ($(currElement).closest(querySelector).length === 0) throw new Error('Invalid Drop Location');
            const xPathDetails: any = this.utilityService.getXPathByElement(currElement, data);
            xPathDetails.isTargetElementContainer =
                    ( this.CONTAINER_ELEMENTS.indexOf( xPathDetails.additionalDetails.targetDomTagName || '' ) !== -1 );
            returnObject.xPathDetails = xPathDetails;
            if (!xPathDetails) throw new Error('Invalid Drop Location');
        } catch (error) {
            data.errorMessage = error.message;
        }
        returnObject.data = data;
        this.utilityService.sendMessageToParent( 'manual-binding-callback', returnObject );
    }

    bindEvent( element, eventName, eventHandler ) {
        if ( element.addEventListener ) {
            element.addEventListener( eventName, eventHandler, false );
        } else if ( element.attachEvent ) {
            element.attachEvent( 'on' + eventName, eventHandler );
        }
    }

    handleToggleGrid( data ) {
        const toggleGrid = data.gridView;
        if ( toggleGrid ) {
            document.body.classList.add( 'ep-enable-grid' );
        } else {
            document.body.classList.remove( 'ep-enable-grid' );
        }
        this.propertyService.drawOutlineContainer();
    }

    showPopup(popupId: string){
        $('.modal').modal('hide');
        $('#'+popupId).modal('show');
    }

    hidePopup(popupId: string){
        $('#'+popupId).modal('hide');
    }

    addNewTab(data: any) {
        const currElement = this.propertyService.selectedElement;
        const tabTemplate = $('<li class="nav-item"><a id="'+data.tabId+'" class="nav-link text-nowrap" data-toggle="tab" href="#' + data.tabContentId + '" role="tab" aria-selected="false">New Tab</a></li>');
        const tabContentTemplate = $('<div class="tab-pane fade" id="' + data.tabContentId + '" role="tabpanel">...</div>');
        let role = $(currElement).attr('role');
        let payLoad;
        let parentTab;
        switch (role) {
            case 'tab':
                parentTab = $(currElement.parentElement.parentElement).attr('id');
                $(this.propertyService.selectedElement.parentElement.parentElement).append(tabTemplate);
                break;
            case 'tablist':
                parentTab = $(currElement).attr('id');
                $(this.propertyService.selectedElement).append(tabTemplate);
                break;
            default:
                break;
        }
        $('#content-' + parentTab).append(tabContentTemplate);
    }

    changeTabPosition(data){
        let role = $(this.propertyService.selectedElement).attr('role');
        let tabLevel;
        let parentLevel = 0;
        let containerClass;
        let tabClass;
        if (role === 'tab') {
            tabLevel = 1;
            parentLevel = tabLevel + 1;
        } else {
            tabLevel = 0;
            parentLevel = 0;
        }
        let currentElement = this.propertyService.selectedElement;
        $(this.propertyService.selectedElement).parents()[parentLevel].classList = '';
        switch (data.position) {
            case 'Top Left':
                containerClass = 'container';
                tabClass = 'nav nav-tabs';
                break;
            case 'Left':
                containerClass = 'd-flex';
                tabClass = 'nav flex-column';
                break;
            case 'Top Right':
                containerClass = 'container';
                tabClass = 'nav nav-tabs justify-content-end';
                break;
            case 'Right':
                containerClass = 'd-flex flex-row-reverse';
                tabClass = 'nav flex-column justify-content-end';
                break;
            default:
                break;
        }
        $(this.propertyService.selectedElement).parents()[parentLevel].classList = '';
        if (tabLevel == 0) {
            $(this.propertyService.selectedElement).removeClass();
            $(this.propertyService.selectedElement).parent().addClass(containerClass);
            $(this.propertyService.selectedElement).addClass(tabClass);
        } else {
            $(this.propertyService.selectedElement).parents()[tabLevel].classList = '';
            $(this.propertyService.selectedElement).parents()[parentLevel].classList = containerClass;
            $(this.propertyService.selectedElement).parents()[tabLevel].classList = tabClass;
        }
    }

}
