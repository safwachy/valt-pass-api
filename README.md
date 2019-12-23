# ValtPass Web API

An open sourced REST API for a password manager web application which utilises end-to-end encryption so that you're the only one with full control over your data!

The API is written in Node.js and uses MongoDB.

## Table of Contents
- [Usage](#usage)
- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Vault Folder Routes](#vault-folder-routes)
- [Vault Routes](#vault-routes)

## Usage

All resources are broken down into three collections.
- Users: contains your basic login credentials as well as other security parameters
- Vault Folders: organizes all of your passwords into folders
- Vaults: The actual document that contains your password data you choose to store as well as any other info like contact info or any notes you'd like to save

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
GET /users/:id/folders
POST /users/:id/folders

// Vault Routes
POST /users/:id/vaults
GET /users/:id/vaults/:vaultId
PATCH /users/:id/vaults/:vaultId
DELETE /users/:id/vaults/:vaultId
```

If you would like to test out this API yourself, you can make http requests to the following base URL:
```javascript
valt-pass-api.com
```

## Authentication Routes

ValtPass uses Twilio Authy two-factor authentication to ensure that your data stays secure.


### POST /register
- Register an account with ValtPass
- After registering, an email will be sent to the email address with a code so that you can verify your account
- Note: ValtPass only accepts passwords with at least 10 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
- As of right now, ValtPass only accepts North American phone numbers
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
- This route accepts the code from the response body of POST /login and the SMS token sent to you to confirm that you are who you say you are
- If successful, the auth token will be modified to conifirm that you have completed the 2FA process
- NOTE: The auth token only lasts for 30 min, so in other words, you will be logged in for 30 mins at a maximum

```js
// Sample Request Body
{
    smsTken: '880634',
    password: 'JsEvEiuOx'
}

// Sample Response Body
{
    data: {
        authToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI4YjdkYWUzNDQzMTkzZDYwMTRkZjI2MDc2MzE2NTFiNyIsImlkIjoiNWRmZmYyODliMTM2MjEwYTg3ZTlhMDliIiwiYXV0aHkiOnRydWUsImlhdCI6MTU3NzA1OTAxMiwiZXhwIjoxNTc3MDYyNjEyfQ.b0aMHGtQ30I4sEv9TuKlv2TFbI52ozU3NXG4Twle4Z-5dfqj6MsrTH_RSdz95Kqngobk1WHzrfpyFybpvwAEAw',
    }
}
``` 

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
- This will delete your user from ValtPass and all other documents associated with it
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

## Vault Routes


