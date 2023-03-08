# CMDB - Chelas Movies Database
![Home page](/docs/images/home.png)

> This project aims to allow, through our web interface, the ability to create, edit, and delete groups of movies. Groups management, including customization, requires the user to be logged in. Without requiring a valid authentication, the user can search the most popular movies, get the details of a specific movie or search a movie by an expression of their choice instead. 

> Our [API](#server-api-documentation) was built by making use of some of the operations provided by the [IMDb API](https://imdb-api.com/api).

> Our server provides data access support for data stored in internal memory or in a elastic search database. 

> Our website lacks cross-browser compatibility and was not built to be screen responsive, therefore there may be some inconsistencies. The website supports pagination.

> The whole project was a key evaluation point of the *Introduction to Web Development* course in the [CSE](https://www.isel.pt/en/curso/bsc-degree/computer-science-and-computer-engineering) undergraduate program of [ISEL](https://www.isel.pt/en).

# Table of Contents

- [Website pages preview](#Website-pages-preview)
- [Application structure](#application-structure)
- [Data storage design](#data-storage-design)
- [Mappings description between Elastic Search and Internal Data Structure Design](#mappings-description-between-elastic-search-and-internal-data-structure)
- [Server API documentation](#server-api-documentation)
- [Run Instructions](#run-instructions)

# Website pages preview

| ![Popular movies page](/docs/images/popular-movies.png) |
|:-:| 
| *Popular movies page* |


| ![Groups page](/docs/images/groups.png) |
|:-:| 
| *Groups page* |

| ![Movies page](/docs/images/movies.png) |
|:-:| 
| *Movies page* |

| ![Movie details page](/docs/images/movie.png) |
|:-:| 
| *Movie details page* |

# Application Structure
The application is divided in two major components. 
- The server component is responsible for implementing most of the application, such as data access, manipulation and storage, the management of the HTTP requests and responses, and internal error translation. 
- The client component is responsible for all the logic surrounding a client interaction, namely logging in or registering a new user.

## Data Access
- **Elastic Search** - Provides data access to a [Elastic Search](https://www.elastic.co/) database. Consists of several sub-modules that know Elastic Search HTTP API.

- **Internal Memory** - Provides data access to internal memory stored data in the [local data](#data-local) package files.

- **Fetch** - Provides access to two fetch modules implementations:
    - **Local fetch** - simulates a fetch operation, in order to mimic environmental conditions and work without any limitations. 
    - **Node Fetch** - represents the [node-fetch](https://www.npmjs.com/package/node-fetch) module used to retrieve resources from a container in the web.

- **Util** - Provides access to auxiliary functions, including file operations such as asynchronous read and write. The only current format supported is [JSON](https://www.json.org/json-en.html).

- **IMDb Movies** - Provides access to the [IMDb API](https://imdb-api.com/api).

## Data Local
This module stores data regarding groups, users and IMDb queries output in a local environment as JSON files.

## Data Manipulation
This module is responsible to map the received data with the CMDB internal data structure by providing functions and classes for this purpose. The functions that allows for pagination can also be found within.

## Errors  
Implements all internal errors that the application may have, each of which is indicated by a unique identifier.
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

## Services 
This module serves as a *bridge* between the [Web](#web) and the [Data Access](#data-access) modules. The services provided by the application are divided in two modules:
- **General** - Contains all the logic of each of the application's functionalities. This module also verifies if the user has a valid token before allowing access to services functions and subsequent data management.

- **Users** - Manages application users services, namely requesting user creation and retrieving user data.

## Web
- These next two modules handle the HTTP requests and invoke the operations on the corresponding [Services](#services) modules.
    - **API** - Provides a Web API that follows the [REST](https://developer.mozilla.org/en-US/docs/Glossary/REST) principles. The response format is in JSON.

    - **Site** - Presents the user interface structure by rendering HTML views used in each of the website pages. The division of the modules is as follows:
        - **General** - Verifies if the user has a [HTTP cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) to confirm that a login has been made before allowing access to the *Services* functionalities that require user authentication. 
        - **Users** - This module implements the [Passport](https://www.passportjs.org/) and [Express-Session](https://www.npmjs.com/package/express-session) modules integration in the application. It is also responsible for the login and logout logic, information extraction from HTML forms, validation and evaluation of the login status, and more.
        - **Views** - Contains all the views and partial views to be rendered by the website modules. The view engine used is the [HandleBars](https://handlebarsjs.com/) semantic templates.
        - **Assets** - Contains all the resources that maintain the website functionality and appearance.

- **Handle Request** - Module that exports the HTTP request handler. This handler simply channels to the received functions what to do in case of a request success and failure, respectively.

- **HTTP Error Responses** - This module is responsible for the application internal [errors](#errors) translation into HTTP error responses.

## Server
This module creates an [Express](https://expressjs.com/) node application, initializes all of its modules, including data access, services and web, and registers [middlewares](https://developer.mozilla.org/en-US/docs/Glossary/Middleware) used within the application's sub-modules routes.

## Config
This module provides the ability to dynamic import other modules conditionally, according to the received configuration object values.

## Launch
The entry point of the Application, this module is responsible for the application launch settings where a config object is used. An example can be seen below.

```js
const config = {
    server: {
        host: 'localhost',
        port: 1904,
    },
    fetch: 'local', 
    database: elastic
}
```

To launch the server, see [Run Server commands](#launch-server).

## Tests
This module includes all of the unit and integration tests. It was also added the [PostMan API](https://www.postman.com/) workspace that was used to perform client testing for our API and Elastic Search's.
To run the test scripts, see [Run Tests commands](#run-tests). 

## Docs
This module combines all of the server documentation, including [OpenAPI specification](https://swagger.io/specification/) in yaml format and resources used in other documents, including this report.

# Data storage design 
## User
>Each CMDB user consists of:
- **id** - user internal identifier (*provided by the server*).
- **username** - registration identifier.
- **password** - login authenticator.
- **email** - identification of an electronic mailbox.
- **token** - a random [UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID) (*provided by the server*).

## Group
>Each CMDB group consists of:
- **id** - group internal identifier (*provided by the server*).
- **name** - group name.
- **description** - group description.
- **movies** - an array of movies, that can be empty.
- **userId** - user internal identifier (*provided by the server upon user creation*).

For a visual representation and example of usage of these data storage designs, refer to [Mapping description](#mappings-description-between-elastic-search-and-internal-data-structure).

> The data storage and managment in the Elastic Search database is different from the internal storage, in several ways. Each different type of data, in this case groups and users, are present in different indexes, these being the *container* of all the data of that type. Each of the indexes is composed of documents in which each of them represents new information from the CMDB application, that is, each document is either a group or a different user, depending on the index it belongs to.

# Mappings description between Elastic Search and Internal Data Structure

> Although elastic search gives users the option to establish their own document identifiers, it was determined to let elastic search produce them automatically for each group and user that is created, being those the indexes of this database. 

>The following image depicts a mapping between elastic search and our internal data structure on the left and right, respectively.

![Elastic Mapping](/docs/images/elastic-mapping.png)

# Server API Documentation

The **CMDB API** has the following routes:

- **POST** <code>/users</code> - Creates a user by providing its username, password, email and confirmation password.
- **GET** <code>/movies</code> - Lists the most popular movies. The result set is paginated.
- **GET** <code>/movies/search/:moviesName</code> - Searchs movies by an expression. The result set is paginated.
- **GET** <code>/movies/find/:movieId</code> - Searches a movie by id.

The following routes are prefixed by the path segment - <code>/api</code>:

- **POST** <code>/groups</code> - Creates a group by providing its name and description. 
- **GET** <code>/groups</code> - Lists all user groups. The result set is paginated.
- **GET** <code>/groups/:groupId</code> - Retrieves a specified user group. The result set is paginated.
- **PUT** <code>/groups/:groupId</code> - Edits a specified user group.
- **DELETE** <code>/groups/:groupId</code> - Deletes a specified user group.
- **PUT** <code>/groups/:groupId/movies/:movieId</code> - Adds a movie to a specified user group.
- **DELETE** <code>/groups/:groupId/movies/:movieId</code> - Removes a movie from a specified user group.

All the routes marked with a paginated result set can 
receive a query string parameter *limit* to limit the search result and a *page* to retrieve a selected page. 

For more information and examples consult the online API documentation that can be found in the **about** section of the website.

# Run Instructions

## New Project Setup
- Use this commands before adding any files to a new project.
	- <code>npm init -y</code>
    - <code>npm install express</code>
	- <code>npm install express-session</code>
	- <code>npm install cors</code>
	- <code>npm install deep-email-validator</code>
	- <code>npm install hbs</code>
	- <code>npm install jest-openapi</code>
	- <code>npm install node-fetch</code>
	- <code>npm install nodejs</code>
	- <code>npm install -g nodemon</code>
	- <code>npm install passport</code>
	- <code>npm install swagger-ui-express</code>
	- <code>npm install yamljs</code>
    - <code>npm install bootstrap@v5.2.3</code>
	- <code>npm install chai --save-dev</code>
	- <code>npm install mocha --save-dev</code>
	- <code>npm install supertest --save-dev</code>

- In the ***package.json*** file:
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
    - Add *imports* object:
        ```json
        "imports": {
            "#data_access/*": "./data/access/*",
            "#data_local/*": "./data/local/*",
            "#data_manipulation/*": "./data/manipulation/*",
            "#docs/*": "./docs/*",
            "#errors/*": "./errors/*",
            "#services/*": "./services/*",
            "#tests/*": "./tests/*",
            "#web/*": "./web/*",
            "#root/*": "./*"
        }
        ```
## Insert Test Data
- Using internal memory data access:
    - There's already data store internally and can be viewed in ***data/local***.
- Using Elastic search data access:
    - Run a elastic search database in the default port - 9200 - or change to another in *elastic-search-util* module.
    - Create a workspace in Postman and import our Elastic Search test collection from the *tests/postman* package.
    - On Postman and while on the Elastic Search collection, search for the folder *Add Test Data* and select *Run*.
    - Do not change the run configurations, *Run manually* radio button should be selected along with only 1 iteration.
    - Click *Run Elastic Search* and the test data will be added to the Elastic Search database.

## Launch Server
- **Deployment** - <code>node cmdb-launch.mjs</code>
- **Development** - <code>nodemon cmdb-launch.mjs -e mjs, hbs</code>

## Run Tests
- Commands:
    - **Integration** - <code>npm test tests/integration</code>
    - **Unit** - <code>npm test tests/unit</code>	

## Authors
- **Miguel Raposo** - A49456<br>
- **Gonçalo Silva** - A49451<br>
- **Francisco Engenheiro** - A49428

---

Instituto Superior de Engenharia de Lisboa<br>
Introduction to Web Development<br>
Winter Semester of 2022/2023