const fs = require('fs').promises;
const path = require('path');
const utils = require('/opt/nodejs/utils');

const filePath = path.join(__dirname, 'db.json');

const handleGet = async (event) => {
    try {
        const fileData = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileData);
        return utils.formatResponse(200, data.users);
    } catch (error) {
        console.error('Error reading file:', error);
        return utils.formatResponse(500, { message: 'Something went wrong' });
    }
};

const handlePost = async (event) => {
    // Implement your POST logic here
    return utils.formatResponse(200, { message: 'POST operation not implemented yet' });
};

exports.handler = async (event) => {
    console.log('Event: ', JSON.stringify(event, null, 2));

    switch (event.httpMethod) {
        case 'GET':
            return await handleGet(event);
        case 'POST':
            return await handlePost(event);
        default:
            return utils.formatResponse(405, { message: 'Method Not Allowed' });
    }
};
