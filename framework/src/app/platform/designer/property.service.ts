import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';

@Injectable( {
    providedIn: 'root'
} )
export class PropertyService {
    mouseHoveredElement: any;
    selectedElement: any;
    selectedMappingDoms: any;
    KEY_CODE_ARROW_LEFT = 37;
    KEY_CODE_ARROW_UP = 38;
    KEY_CODE_ARROW_RIGHT = 39;
    KEY_CODE_ARROW_DOWN = 40;
    KEY_CODE_ESC = 27;
    KEY_CODE_DELETE_WINDOWS = 46;
    KEY_CODE_DELETE_MAC = 8;
    DOM_MOUSEOVER_SKIP_LIST = ['html', 'body'];
    constructor( private utilityService: UtilityService ) {
        utilityService.sendMessageToParent( 'check-parent-is-ui-studio', {} );
    }

    init() {
        // tslint:disable-next-line:variable-name
        const _this = this;
        $(document).on('mouseover', (event) => {
            _this.handleMouseoverElement( event );
        });
        $(document).on('click', (event) => {
            _this.handleSelectedElement( event.target );
        });
        $(document).on('click', '.p-mapping', (event) => {
            _this.handleMappingDetails( event );
        });
        $(window).mouseleave((event) => {
            if (event.toElement == null) {
                _this.handleWindowMouseLeaveElement(event);
            }
        });
        window.addEventListener('keydown', (event) => {
            if ( _this.selectedElement ) {
                _this.handleKeyPress( event );
            }
        });
    }

    handleKeyPress( event ) {
        switch ( event.keyCode ) {

            case this.KEY_CODE_ARROW_LEFT:
                this.handleKeyLeftEvent();
                break;

            case this.KEY_CODE_ARROW_RIGHT:
                this.handleKeyRightEvent();
                break;

            case this.KEY_CODE_ARROW_UP:
                this.handleKeyUpEvent();
                break;

            case this.KEY_CODE_ARROW_DOWN:
                this.handleKeyDownEvent();
                break;

            case this.KEY_CODE_ESC:
                this.handleKeyEscEvent();
                break;

            case this.KEY_CODE_DELETE_WINDOWS:
            case this.KEY_CODE_DELETE_MAC:
                this.handleKeyDeleteEvent();
                break;
            default:
                break;
        }
    }

    handleKeyLeftEvent() {
        this.handleSelectedElement( this.selectedElement.parentElement );
    }

    handleKeyRightEvent() {
        this.handleSelectedElement( this.selectedElement.firstElementChild );
    }

    handleKeyUpEvent() {
        this.handleSelectedElement( this.selectedElement.previousElementSibling || this.selectedElement.parentElement );
    }

    handleKeyDownEvent() {
        this.handleSelectedElement( this.selectedElement.nextElementSibling );
    }

    handleKeyDeleteEvent() {
        let role = this.selectedElement.getAttribute('role') || null;
        if(role != null && role === 'tablist' || role === 'tab' || role === 'tabpanel' || role === 'tab-content'){
            this.handleTabDelete(role);
        }
        this.selectedElement.remove();
        this.selectedElement = null;
        const outlineMouseoverContainer = $( '.ep-mouseover-dom-outline' );
        outlineMouseoverContainer.css( 'display', 'none' );
        $('.modal-backdrop').remove();
        this.drawOutlineContainer();
        this.utilityService.sendMessageToParent( 'delete-selected-element', {} );
    }

