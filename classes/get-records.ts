// import { HasFormatMethod } from "../interfaces/has-format-method.js";

// generate html string for table rows data and render in browser
export class GetRecords {
    
    constructor(fromID: number, toID: number, clickTimeout: ReturnType<typeof setTimeout>){
        let fromIDElement = document.querySelector('#fromID') as HTMLParagraphElement;			// Accessing form data from front end
        let toIDElement = document.querySelector('#toID') as HTMLParagraphElement;				// Accessing form data from front end

        // Clear the timeout every time if you navigate and you're not at the start ID of all the data
        if (fromID != 1) {
            clearTimeout(clickTimeout);
        } else if (toID != totalNumofRecords) {
            clearTimeout(clickTimeout);
        }

        // Clear form value in front-end when navigating data using the arrows
        let startfrom = document.querySelector("#startfrom") as HTMLInputElement;
        startfrom.value = "";

        fromIDElement.innerHTML = fromID.toString();
        toIDElement.innerHTML = toID.toString();

        // Create table using the new set IDs inside a set timeout
        clickTimeout = setTimeout( () => {
            fetch("/records?from="+fromID+"&to="+toID).then(res => res.text()).then((value) => {
                generateTable(value);
            }).catch(err => console.log(err))
        }, 200);
	}

	// Returns formatted string to be placed in html
	internalFormat() {
		// return this.returnStr;
	}
}