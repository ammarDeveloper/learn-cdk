// lambda-layer/nodejs/utils.js
exports.formatResponse = (statusCode, body) => {
    return {
        statusCode,
        body: JSON.stringify(body)
    }
}

exports.validateInput = (event) => {
    // Add validation logic
    return true;
}