# Onboarding project for JavaScript  

This is a JavaScript project for all new developers to complete before venturing into our web frontend codebase.  

Once you complete this project, and have been through code review, you will have a much better understanding of JavaScript
and it's superset, TypeScript, that we use for development.  

## Technologies you will encounter  

1. HTML  
1. CSS  
1. JavaScript  
1. TypeScript  
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
1. You can use either Microsoft Visual Studio Pro or Microsoft Visual Studio Express for Web as IDE.  

## Getting Started  

1. Fork this GIT repository under your own GIT account  
1. Open console and change directory to `server` directory  
1. Run `env.bat`  
1. Run `go run main.go`  
1. Open up your browser and point it to [http://localhost:2050](http://localhost:2050). You should see "Hello"  
1. Using Visual Studio, create a new TypeScript project called "Grid" in the root of the repository  
1. Close Visual Studio, navigate to the repo root and move the contents of the Grid directory to the root (replacing `index.html`).  
1. Re-open Grid.sln in Visual Studio.  
1. To allow debugging from the IDE, open the project properties in Visual Studio. Under the `Web` section:  
	- Under `Servers` section, change the dropdown to "External Host" and the project URL to http://localhost:2050  
	- Under `Debuggers` section, untick ASP.NET  
	- If you debug from Visual Studio now, Internet Explorer should open up with a demo TypeScript project.  
1. Get coding!  


# KM test1 for initial commit into develop branch...