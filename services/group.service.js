const httpStatus = require("http-status");
const uniqid = require("uniqid");
const Group = require("../models/group.model");
const { shuffleMembers } = require("../utils/randomGen");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const createGroup = async (groupBody, userId) => {
  const data = {
    ...groupBody,
    uniqueId: uniqid(),
    admin: userId,
  };

  const group = await Group.create(data);
  return group;
};

const startSavingsById = async (id) => {
  const group = await Group.findOne({ uniqueId: id, status: false });
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group does not exist");
  }

  if(group.members.length < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "At least one person must be a member before tenure starts");
  }

  try {
    await GenerateRecipients(id);  

    const updatedGroup = await Group.findOneAndUpdate(
      { uniqueId: id },
      { status: true },
      {
        new: true,
      }
    );
    return updatedGroup;
    
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getVisibleGroups = async () => {
  const groups = await Group.find({ visible: true });
  return groups;
};

const getMembers = async (id) => {
  const group = await Group.findOne({ uniqueId: id }).populate({
    path: "members",
    select: "email firstName lastName phoneNumber _id",
  })
  .populate({
    path: "nextRecipients",
    select: "email firstName lastName phoneNumber _id",
  });

  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  return group.members;
};

const joinSavingsGroup = async (groupId, userId) => {
  // Find Group by id
  const group = await Group.findOne({ uniqueId: groupId });

  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  const userInGroup = await Group.findOne({
    members: { $elemMatch: { $eq: mongoose.Types.ObjectId(userId) } },
  });

  if (userInGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already in the Group");
  }

  const option = group.status === false ? { members: userId } : { members: userId, nextRecipients: userId };

  try {
    await Group.updateOne(
      { uniqueId: groupId },
      { $addToSet: option }
    );
    return "Savings Group Joined Successfully";
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const GenerateRecipients = async (groupId) => {
  try {
    const group = await Group.findOne({ uniqueId: groupId });
    let recipientTable = shuffleMembers(group.members);
    let recipientAdded = [];
    for (recipient of recipientTable) {
      recipientAdded = await Group.findOneAndUpdate(
        {uniqueId: groupId},
        { $push: { nextRecipients: recipient } },
        { new: true }
      );
    }
    return recipientAdded;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};



module.exports = {
  createGroup,
  startSavingsById,
  getVisibleGroups,
  getMembers,
  joinSavingsGroup,
};
