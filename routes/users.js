var express = require('express');
var router = express.Router();
let userSchema = require('../schemas/users');

// GET /api/v1/users — Lấy tất cả users (chưa bị xoá mềm)
router.get('/', async function (req, res, next) {
  try {
    let data = await userSchema
      .find({ isDeleted: false })
      .populate({ path: 'role', select: 'name description' });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET /api/v1/users/:id — Lấy user theo id
router.get('/:id', async function (req, res, next) {
  try {
    let result = await userSchema
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate({ path: 'role', select: 'name description' });
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "User không tồn tại hoặc đã bị xoá" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID không hợp lệ" });
  }
});

// POST /api/v1/users — Tạo user mới
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userSchema({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.roleId,
      loginCount: req.body.loginCount
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// PUT /api/v1/users/:id — Cập nhật user
router.put('/:id', async function (req, res, next) {
  try {
    let result = await userSchema.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "User không tồn tại hoặc đã bị xoá" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// DELETE /api/v1/users/:id — Xoá mềm user
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await userSchema.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (result) {
      res.status(200).send({ message: "Xoá mềm thành công", data: result });
    } else {
      res.status(404).send({ message: "User không tồn tại hoặc đã bị xoá" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID không hợp lệ" });
  }
});

// POST /api/v1/users/enable — Kích hoạt user (status = true)
// Body: { email, username }
router.post('/enable', async function (req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).send({ message: "Vui lòng cung cấp email và username" });
    }

    let result = await userSchema.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: true },
      { new: true }
    );

    if (result) {
      res.status(200).send({ message: "Kích hoạt tài khoản thành công", data: result });
    } else {
      res.status(404).send({ message: "Thông tin email hoặc username không chính xác" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/users/disable — Vô hiệu hóa user (status = false)
// Body: { email, username }
router.post('/disable', async function (req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).send({ message: "Vui lòng cung cấp email và username" });
    }

    let result = await userSchema.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: false },
      { new: true }
    );

    if (result) {
      res.status(200).send({ message: "Vô hiệu hóa tài khoản thành công", data: result });
    } else {
      res.status(404).send({ message: "Thông tin email hoặc username không chính xác" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
