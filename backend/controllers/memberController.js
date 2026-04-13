const memberModel = require("../models/memberModel");

exports.getMembers = (req, res) => {
  memberModel.getAllMembers((err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.createMember = (req, res) => {
  const member = req.body;

  memberModel.addMember(member, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Member added successfully" });
  });
};