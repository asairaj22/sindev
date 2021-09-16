import { Injectable } from '@angular/core';

@Injectable( {
    providedIn: 'root'
} )
export class UtilityService {

    constructor() {
        this.getToggleGridStatus();
        this.resetSelectedElement();
        this.sendMessageToParent( 'page-loading-status', { isPageLoaded: true } );
    }

    getToggleGridStatus() {
        this.sendMessageToParent( 'update-grid-toggle-status', {} );
    }

    resetSelectedElement() {
        this.sendMessageToParent( 'reset-selected-element', {} );
    }

    sendMessageToParent( subtype: string, message: any ) {
        window.parent.postMessage( { type: 'eportal', subtype, message }, '*' );
    }

    getXPathByElement( currElement, data ) {
        const xPathDetails = this.getNodeTreeXPath( currElement, document, [], null );
        if ( xPathDetails ) {
            xPathDetails.additionalDetails = data;
            xPathDetails.additionalDetails.targetDomTagName = currElement.tagName;
            const parentDomObj = xPathDetails.parentDomObj;
            if ( parentDomObj ) {
                if ( parentDomObj.tagName.startsWith( 'APP-' ) ) {
                    xPathDetails.additionalDetails.componentSelector = parentDomObj.tagName.toLowerCase();
                }
                xPathDetails.parentDomObj = true;
            } else {
                xPathDetails.parentDomObj = false;
                xPathDetails.additionalDetails.componentSelector = data.rootComponentSelector;
            }
        }
        return xPathDetails;
    }

    getParentWidgetObject( node, query ) {
        if(node.matches("html") || node.matches("body")) return null;
        let parentObj = node.parentNode;
        while ( parentObj != null ) {
            if ( parentObj.matches( query ) ) {
                break;
            }
            parentObj = parentObj.parentNode;
            if ( parentObj.matches( 'html' ) === true || parentObj.matches( 'body' ) === true ) {
                parentObj = null;
            }
        }
        return parentObj;
    }

    getNodeTreeXPath( node, documentObj, ignoreIdList, parentDomObj ) {
        // tslint:disable-next-line:variable-name
        const _this = this;
        const IsUniqueNodeTreeXPath = ( xpath, node1, documentObj1, parentDomObj1 ) => {
            return node1 === _this.getDomByXPath( xpath, documentObj1, parentDomObj1 );
        };
        const paths = [];
        ignoreIdList = ignoreIdList || [];
        const contextNode = node;
        // Use nodeName (instead of localName) so namespace prefix is included (if any).
        for ( ; node && ( node.nodeType === 1 || node.nodeType === 3 ); node = node.parentNode ) {
            let index = 0;
            if ( parentDomObj && (!parentDomObj.contains( node ) || parentDomObj === node) ) {
                break;
            } else if ( node.tagName.startsWith( 'APP-' ) ) {
                parentDomObj = node;
                break;
            } 
            for ( let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling ) {
                // Ignore document type declaration.
                if ( sibling.nodeType === Node.DOCUMENT_TYPE_NODE ) {
                    continue;
                }

                if ( sibling.nodeName === node.nodeName ) {
                    ++index;
                }
            }
            const tagName = ( node.nodeType === 1 ? node.nodeName.toLowerCase() : 'text()' );
            const pathIndex = ( index ? '[' + ( index + 1 ) + ']' : '' );
            paths.unshift( tagName + pathIndex );
        }
        if ( paths.length ) {
            const pathString = ( !parentDomObj ? '/' : '' ) + paths.join( '/' );
            if ( IsUniqueNodeTreeXPath( pathString, contextNode, documentObj, parentDomObj ) ) {
                return { xPath: pathString, parentDomObj, additionalDetails: null };
            }
        }
        return null;
    }

    getDomByXPath( xpath, documentObj, parentDomObj ) {
        if ( parentDomObj ) {
            return parentDomObj.querySelector( ':scope > ' + this.convertXPathToCssSelector( xpath ) );
        } else {
            return ( documentObj.evaluate( xpath, documentObj, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue );
        }
    }

    convertXPathToCssSelector( text ) { // TODO: need to do Enhancement
        // parse //*
        text = text.replace( new RegExp( '//\\*', 'g' ), '' );

        // parse id
        text = text.replace( new RegExp( '\\[@id="([^"]*)"\\]', 'g' ), '#$1' );

        // parse [n]
        text = text.replace( new RegExp( '\\[([0-9]+)\\]', 'g' ), ':nth-of-type($1)' );

        // parse /
        text = text.replace( new RegExp( '/', 'g' ), ' > ' );

        text = text.trim();
        if ( text.startsWith( '>' ) ) {
            text = text.substr( 1 );
        }
        return text;
    }

    getDom(data, domParser, parentObj) {
      let domObj = null;
      if (data.parentDomObj) {
         let xpath = '';
         if (!data.xPath.startsWith('//') && data.xPath.startsWith('/')) {
           xpath = '/' + data.xPath;
         } else if (!data.xPath.startsWith('/')) {
           xpath = '//' + data.xPath;
         }
         if (parentObj === null) {
            xpath = xpath.replace('//', '//body/');
         } else {
            xpath = xpath.replace('//', '');
        }
         domObj = this.getDomByXPath(xpath, domParser, parentObj);
       } else {
         domObj = domParser.body;
       }
      return domObj;
    }

}

