const moment = require('moment');

exports.isLastDayOfMonth = () => {
  const currentDay  =  moment().format('YYYY-MM-DD');
  const lastDayOfCurrentMonth  =  moment(date).endOf('month').format('YYYY-MM-DD');

  if (currentDay === lastDayOfCurrentMonth) {
    return true;
  } else {
    return false;
  }
};