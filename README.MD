# ESUSU BACKEND

Backend REST API on Node.js  + Express.js + Mongoose.

## Quick Start to run locally

## Clone Repo

## Run npm install

## Setup Mongodb(Atlas or compass). Get connection string/url

## Create .env file

    Create .env file in project folder
    Enter these lines:

        DB_STRING = "
        DB_STRING_PROD = mongodb db live for production
        NODE_ENV = 'development'
        JWT_SECRET =
        JWT_ACCESS_EXPIRATION_MINUTES=
        JWT_REFRESH_EXPIRATION_DAYS=

## Start App
    npm start for production
    npm run dev - development
## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
```

## Validation

Request data is validated using [Joi](https://joi.dev/).
The validation schemas are defined in the `/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

### Documentation
The API docs can be found here - [Esusu API docs](https://documenter.getpostman.com/view/13581274/UyxnD4rb#68a0f47e-2235-407e-b4f8-312c04f9ab4b)