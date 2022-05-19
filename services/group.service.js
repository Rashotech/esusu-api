const httpStatus = require("http-status");
const uniqid = require("uniqid");
const Group = require("../models/group.model");
const UserSavingsData = require("../models/user-savings.model");
const { generateRandom } = require("../utils/randomGen");
const ApiError = require("../utils/ApiError");

const createGroup = async (groupBody, userId) => {
  const { adminToJoin } = groupBody;

  const data = {
    ...groupBody,
    uniqueId: uniqid(),
    admin: userId,
  };

  const group = await Group.create(data);

  // Add to Join Savings Group Automatically if specified
  if (adminToJoin && adminToJoin === true) {
    await joinSavingsGroup(group.uniqueId, userId);
  }
  return "Group Created Successfully";
};

const startSavingsById = async (id) => {
  const group = await Group.findOne({ uniqueId: id, status: false });
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group does not exist");
  }

  const usersInGroup = await UserSavingsData.find({ group: group._id });

  // Minimum of 3 members are required to start a saving tenure
  if (usersInGroup.length < 3) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least three person must join before tenure starts"
    );
  }

  // Check Capacity Availability
  if (usersInGroup.length > group.maxCapacity) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Group Maximum Capacity Reached"
    );
  }

  try {
    // Assign Distribution Order to Users in the Group
    if (!group.status) {
      // The Tenure has not yet started
      let distributionTable = generateRandom(usersInGroup);
      for (let i = 0; i < usersInGroup.length; i++) {
        await UserSavingsData.findOneAndUpdate(
          { group: group._id, _id: distributionTable[i].id },
          {
            rank: distributionTable[i].rank,
            cycle: 4 * usersInGroup.length,
          }
        );
      }
    }

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
  const groupMembers = await UserSavingsData.find({ groupId: id })
    .populate({
      path: "user",
      select: "email firstName lastName phoneNumber _id",
    })
    .populate({
      path: "group",
      select: "name description _id",
    });

  if (!groupMembers) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  return groupMembers;
};

const joinSavingsGroup = async (groupId, userId) => {
  // Find Group by id
  const group = await Group.findOne({ uniqueId: groupId });

  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  const userInGroup = await UserSavingsData.findOne({
    group: group._id,
    user: userId,
  });

  if (userInGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already in the Group");
  }

  const unpaidUsers = await UserSavingsData.find({
    group: group._id,
    collected: false,
  });

  const groupMembers = await UserSavingsData.find({
    group: group._id,
  });

  const data = {
    user: userId,
    group: group._id,
    rank: group.status === false ? 0 : groupMembers.length + 1,
    groupId,
    cycle: unpaidUsers.length * 4,
  };

  try {
    await UserSavingsData.create(data);
    // Increase all unpaid users payment cycle count
    await UserSavingsData.updateMany(
      { collected: false },
      { $inc: { cycle: 4 } }
    );
    return "Savings Group Joined Successfully";
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

// Contribute Money
const contributeMoney = async (groupId, userId) => {
  // After Payment Confirmation from Payment gateway
  const group = await Group.findOne({ uniqueId: groupId, status: true });

  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  const user = await UserSavingsData.findOne({
    group: group._id,
    user: userId,
  });

  if (user.cycle === 0) {
    return "All Amount has been paid already";
  }

  try {
    await UserSavingsData.findOneAndUpdate(
      {
        group: group._id,
        user: userId,
      },
      {
        $inc: { amountPaid: group.fixedAmount, cycle: -1 },
        $addToSet: {
          payments: {
            paymentReference: uniqid(),
            amount: group.fixedAmount,
            status: "successful",
          },
        },
      }
    );
    return "Money Saved Successfully";
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

// Function to run in a cron job schedule every saturday for Automatic savings
const saveForAll = async () => {
  try {
    const data = await UserSavingsData.find({ collected: false })
      .populate("group")
      .populate("user");
    if (data.length > 0) {
      data.forEach(async (info) => {
        await contributeMoney(info.groupId, info.user);
      });
      console.log("payment");
      return true;
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

// Process Payment every month for the next inline in every group
const processPayment = async () => {
  try {
    // Get All Groups
    const data = await UserSavingsData.distinct("groupId", { cycle: 0 });
    if (data.length > 0) {
      // Check the groups
      data.forEach(async (info) => {
        const group = await UserSavingsData.find({
          groupId: info,
          collected: false,
        }).sort({ rank: "asc" });
        await UserSavingsData.findOneAndUpdate(
          { _id: group[0]._id },
          { collected: true },
          {
            new: true,
          }
        );
      });
      return true;
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

module.exports = {
  createGroup,
  startSavingsById,
  getVisibleGroups,
  getMembers,
  joinSavingsGroup,
  contributeMoney,
  saveForAll,
  processPayment,
};
