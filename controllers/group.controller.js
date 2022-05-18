const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const groupService = require('../services/group.service');

const createGroup = catchAsync(async (req, res) => {
    const group = await groupService.createGroup(req.body, req.user._id);
    res.status(httpStatus.CREATED).send(group);
});

const startSavingsById = catchAsync(async (req, res) => {
  const saving = await groupService.startSavingsById(req.params.id);
  res.send(saving);
});

const joinSavingsGroup = catchAsync(async (req, res) => {
  const group = await groupService.joinSavingsGroup(req.params.id, req.user._id);
  res.send(group);
});

const getVisibleGroups = catchAsync(async (req, res) => {
  const groups = await groupService.getVisibleGroups();
  res.send(groups);
});

const getMembers = catchAsync(async (req, res) => {
  const members = await groupService.getMembers(req.params.id);
  res.send(members);
});

module.exports = {
  createGroup,
  startSavingsById,
  getVisibleGroups,
  getMembers,
  joinSavingsGroup
};