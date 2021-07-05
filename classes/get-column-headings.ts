/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    /**
       * This function is used to fetch the column headings from the back-end
       * @param hd This parameter holds the HTML DIV element with ID #headings
       * @param interfaceHeading This parameter is of type interface and holds the method for rendering the headings to the HTML DOM
       * @method HFM.TableHeadingString This method is for rendering the headings to the HTML DOM
    */
    export function getColumnsHeadings() {
        fetch("/columns").then(res => res.text()).then((headingsStr) => {
            let hd = new HFM.RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);
            let interfaceHeading = new HFM.TableHeadingString(headingsStr);		
            hd.constructTableHeadings(interfaceHeading);	
        }).catch(err => console.log(err));
    }
}