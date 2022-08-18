# Team Structure as a Service

## How to run the backend service

1. Install the dependencies: run `npm install` in the root directory
2. Run the backend service: run `npm start`. The service should be available at http://localhost:1010/

## How to run the client web app

1. Open a new terminal and go to 'client' directory: `cd client`
2. Install the dependencies: run `npm install`
3. Run the client app: `npm start`. Open http://localhost:4200/ in the browser.

## How to run the tests

1. Install the dependencies (if not installed already): run `npm install` in the root directory
2. Run `npm test`

## Client web application

A simple Angular web app with a single page.

Fetches the current team structure and displays it.

<img width="867" alt="image" src="https://user-images.githubusercontent.com/9366962/184987597-ffc757bd-330a-49dc-8d64-f782f42cb19f.png">

## Backend API service

### Create a new member

POST http://localhost:1010/api/members

```json
{
  "name": "John Doe",
  "email": "john.doe@payhawk.com"
}
```

When created successfully, a 201 (Created) HTTP response should be returned:

```json
{
  "id": "1eb4f3dc-ec6a-4d8e-9d42-4afb9bcd889d",
  "name": "John Doe",
  "email": "john.doe@payhawk.com"
}
```

If no "managerId" passed - create as the team's top manager. If there is already a top manager, create as a direct report to the top manager

Creating a new member under a specific manager:

```json
{
  "name": "John Doe Two",
  "email": "john.doe2@payhawk.com",
  "managerId": "1eb4f3dc-ec6a-4d8e-9d42-4afb9bcd889d"
}
```

### Update a member

The manager of a member can be updated:

PUT http://localhost:1010/api/members/{memberId}

```json
{
  "managerId": "1eb4f3dc-ec6a-4d8e-9d42-4afb9bcd889d"
}
```

### Delete a member

A member can be deleted. If the member has employees, they are transferred to his manager.

DELETE http://localhost:1010/api/members/{memberId}

### Demote a member (delete + update)

A member can be demoted. If the member has employees, they are transferred to his manager. The member is moved to be under a given manager.

PUT http://localhost:1010/api/members/{memberId}/demote

```json
{
  "managerId": "1eb4f3dc-ec6a-4d8e-9d42-4afb9bcd889d"
}
```

### Import a team structure

A JSON file can be uploaded to set the current team structure. The current one gets replaced.

POST http://localhost:1010/api/team

Its important that the form data key is 'team' when uploading the json file.

Checkout the example json files in `__tests__/files`.

### Export the team structure

The team can be downloaded as a json file.

From the browser:

GET http://localhost:1010/api/team

### Get members by filters

The members can be filtered by name, email, managerEmail, and employeeEmail.

All filters are inclusive and case insensitive.

GET http://localhost:1010/api/members

GET http://localhost:1010/api/members?name=john&email=one

GET http://localhost:1010/api/members?managerEmail=doe&email=test@company.com

GET http://localhost:1010/api/members?employeeEmail=john&email=test@company.com

### Rebalance the team structure

The team structure can be rebalanced by a given balance index.

PUT http://localhost:1010/api/team

```json
{
  "balanceIndex": 2
}
```

### Testing

For testing are used [jest](https://jestjs.io/) and [supertest](https://www.npmjs.com/package/supertest).

-> insert image here <--
