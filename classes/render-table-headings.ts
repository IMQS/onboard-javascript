/// <reference path="../interfaces/has-format-method.ts" />

namespace HFM {
    /**
       * This class is used to inject the created html string containing the headings into the DOM 
       * @param div This parameter holds the created div element which contaings the headings html string to be injected into the HTML DOM
    */
    export class RenderTableHeading {
        constructor(  private container: HTMLDivElement) {}
        
        constructTableHeadings(hd: HasFormatMethod) {
            let div = document.createElement('div');
            div.innerHTML = hd.internalFormat();
            div.className = "tablecell";
            div.style.gridTemplateColumns = "repeat("+hd.arrayLength()+", 1fr)";

            this.container.append(div);
        }
    }
}