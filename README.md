# Onboarding project for JavaScript  

This is a JavaScript project for all new developers to complete before venturing into our web frontend codebase.  

Once you complete this project, and have been through code review, you will have a much better understanding of JavaScript
and it's superset, TypeScript, that we use for development.  

## Technologies you will encounter  

1. HTML  
1. CSS  
1. JavaScript  
1. TypeScript  
1. Node Package Manager (npm)
1. JQuery  

## Brief  

You task is to build a grid/table in TypeScript that fetches data from a server and displays it. Here are the requirements:  

1. The grid should cover the entire screen. The browser scrollbar should not appear.  
1. The columns widths should be distributed evenly.  
1. Display column headings based on the data you get back from the web service.  
1. The grid should have controls to navigate through data. You can choose a suitable way of doing this.  
1. Display the first page of data when you open up page for first time.  
1. Don't use any third-party libraries other than JQuery (already included in `third_party` directory).  

## Web Service API  

The web service you will retrieve data from is a little Golang REST service that is packaged with this repository. It runs on port 2050. 
Here are the relevant API calls:

1. Get total number of records  
	Path: `HTTP GET /recordCount`  
	Response: Integer number in body of response  
	Example response:  
		`350`

1. Get column names  
	Path: `HTTP GET /columns`  
	Response: JSON in body of response  
	Example response:  
		`[  
			"ID",  
			"City",  
			"Population"  
		]`  

1. Get records  
	Path: `HTTP GET /records?from={fromID}&to={toID}`   
	Response: JSON in body of response  
	The order of entries in a record corresponds to the order of the columns returned by the `/columns` API  
	The `from` and `to` parameters correspond to the record index which run from `0` to `record count - 1`  
	Example response:  
		`[  
				[0, "Cape Town", 3500000],  
				[1, "New York", 8500000],  
				[2, "Johannesburg", 4500000]  
		]`  

## Code Review  

Once you are done and happy with your solution, submit your code for code review by creating a pull request in GITHUB. The code review will take the following into account:  

1. Was the brief correctly followed, does the grid work as expected  
1. Is the code style according to our [JavaScript Style Guide](https://imqssoftware.atlassian.net/wiki/display/AR/Javascript+Style+Guide)  
1. User-centric thinking - is the grid easy to use  
1. Suitable comments  
1. Performance considerations   
1. Aesthetics  

## Pre-requisites  

1. You need to have set up your development environment [as described here](https://imqssoftware.atlassian.net/wiki/display/AR/Dev+Environment).  
1. We suggest using VSCode, but you can use your IDE of choice.   

## Getting Started  
These steps include just enough detail to guide you. Each step will require some additional research on your part:
1. Fork this GIT repository under your own GIT account  
1. Start up the backend server:
    - Open console and change directory to `server` directory  
    - Run `go run main.go`  
    - Open up your browser and point it to [http://localhost:2050](http://localhost:2050). You should see "Hello"  
1. Create the frontend project:  
    - Open another console in the project root directory  
    - Run `npm init` to initialise the JavaScript project. You can just use the default options.  
    - Install the TypeScript npm package.  
    - Install TypeScript type definitions for JQuery.  
    - Create an `app.ts` file in the root directory and add the following code to it:  
        `window.onload = () => { $("body").text("Hello world"); }`  
    - Add a npm script called "build" to `package.json` that does the TypeScript build (using the `tsconfig.json` included in the project).  
    - Run `npm run build`  
    - You will see a new file `app.js` in the project root. Add an entry for this script in `index.html`.  
    - Refresh [http://localhost:2050](http://localhost:2050). You should see "Hello world"  
1. Get coding!  
