const mongoose = require('mongoose');

const petitionScema = new mongoose.Schema({
    name: {
        type: String,
        required: "Petition name field can't be blank"
      },
      description: {
        type: String,
        required: "Petition description field can't be blank"
      },
      petitionText: {
        type: String,
        required: "Petition text field can't be blank"
      },
      creator:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: 'User field can\'t be blank',
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: 'Petition category field can\'t be blank'
      },
      tags: {
        type: [String],
        required: "Petition tags field can't be blank"
      },
      image: {
        type: String
      }
});

petitionScema.index({ name: "text", tags: "text" })

module.exports = mongoose.model('Petiton', petitionScema);