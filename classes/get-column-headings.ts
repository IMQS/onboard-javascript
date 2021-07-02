/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    export function getColumnsHeadings() {
        fetch("/columns").then(res => res.text()).then((headingsStr) => {
            let hd = new HFM.RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);
            let interfaceHeading = new HFM.TableHeadingString(headingsStr);		
            hd.constructTableHeadings(interfaceHeading);	
        }).catch(err => console.log(err));
    }
}