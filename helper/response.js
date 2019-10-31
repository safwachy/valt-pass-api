// template for the http json response
const responseBody = (responseObject, statusCode, data, message) => {
    const json = { data, message };
    return responseObject.status(statusCode).json(json);
}

const preconditionError = (responseObject, errors) => {
    const errorMessage = errors.array()[0].msg; // print the first error message
    return responseBody(responseObject, 412, {}, errorMessage);
}

module.exports = {
    responseBody,
    preconditionError
}