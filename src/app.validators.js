const moment = require('moment');

module.exports.isDateCorrect = (value)=>{
  return moment(value, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]', true).isValid();
};
