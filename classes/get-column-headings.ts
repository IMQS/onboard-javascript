/// <reference path="../has-format-method.ts" />

namespace HFM {
    export function getColumnsHeadings() {
        fetch("/columns").then(res => res.text()).then((headingsStr) => {
            let hd = new HFM.RenderTableHeading(document.querySelector('#headings') as HTMLDivElement);
            let interfaceHeading = new HFM.TableHeadingString(headingsStr);			// Call method to generate string containing table heading element
            hd.constructTableHeadings(interfaceHeading);					// Call method to render table headings element in browser
        }).catch(err => console.log(err));
    }
}