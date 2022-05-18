const Joi = require("joi");

const createGroup = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    maxCapacity: Joi.number().required(),
    fixedAmount: Joi.number().required(),
    visible: Joi.boolean(),
  }),
};

const startSavingsById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getMembers = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const joinSavingsGroup = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  createGroup,
  startSavingsById,
  getMembers,
  joinSavingsGroup
};
