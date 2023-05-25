const mongoose = require('mongoose');

const categoryScema = new mongoose.Schema({
    name:{
        type: String,
        required: 'Category name field can\'t be blank',
        unique: true
    },
    image:{
        type: String,
        required: 'Category image field can\'t be blank'
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'User field can\'t be blank',
    }
});

module.exports = mongoose.model('Category', categoryScema);