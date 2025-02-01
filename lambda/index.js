exports.handler = async (event) => {
    const response = {
        statusCode : 200,
        body: JSON.stringify('HELLO FROM LAMBDA'),
    }

    return response;
}

// write code to call the apis of linked job posts of specific company