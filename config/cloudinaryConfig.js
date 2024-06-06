const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'deacm87l9',
    api_key: '174661533793152',
    api_secret: 'y3t4sKW0S_klH7obNlBKgrsyFiU'
});

module.exports = cloudinary;