    handleTabDelete(role){
        let _selectedElement = this.selectedElement;
            let id;
            switch(role){
                case 'tablist':
                    id = $('.nav-link').first().attr('href');
                    id = id.replace(/^#/, '');
                    this.removeAllTabContent(id);
                    break;
                case 'tab':
                    id = $(_selectedElement).attr('href');
                    id = id.replace(/^#/, '');
                    this.removeTab("");
                    this.removeTabPanel(id);
                    break;
                case 'tabpanel':
                    id = $(_selectedElement).attr('id');
                    let htmlContent = $('.nav-link');
                    let elementToBeDeleted = null;
                    htmlContent.each((index, element) => {
                        let role = $(element).attr('role');
                        if (role === 'tab' && $(element).attr('href') === '#' + id) {
                            elementToBeDeleted = $(element).attr('id');
                            return false;
                        }
                    });
                    this.removeTabPanel("");
                    if (elementToBeDeleted != null) {
                        this.removeTab(elementToBeDeleted);
                    }
                    break;
                case 'tab-content':
                    id = $(_selectedElement).attr('id').replace('content-', '');;
                    this.removeAllTab(id);
                    break;
                default:
                    break;
            }
    }
    removeAllTabContent(contentId){
        $('#'+contentId).parents()[1].remove();
    }

    removeAllTab(tabId) {
        $('#'+tabId).parent().remove();
    }

    removeTab(id){
        if(id===""){
            if($(this.selectedElement).parents()[1].childElementCount === 1){
                $(this.selectedElement).parents()[2].remove();
            }else{
                $(this.selectedElement).parent().remove();
            }
        }else{
            if($('#'+id).parents()[1].childElementCount === 1){
                $('#'+id).parents()[2].remove();    
            }else{
                $('#'+id).parent().remove();
            }
        }
    }

    removeTabPanel(id){
        if(id===""){
            if($(this.selectedElement).parent().children().length === 1){
                $(this.selectedElement.parentElement).remove();
            }
        }else{
            let $tabContent = $('#'+id);
            if($tabContent.length){
                if($tabContent.parent().children().length === 1){
                    $('#'+id).parent().remove();    
                }else{
                    $('#'+id).remove();
                }
            }
        }       
    }

    handleKeyEscEvent() {
        this.selectedElement = null;
        this.drawOutlineContainer();
        this.utilityService.resetSelectedElement();
    }

    handleSelectedElement( element ) {
        if ( element && !element.closest('.ep-selected-dom-outline')) {
            let widgetElement = this.utilityService.getParentWidgetObject(element, "[widgetid]");
            if(widgetElement != null){
                element = widgetElement;
            }
            const xPathDetails: any = this.utilityService.getXPathByElement( element, {} );
            if ( xPathDetails && ( xPathDetails.xPath !== '/html' && xPathDetails.xPath !== '/html/body' ) ) {
                this.selectedElement = element;
                if (element.hasAttribute('ep-model') && element.hasAttribute('ep-scope') && element.hasAttribute('ep-bind-type')) {
                    xPathDetails.mappingDetails = {
                        model: element.getAttribute('ep-model'),
                        scopeKey: element.getAttribute('ep-scope'),
                        scopeName: element.getAttribute('ep-scope-name'),
                        bindingType: element.getAttribute('ep-bind-type'),
                        layoutType: element.getAttribute('ep-layout-type')
                    };
                }
                this.drawOutlineContainer();
                this.utilityService.sendMessageToParent( 'elementProperty', xPathDetails );
            }
        }
    }

    getBoundingValuesByElement(element) {
        const selectedElementBoundingValues = ( element as any ).getBoundingClientRect();
        const width = selectedElementBoundingValues.width;
        const height = selectedElementBoundingValues.height;
        const offsetLeft = selectedElementBoundingValues.left;
        const offsetTop = selectedElementBoundingValues.top;
        const scrolledVal = $( element ).closest( 'body' ).scrollTop();
        const marginTop = $(element).closest('html').scrollTop();
        return { width, height, offsetLeft, offsetTop, scrolledVal, marginTop };
    }
    drawOutlineContainer() {
        $('.ep-mapped-dom-outline').remove();
        const outlineContainer = $( '.ep-selected-dom-outline' );
        outlineContainer.css( 'display', 'none' );
        if (this.selectedElement) {
            // $( '.ep-selected-dom' ).removeClass( 'ep-selected-dom' );
            // $( this.selectedElement ).addClass( 'ep-selected-dom' );
            const selectedElementBoundingValues = this.getBoundingValuesByElement(this.selectedElement);
            outlineContainer.css( {
                transform: 'translate(' + selectedElementBoundingValues.offsetLeft + 'px , ' +
                                    (selectedElementBoundingValues.offsetTop + selectedElementBoundingValues.scrolledVal) + 'px)',
                width: selectedElementBoundingValues.width,
                height: selectedElementBoundingValues.height,
                marginTop: selectedElementBoundingValues.marginTop,
                display: 'block'
            });
            if (this.selectedElement.hasAttribute('ep-bind-type')) {
                $('.p-mapping').show();
                const bindType = this.selectedElement.getAttribute('ep-bind-type');
                const className = (bindType === 'INPUT' ? 'fa-upload' : 'fa-download');
                $('.p-mapping').removeClass('fa-download fa-upload fa-cog').addClass(className);
            } else if (this.selectedElement.hasAttribute('widgetid')) {
                $('.p-mapping').show();
                $('.p-mapping').removeClass('fa-download fa-upload fa-cog').addClass("fa-cog");
            }else {
                $('.p-mapping').hide();
            }
        }
    }

    handleWindowMouseLeaveElement( event ) {
        $( this.mouseHoveredElement ).removeClass( 'ep-mousehovered-dom' );
        this.mouseHoveredElement = null;
        const outlineMouseoverContainer = $( '.ep-mouseover-dom-outline' );
        outlineMouseoverContainer.css( 'display', 'none' );
    }

    handleMouseoverElement( event ) {
        if ( this.mouseHoveredElement !== event.target && this.DOM_MOUSEOVER_SKIP_LIST.indexOf( event.target.tagName.toLowerCase() ) === -1 ) {
            let widgetElement = this.utilityService.getParentWidgetObject(event.target, "[widgetid]");
            let mouseHoveredElement = widgetElement != null ? widgetElement : event.target;
            if(this.mouseHoveredElement !== mouseHoveredElement){
                if ( this.mouseHoveredElement ) {
                    $( this.mouseHoveredElement ).removeClass( 'ep-mousehovered-dom' );
                }
                this.mouseHoveredElement = mouseHoveredElement;
                $( this.mouseHoveredElement ).addClass( 'ep-mousehovered-dom' );
    
                const outlineMouseoverContainer = $( '.ep-mouseover-dom-outline' );
                outlineMouseoverContainer.css( 'display', 'none' );
                $( '.ep-mousehovered-dom' ).removeClass( 'ep-mousehovered-dom' );
                $( this.mouseHoveredElement ).addClass( 'ep-mousehovered-dom' );
                const selectedElementBoundingValues = ( this.mouseHoveredElement as any ).getBoundingClientRect();
    
                const width = selectedElementBoundingValues.width;
                const height = selectedElementBoundingValues.height;
                const offsetLeft = selectedElementBoundingValues.left;
                const offsetTop = selectedElementBoundingValues.top;
    
                const scrolledVal = $( this.mouseHoveredElement ).closest( 'body' ).scrollTop();
                const marginTop = $( this.mouseHoveredElement ).closest( 'html' ).scrollTop();
                outlineMouseoverContainer.css( {
                    transform: 'translate(' + offsetLeft + 'px , ' + ( offsetTop + scrolledVal ) + 'px)',
                    width, height, marginTop, display: 'block'
                } );
            }
        }
    }

    handleMappingDetails(event) {
        if (this.selectedElement.hasAttribute('ep-model')) {
            const xPathDetails = this.utilityService.getXPathByElement( this.selectedElement, {} );
            this.utilityService.sendMessageToParent( 'data-binding-popup', xPathDetails );
        }else if (this.selectedElement.hasAttribute('widgetid')) {
            const xPathDetails = this.utilityService.getXPathByElement( this.selectedElement, {} );
            xPathDetails.additionalDetails.epWidgetId = this.selectedElement.getAttribute('widgetid');
            this.utilityService.sendMessageToParent( 'widget-binding-popup', xPathDetails );
        }
    }

    updateDomWithNewProperties( data: any ) {
        if ( this.selectedElement ) {
            this.updateCssProperties( data );
            this.updateAttributeProperties( data );
            this.drawOutlineContainer();
        }
    }

    updateCssProperties( data ) {
        const cssProperty = data.cssProperty;
        const styleAttribute = cssProperty.attribute;
        const value = cssProperty.styleValue;
        const unit = cssProperty.unit;
        if ( value !== null && value !== '' ) {
            this.selectedElement.style[styleAttribute] = value + ( unit ? unit : '' );
        } else {
            this.selectedElement.style.removeProperty( styleAttribute );
        }
    }

    updateAttributeProperties( data ) {
        const additionalProperties = data.additionalProperties;
        if ( additionalProperties.name ) {
            this.selectedElement.setAttribute( 'name', additionalProperties.name );
        } else {
            this.selectedElement.removeAttribute( 'name' );
        }

        if ( additionalProperties.isPlaceholderRequired ) {
            this.selectedElement.setAttribute( 'placeholder', additionalProperties.placeholderValue );
            this.selectedElement.setAttribute( 'type', additionalProperties.inputType );
        }

        if ( additionalProperties.isInnerHtmlEditable ) {
            this.selectedElement.innerHTML = ( additionalProperties.value || '' );
        }
    }

    updateColumnLayout( messageBody: any ) {
        if ( this.selectedElement ) {
            const layoutValue = messageBody.layoutValue;
            if ( layoutValue === 'custom' ) {
                let colClassName;
                if ( this.selectedElement.children.length > 0 ) {
                    const lastElementClassList = this.selectedElement.children[this.selectedElement.children.length - 1]
                        .classList.toString().split( ' ' ).filter(( value ) => value.length > 0 );
                    colClassName = lastElementClassList.find(( value ) => ( value || '' ).startsWith( 'col' ) );
                }
                if ( !colClassName ) {
                    colClassName = 'col-6';
                }
                $( this.selectedElement ).append( $( '<div>' ).addClass( colClassName ) );
            } else {
                let i = 0;
                let j = 0;
                [].forEach.call( this.selectedElement.children, ( childElement: Element ) => {
                    if ( layoutValue.length <= i ) {
                        i = 0;
                    }
                    const col = layoutValue[i];
                    childElement.classList.forEach(( className: string ) => {
                        if ( ( className.startsWith( 'col-' ) || className === 'col' ) && ( className.indexOf( '-offset-' ) === -1 ) ) {
                            childElement.classList.remove( className );
                        }
                    } );
                    childElement.classList.add( 'col-' + col );
                    i++;
                    j++;
                } );
                for ( ; j < layoutValue.length; j++ ) {
                    $( this.selectedElement ).append( $( '<div class="col-' + layoutValue[j - 1] + '"></div>' ) );
                }
            }
            this.drawOutlineContainer();
        }
    }

    updateClassList( data: any ) {
        if ( this.selectedElement ) {
            const classList = ( data.classList || [] );
            this.selectedElement.setAttribute( 'class', classList.join( ' ' ) );
            this.drawOutlineContainer();
        }
    }

    viewMappedBindings(data: any) {
        $('.ep-mapped-dom-outline').remove();
        (data.mappingDetails || []).forEach(mapObj => {
            const mappedDom = this.utilityService.getDom(mapObj.xPathDetails, document, this.selectedElement);
            if (mappedDom) {
                const className = 'Appmodel_' + data.scopeKey + '_' + mapObj.mappedVariable + '';
                const outlineContainer = $('<div>').addClass('ep-mapped-dom-outline ' + className);
                this.hightlightMappedDom(mappedDom, outlineContainer);
            }
        });
        $('.ep-mapped-dom-outline').show();
    }

    unMap(data: any) {
        data.mappedVariables.forEach(mappedVariable => {
            const className = 'Appmodel_' + data.scopeKey + '_' + mappedVariable + '';
            $('.' + className).remove();
        });
    }

    removeMapping(messageBody: any) {
        $(this.selectedElement).removeAttr('ep-scope ep-scope-name ep-model ep-bind-type ep-layout-type');
        this.drawOutlineContainer();
    }

    updateScopeName(data: any) {
        const updatedScopeName = data.scopeName;
        const originalScopeName = data.originalScopeName;
        this.selectedElement.setAttribute('ep-scope-name', updatedScopeName);
    }

    viewCurrentEventElement(data: any) {
        $('.ep-mapped-dom-outline').remove();
        const eventId = data.eventId;
        let mappedDom = document.body.querySelector('[ep-map-id="' + eventId +'"]');
            const outlineContainer = $('<div>').addClass('ep-mapped-dom-outline');
        this.hightlightMappedDom(mappedDom, outlineContainer);
        $('.ep-mapped-dom-outline').show();
    }

    hightlightMappedDom(dom: any, outlineContainer: any){
        const boundingValue = this.getBoundingValuesByElement(dom);
        outlineContainer.css( {
            transform: 'translate(' + boundingValue.offsetLeft + 'px , ' +
                (boundingValue.offsetTop + boundingValue.scrolledVal) + 'px)',
            width: boundingValue.width,
            height: boundingValue.height,
            marginTop: boundingValue.marginTop,
            display: 'none'
        });
        const iconDom = $('<i class="fa fa-map-pin faa-vertical animated" aria-hidden="true"></i>');
        iconDom.css({ position: 'absolute', top: '-20px', left: '-3px', color: '#0064bd' });
        outlineContainer.append(iconDom);
        $('body').prepend(outlineContainer);
    }
    
    addEventMap(details: any){
        this.selectedElement.setAttribute(details.eventType, details.eventMethod);
        this.selectedElement.setAttribute('ep-map-id', details.mapId);
    }

    removeEventMap(details: any){
        let selectedElement = document.body.querySelector('[ep-map-id="' + details.eventFlowId +'"]');
        selectedElement.removeAttribute(details.eventType);
        if(details.removeMapId) selectedElement.removeAttribute('ep-map-id');
        $('.ep-mapped-dom-outline').remove();
    }
    
}

