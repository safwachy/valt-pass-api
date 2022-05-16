# ValtPass Web API

An open sourced REST API for a password manager web application.

This backend API is written is Node.js and utillises MongoDB, two-factor authentication (2FA) as well as end-to-end encryption so that you're the only one with full control over your data!

## Table of Contents
- [Usage](#usage)
- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Vault Folder Routes](#vault-folder-routes)
- [Vault Routes](#vault-routes)

## Usage

All resources are broken down into three collections.
- Users: contains your basic login credentials as well as other security parameters
- Vault Folders: organizes all of your data into folders
- Vaults: The document which stores any website/application credentials. This can also store other info such as contact info or any notes you'd like to save

List of all endpoints:

```js
// Authentication Routes
POST /register
PATCH /users/:id/verify
POST /login
POST /users/login

// User Routes
GET /users/:id
DELETE /users/:id

// Vault Folder Routes
POST /users/:id/folders
GET /users/:id/folders

// Vault Routes
POST /users/:id/vaults
PATCH /users/:id/vaults/:vaultId
DELETE /users/:id/vaults/:vaultId
```

## Authentication Routes

ValtPass uses Twilio Authy two-factor authentication to ensure that your data stays secure.


### POST /register
- Register an account with ValtPass
- After registering, an email will be sent to the email address with a code so that you can verify your account
- Accepted Body Parameters:
    > email: String (Required)
    
    > password: String (Required) (Must have 10+ characters, 1+ uppercase letter, 1+ lowercase letter, 1+ number and 1+ special character)
    
    > confirmPassword: String (Required) (Must be the same as password)
    
    > phone: Number (Required) (Only North American numbers accepted as of right now)
```js
// Sample Request body
{
    email: 'example@email.com',
    password: 'Thisisatest@12345',
    confirmPassword: 'Thisisatest@12345',
    phone: 1233456789 // used for 2FA, must be of type Number
}

// Sample Response Body
{
    data: {
        user: '5dfff289b136210a87e9a09b' // returns a user id
    }
}
```

### PATCH /users/:id/verify 
- verify your email/account
- Accepted Body Parameters:
    > verificationCode: String (Required) (The code sent to your email)

```js
// Request Params: use the user id returned to you from /register
// PATCH /users/5dfff289b136210a87e9a09b/verify

// Sample Request Body
{ verificationCode: 'JsEvEiuOx' }

// Sample Response Body
{
    data: {},
    message: 'Successfully verified, please login to use your account'
}
```

### POST /login 
- Since ValtPass uses 2FA there are two routes for the login process this is the first
- If the request succeeds, a code will be sent to your phone via SMS, this should be used for the next route
- Accepted Body Parameters:
    > email: String (Required)
    
    > password: String (Required)
```js
// Sample Request Body
{
    email: 'example@email.com',
    password: 'Thisisatest@12345'
}

// Sample Response Body
{
    data: {
        authToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI4YjdkYWUzNDQzMTkzZDYwMTRkZjI2MDc2MzE2NTFiNyIsImlkIjoiNWRmZmYyODliMTM2MjEwYTg3ZTlhMDliIiwiaWF0IjoxNTc3MDU4OTg4LCJleHAiOjE1NzcwNjI1ODh9.L1EJj9RHaFvMAAmh0qYEl12lPsb0eZZVqtCiKnIcnH292pVN9spiR9QMkq0L8DV_aN12_qdnChbGSPxN0lyccw',
        code: 'JsEvEiuOx'
    }
}
```

### POST /users/login
- To use any further routes, including this one, the auth token from earlier must be used as a request header like so:
```
auth: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI4YjdkYWUzNDQzMTkzZDYwMTRkZjI2MDc2MzE2NTFiNyIsImlkIjoiNWRmZmYyODliMTM2MjEwYTg3ZTlhMDliIiwiaWF0IjoxNTc3MDU4OTg4LCJleHAiOjE1NzcwNjI1ODh9.L1EJj9RHaFvMAAmh0qYEl12lPsb0eZZVqtCiKnIcnH292pVN9spiR9QMkq0L8DV_aN12_qdnChbGSPxN0lyccw
```
- If successful, the auth token will be modified to conifirm that you have completed the 2FA process
- NOTE: The auth token expires after 30 mins, so in other words, you will be logged in for 30 mins at a maximum
- Accepted Body Parameters: (to prove that you are who you say you are)
    > smsToken: Number (Required)
    
    > verificationCode: String (Required) (The code from the response body of POST /login)

```js
// Sample Request Body
{
    smsToken: '880634',
    verificationCode: 'JsEvEiuOx'
}

// Sample Response Body
{
    data: {
        authToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI4YjdkYWUzNDQzMTkzZDYwMTRkZjI2MDc2MzE2NTFiNyIsImlkIjoiNWRmZmYyODliMTM2MjEwYTg3ZTlhMDliIiwiYXV0aHkiOnRydWUsImlhdCI6MTU3NzA1OTAxMiwiZXhwIjoxNTc3MDYyNjEyfQ.b0aMHGtQ30I4sEv9TuKlv2TFbI52ozU3NXG4Twle4Z-5dfqj6MsrTH_RSdz95Kqngobk1WHzrfpyFybpvwAEAw',
    }
}
``` 
- Don't forget to use your NEW auth token as a request header for the rest of the requests

## User Routes

### GET /users/:id

- Fetch your basic user info
```js
// Request Params: use your user id
// GET /users/5dfff289b136210a87e9a09b

// Sample Response Body
{
    data: {
        email: 'example@email.com',
        phone: 123456789,
        countryCode: '1'
    },
}
```

### DELETE /users/:id
- Permanently delete your user from ValtPass and all other documents associated with it
```js
// Request Params: use your user id
// DELETE /users/5dfff289b136210a87e9a09b

// Sample Response Body
{
    data: {},
    message: 'User deleted'
}
```

## Vault Folder Routes

### POST /users/:id/folders
- Create a folder to hold vault documents
- Accepted Body Parameters: 
    > name: String (Required)
```js
// Request Params: use your user id
// POST /users/5dfff289b136210a87e9a09b/folders

// Sample Request Body
{
    name: 'Example Folder 1'
}

// Sample Response Body
{
    data: {
        folder: {
            _id: '5e02a28ca209f000173dcebb',
            user: '5dfff289b136210a87e9a09b',
            name: 'Example Folder 1',
            createdAt: '2019-12-24T23:43:08.359Z',
            updatedAt: '2019-12-24T23:43:08.359Z',
            __v: 0
        }
    }
}
```

### GET /users/:id/folders
- Fetch all folders and all vault documents for a user
- A query parameter MUST be passed into the route
    - The name of this paramter is 'type' which is a string enumerator of either 'all', 'password', 'contact' or 'notes'
- When a user is created, a default folder called 'None' is created
```js
// Request Params: use your user id
// GET /users/5dfff289b136210a87e9a09b/folders?type=all

// Sample Response Body
{
    data: {
        folders: [
            {
                _id: '5e02a10ea209f000173dceba',
                user: '5e02a0e0a209f000173dceb9',
                name: 'None',
                createdAt: '2019-12-24T23:36:46.974Z',
                updatedAt: '2019-12-24T23:36:46.974Z',
                __v: 0,
                vaults: [
                    {
                        website: 'www.valtpass.com',
                        username: 'test_username',
                        password: 'test_password',
                        _id: '5e02a50ea209f000173dcebc',
                        folder: '5e02a10ea209f000173dceba',
                        type: 'password'
                    }
                ]
            },
            {
                _id: '5e02a28ca209f000173dcebb',
                user: '5e02a0e0a209f000173dceb9',
                name: 'Example Folder 1',
                createdAt: '2019-12-24T23:43:08.359Z',
                updatedAt: '2019-12-24T23:43:08.359Z',
                __v: 0,
                vaults: []
            }
        ]
    }
}
```

## Vault Routes

### POST /users/:id/vaults
- Create a vault document which will contain whatever info you wish to store securely
- Accepted Body Parameters:
    > folder: Mongo ObjectId (Optional) (default is the user's 'None' folder)
    
    > type: String (enum of 'password', 'contact', 'notes') (Required)
    
    > title: String (Optional)
    
    > website: String (Optional)
    
    > username: String (Optional)
    
    > password: String (Optional)
    
    > contactName: String (Optional)
    
    > email: String (Optional)
    
    > phone: String (Optional)
    
    > countryCode: String (Optional)
    
    > birthday: String (Optional)
    
    > contactNotes: String (Optional)
    
    > notes: String (Optional)
```js
// Request Params: use your user id
// POST /users/5dfff289b136210a87e9a09b/vaults

// Sample Request Body
{
    type: 'password',
    folder: '5e02a10ea209f000173dceba',
    title: ''Test vault 1,
    website: 'www.valtpass.com',
    username: 'test_username',
    password: 'test_password'
}

// Sample Response Body
{
    data: {
        vault: {
            _id: '5e02a50ea209f000173dcebc',
            user: '5e02a0e0a209f000173dceb9',
            type: 'password',
            folder: '5e02a10ea209f000173dceba',
            title: 'Test vault 1',
            website: 'www.valtpass.com',
            username: 'test_username',
            password: 'test_password'
        }
    }
}
```

### PATCH /users/:id/vaults/:vaultId
- Update or add new fields for an existing vault document
- Accepted Body Parameters:    
    > type: String (enum of 'password', 'contact', 'notes') (Optional)
    
    > title: String (Optional)
    
    > website: String (Optional)
    
    > username: String (Optional)
    
    > password: String (Optional)
    
    > contactName: String (Optional)
    
    > email: String (Optional)
    
    > phone: String (Optional)
    
    > countryCode: String (Optional)
    
    > birthday: String (Optional)
    
    > contactNotes: String (Optional)
    
    > notes: String (Optional)
```js
// Request Params: use your user id and the id of the vault document you want to edit
// POST /users/5dfff289b136210a87e9a09b/vaults/5e02a50ea209f000173dcebc

// Sample Request Body
{
    email: 'testupdate2@email.com'
    password: 'updates_test_password'
}

// Sample Response Body
{
    data: {
        vault: {
            _id: '5e02a50ea209f000173dcebc',
            user: '5e02a0e0a209f000173dceb9',
            type: 'password',
            folder: '5e02a10ea209f000173dceba',
            title: 'Test vault 1',
            website: 'www.valtpass.com',
            username: 'test_username',
            password: 'updated_test_password' 
            email: 'testupdate2@email.com',
            createdAt: '2019-12-24T23:53:50.170Z',
            updatedAt: '2019-12-25T00:21:09.258Z',
        },
        message: 'Update successful'
    }
}
```

### DELETE /users/:id/vaults/:vaultId
- Permanently delete a vault document
```js
// Request Params: use your user id and the id of the vault document you want to delete
// POST /users/5dfff289b136210a87e9a09b/vaults/5e02a50ea209f000173dcebc

// Sample Response Body
{
    data: {},
    message: 'Vault document deleted successfully'
}
```

