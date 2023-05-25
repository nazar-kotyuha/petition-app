const mongoose = require('mongoose');

const petitionVoteScema = new mongoose.Schema({
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'User field can\'t be blank',
      },
      petition:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Petition',
          required: 'Petition field can\'t be blank',
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.model('PetitonVote', petitionVoteScema);