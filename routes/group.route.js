const express = require('express');
const validate = require('../middleware/validate');
require('dotenv').config();

const groupValidation = require('../validations/group.validation');
const groupController = require('../controllers/group.controller');

const auth = require('../middleware/auth');
const groupAdmin = require('../middleware/groupAdmin');
const router = express.Router();

router.post('/', auth(), validate(groupValidation.createGroup), groupController.createGroup);
router.get('/list', groupController.getVisibleGroups);
router.get('/savings/start/:id', groupAdmin(), validate(groupValidation.startSavingsById), groupController.startSavingsById);
router.get('/savings/contribute/:id', auth(), validate(groupValidation.contributeMoney), groupController.contributeMoney);
router.get('/members/:id', groupAdmin(), validate(groupValidation.getMembers), groupController.getMembers);
router.post('/join/:id', auth(), validate(groupValidation.joinSavingsGroup), groupController.joinSavingsGroup);


module.exports = router;