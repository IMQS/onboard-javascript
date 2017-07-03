# Onboarding project for JavaScript  

This is a JavaScript project for all new developers to complete before venturing into our web frontend codebase.  

Once you complete this project, and have been through code review, you will have a working understanding of:
- HTML and CSS, the browser's layout and styling language  
- JavaScript, the browser's one-and-only language  
- Vue.js, our UI component framework  
- webpack, our build system  

## Brief  

You task is to build an application showing a table that fetches data from a REST API. Here are the requirements:  

1. The table should cover the entire screen. The browser scrollbar should not appear.  
1. The columns widths should be distributed evenly.  
1. Display column headings based on the data you get back from the web service.  
1. The table should have controls to navigate through data. You can choose a suitable way of doing this.  
1. Display the first page of data when you open up page for first time.  

## Web Service REST API  

The web service REST API you will retrieve data from is a little Golang REST service that is packaged with this repository. 
Here are the relevant API calls:

1. Get total number of records  
	Path: `HTTP GET /api/recordCount`  
	Response: Integer number in body of response  
	Example response:  
		`350`

1. Get column names  
	Path: `HTTP GET /api/columns`  
	Response: JSON in body of response  
	Example response:  
		`[  
			"ID",  
			"City",  
			"Population"  
		]`  

1. Get records  
	Path: `HTTP GET /api/records?from={fromID}&to={toID}`  
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

1. Was the brief correctly followed, does the table work as expected  
1. User-centric thinking - is the application easy to use  
1. Suitable comments  
1. Performance considerations  
1. Aesthetics  

## Pre-requisites  
1. A basic understanding of:  
    - HTML and CSS - run through an online tutorial  
    - JavaScript - go read [JavaScript the Good Parts](https://books.google.co.za/books?id=PXa2bby0oQ0C&printsec=frontcover&dq=javascript+the+good+parts&hl=en&sa=X&ved=0ahUKEwiP3JrE6eLUAhVkAcAKHTgMBlIQ6AEIJjAA#v=onepage&q&f=false) (it's in our library in the kitchen)  
    - [Vue.js](https://vuejs.org/) - reading through a few examples on the website should be enough  
    - [webpack](https://webpack.js.org/) - reading through a few examples on the website should be enough  

1. Set up you development environment (you would have done this as part of the IMQS dev enviroment setup):  
    - Install a suitable IDE for web development (most of us use VSCode, Visual Studio Pro or IntelliJ).  
    - Install `node` and `npm`  
    - Install Golang (for the REST API)  

## Getting Started  
1. Get the source code:  
    - Fork this GIT repository under your own GIT account  
    - Clone the forked repository to you machine  
1. Initialize a Vue.js project with webpack as the build system:  
    - Open the console in the root of the repository and run:  
    - `npm install --global vue-cli`  
    - `vue init webpack my-project` - don't install `vue-router`, `Karma + Mocha` and `e2e tests`, choose default settings for everything else  
    - `cd my-project`  
    - `npm install`  

1. Start the REST API:  
    - Open console and change directory to `server` directory  
    - Run `env.bat`  
    - Run `go run main.go`  

1. Set up the webpack development server so that we can access the REST API:  
    - Open up the `my-project` in your favorite IDE  
    - Add the following to `config/index.js` inside `proxyTable` setting to allow the webpack dev server to speak to the REST API:  
        ```  
        '/api': {  
          target: 'http://localhost:2050',  
          changeOrigin: true,  
          pathRewrite: {  
            '/api': ''  
          }  
        }  
        ```  

1. Take your brand new project for a spin:  
    - Open console and change directory to `my-project` directory  
    - `npm run dev` - this will open up a new browser window with a "Hello World" Vue application  
    - Open up `my-project/src/components/Hello.vue` in your IDE and change something, you'll see your changes live in the browser  
    - Replace the contents of `my-project/src/components/Hello.vue` with the code below. You should see the record-count at the top of the page  
        ```
        <template>
          <div class="hello">
              {{ recordCount }}
          </div>
        </template>
        
        <script>
        export default {
          name: 'hello',
          data: function () {
            return {
              recordCount: 0
            }
          },
          created: function () {
            this.fetchRecordCount()
          },
          methods: {
            fetchRecordCount: function () {
              var xmlHttp = new XMLHttpRequest()
              xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                  this.recordCount = JSON.parse(xmlHttp.responseText)
                }
              }
              xmlHttp.open('GET', '/api/recordCount', true)
              xmlHttp.send(null)
            }
          }
        }
        </script>
        
        <!-- Add "scoped" attribute to limit CSS to this component only -->
        <style scoped>
        body {
          font-family: Helvetica Neue, Arial, sans-serif;
          font-size: 14px;
          color: #444;
        }
        </style>
        ```

1. Get coding!  
