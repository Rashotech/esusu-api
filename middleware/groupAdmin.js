const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Group = require('../models/group.model');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  const group = await Group.findOne({ uniqueId: req.params.id });

  if((user._id.toString() !== group?.admin.toString())) {
    return reject(new ApiError(httpStatus.FORBIDDEN, 'UnAuthorized'));
  }
  req.user = user;

  resolve();
};

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;