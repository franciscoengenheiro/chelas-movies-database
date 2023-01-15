# CMDB - Chelas Movies Database
>This project aims to allow, through our web interface, the ability to create, edit, and delete groups of movies. Groups management, including customization, requires the user to be logged in. Without requiring a valid authentication, the user can also search the top 250 most popular movies, get the details of a specific movie or search a movie by an expression of their choice instead. 

> Our [API](#server-api-documentation) was built by making use of some of the operations provided by the [IMDb API](https://imdb-api.com/api) and includes all the operations listed above.

> Our server provides data access support for data stored in internal memory or in a elastic search database. 

> The main goal of this project is to build our first website while incorporating new technologies and techniques covered in lectures.

# Table of Contents

- [Application structure](#application-structure)
- [Data storage design](#data-storage-design)
- [Mappings description between Elastic Search and Internal Data Structure Design](#mappings-description-between-elastic-search-and-internal-data-structure)
- [Server API documentation](#server-api-documentation)
- [Run Instructions](#run-instructions)

# Application Structure

### Client
> This component is responsible for all the logic surrounding a client interaction, namely logging in or registering a user. 

### Server
>This component is responsible for implementing most of the application, such as data access, processing and storage, the management of the HTTP requests and responses, and internal error translation. 

#### Data Access
- **Elastic Search** - Provides data access to a [Elastic search](https://www.elastic.co/) database. Consists of several sub-modules that know Elastic Search HTTP API and are responsible to map the retrieved data with the CMDB internal data structure.

- **Internal Memory** - Provides data access to internal memory stored data in the *local_data* package files. This module is responsible to map the retrieved data with the CMDB internal data structure.

- **Fetch** - Provides access to two fetch implementations. The *Local fetch* module simulates a fetch operation, in order to work and test without any limitations, while *Node Fetch* represents the [node-fetch](https://www.npmjs.com/package/node-fetch) module used to retrieve resources from a container in the web.

- **Util** - Provides access to file operations such as asynchronous read and write. The only current format supported is [JSON](https://www.json.org/json-en.html).

- **IMDb Movies** - Provides access to the [IMDb API](https://imdb-api.com/api) and has functions that maps the retrieved data with the CMDB internal data structure.

#### Errors  
- Implements all internal errors that the application may have, each of which is indicated by a unique identifier.
- The following image presents the mentioned errors:
    ```js
    let errorCodes =  {
        INVALID_ARGUMENT_CODE: 1,
        ARGUMENT_NOT_FOUND_CODE: 2,
        INVALID_USER_CODE: 3,
        USER_NOT_FOUND_CODE: 4,
        PASSWORDS_DO_NOT_MATCH: 5,
        EMAIL_IS_NOT_VALID: 6
    }
    ```

#### Services 
- This module serves as a *bridge* between the [Web](#web) and the [Data Access](#data-access) modules.
	- **General** - Contains all the logic of each of the application's functionalities. This module also verifies if the user has a valid token before allowing access to services functions and subsequent data.

	- **Users** - Manages application users services, namely requesting user creation and retrieving user data.

#### Web
- **API** - Provides the Web API that follows the [REST](https://developer.mozilla.org/en-US/docs/Glossary/REST) principles. This module handles the HTTP requests and invokes the operations on the corresponding *Services* module. It also generates a response in JSON format.

- **Site** - Presents the user interface structure by rendering HTML views used in each of the website pages. This module handles the HTTP requests and invokes the operations on the corresponding *Services* modules and contains sub-modules that maintain the website functionality. There's also a module that includes all of resources, including CSS, that were designed to make an adequate and perceptible presentation of the website appearance.
	- The following website modules handle the HTTP requests, invoke the corresponding operations on the [Services](#services) module and select the respective HTML views to be rendered.
    	- **General** - Verifies if the user has a [HTTP cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) to confirm that a login has been made, before allowing access to the Services functionalities that require user authentication. 
    	- **Users** - This module implements the [Passport](https://www.passportjs.org/) and [Express-Session](https://www.npmjs.com/package/express-session) modules integration in the application. It is also responsible for the login and logout logic, information extraction from HTML forms, validation and evaluation of the login status.
    - **Users Interface** - This module was added to allow the usage of *PUT* and *DELETE* methods in the HTML client scripts by accessing the [API](#server-api-documentation) operations. 
    - **Views** - Contains all the views and partial views to be rendered by the website modules. The view engine used is [HandleBars](https://handlebarsjs.com/) semantic templates.

- **Handle Request** - Module that exports the HTTP request handler. This handler simply channels to the received functions what to do in case of a request success and failure, respectively.

- **HTTP Error Responses** - This module is responsible for the application internal [errors](#errors) translation into HTTP error responses.

#### Application
- This module creates an [Express](https://expressjs.com/) node application, initializes all of its modules, including data access, services and web, and registers [middlewares](https://developer.mozilla.org/en-US/docs/Glossary/Middleware) used within the application's sub-modules routes. It is also possible to specify which fetch module to use.

#### Launch
- The entry point of the Application, this module is responsible for the application launch settings. To launch the server, see [Run Server commands](#launch-server).

#### Tests
- This module includes all of the unit and integration tests. To run the test scripts, see [Run Tests commands](#run-tests).

#### Docs
- This module combines all of the server documentation, including [OpenAPI specification](https://swagger.io/specification/) in yaml format and the [PostMan API](https://www.postman.com/) workspace that was used to perform client testing for our API and Elastic Search's.

# Data storage design 
### User
>Each stored user data consists of:
- **id** - user internal identifier (*provided by the server*).
- **username** - registration identifier.
- **password** - login authenticator.
- **email** - identification of an electronic mailbox.
- **token** - a random [UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID) (*provided by the server*).

### Group

>Each stored group data consists of:
- **id** - group internal identifier (*provided by the server*).
- **name** - group name.
- **description** - group description.
- **movies** - an array of movies, that can be empty.
- **userId** - user internal identifier (*provided by the server upon user creation*).

For a visual representation and example of usage of these data storage designs, refer to [Mapping description](#mappings-description-between-elastic-search-and-internal-data-structure).

>Regarding the Elastic Search database, it's data storage and management is different from the previously defined one. Each different type of data, in this case groups and users, are present in different indexes, these being the "container" of all the data of that type. Each of the indexes is composed of documents in which each of them represents new information from our application, that is, each document is either a group or a different user, depending on the index it belongs to.

# Mappings description between Elastic Search and Internal Data Structure

> Although elastic search gives users the option to establish their own document identifiers, it was determined to let elastic search produce them automatically for each group and user that is created, being those the indexes of this database. 

>The following image depicts a mapping between elastic search and our internal data structure on the left and right, respectively.

![Elastic Mapping](/docs_report/images/elastic-mapping.png)

# Server API Documentation

The **CMDB API** has the following routes (prefixed by the path segment - <code>/api</code>):

- **POST** <code>/users</code> - Creates a user by providing its username, password, email and confirmation password.
- **GET** <code>/movies</code> - Lists the top 250 most popular movies. There's an optional parameter *limit* that can be used in the query string to limit the search result. 
- **GET** <code>/movies/search/:moviesName</code> - Searchs movies by an expression. There's an optional parameter (limit) that can be used in the query string to *limit* the search result. 
- **GET** <code>/movies/find/:movieId</code> - Searches a movie by id.
- **POST** <code>/groups</code> - Creates a group by providing its name and description.
- **GET** <code>/groups</code> - Lists all user groups.
- **GET** <code>/groups/:groupId</code> - Retrieves a specified user group.
- **PUT** <code>/groups/:groupId</code> - Edits a specified user group.
- **DELETE** <code>/groups/:groupId</code> - Deletes a specified user group.
- **PUT** <code>/groups/:groupId/movies/:movieId</code> - Adds a movie to a specified user group.
- **DELETE** <code>/groups/:groupId/movies/:movieId</code> - Removes a movie from a specified user group.

For more information and examples consult the online API documentation that can be found in the **api/docs** section of the website.

# Run Instructions

### New Project Setup
- Use this commands before adding any files to a new project.
	- <code>npm init -y</code>
    - <code>npm install express</code>
	- <code>npm install express-session</code>
	- <code>npm install cookie-parser</code>
	- <code>npm install cors</code>
	- <code>npm install deep-email-validator</code>
	- <code>npm install hbs</code>
	- <code>npm install jest-openapi</code>
	- <code>npm install node-fetch</code>
	- <code>npm install nodejs</code>
	- <code>npm install nodemon</code>
	- <code>npm install passport</code>
	- <code>npm install swagger-ui-express</code>
	- <code>npm install yamljs</code>
	- <code>npm install chai --save-dev</code>
	- <code>npm install mocha --save-dev</code>
	- <code>npm install supertest --save-dev</code>

- In the *package.json* file:
    - Change *script* key value - *test*:
        - From:
            ```json
            "scripts": { 
                "test": "echo \"Error: no test specified\" && exit 1"
            }
            ```
        - To:
            ```json
            "scripts": { 
                "test": "mocha"
            }
            ```
        </code>
    - Add *imports* object:
        ```json
        "imports": {
            "#data_access/*": "./data_access*",
            "#local_data/*": "./local_data/*",
            "#docs/*": "./docs/*",
            "#errors/*": "./errors/*",
            "#services/*": "./services/*",
            "#tests/*": "./tests/*",
            "#web/*": "./web/*",
            "#root/*": "./*"
        }
        ```
### Insert Test Data
- Using internal memory data access:
    - There's already data store internally and can be viewed in *local_data*.
- Using Elastic search data access:
    - Run a elastic search database in the default port: 9200.
    - Create a workspace in Postman and import our Elastic Search test collection from the *docs/postman* package.
    - On Postman and while on the Elastic Search collection, search for the folder *Add Test Data* and select *Run*.
    - Do not change the run configurations, *Run manually* radio button should be selected along with only 1 iteration.
    - Click *Run Elastic Search* and the test data will be added to the Elastic Search database.

### Launch Server
- **Deployment** - <code>node cmdb-launch.mjs</code>
- **Development** - <code>nodemon cmdb-launch.mjs -e mjs, hbs</code>

### Run Tests
- Before running a test, in the [application](#application):
    - *local fetch* is enabled.
    - Data access is made by the [internal memory](#data-access) module.
- Commands:
    - **Integration** - <code>npm test tests/integration</code>
    - **Unit** - <code>npm test tests/unit</code>	

# Authors
- **Miguel Raposo** - A49456<br>
- **Gonçalo Silva** - A49451<br>
- **Francisco Engenheiro** - 49428

---

ISEL - Instituto Superior de Engenharia de Lisboa<br>
Introduction to Web Programing<Br>
Winter Semester of 2022/2023