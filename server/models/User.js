const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = new mongoose.Schema({
    username: {type: String, unique: true, },
    password: {type: String },
    nickname: {type: String }
})

User.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

User.statics.login = async function(username, password) {
    const user = await this.findOne({ username });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect username');
};
  

module.exports = mongoose.model('User', User);
