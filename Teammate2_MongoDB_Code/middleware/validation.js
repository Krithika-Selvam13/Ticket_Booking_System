const { body, validationResult } = require('express-validator');

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid request data.',
      details: errors.array({ onlyFirstError: true }).map(e => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

const registerValidation = [
  body('name').isString().bail().trim().isLength({ min: 2, max: 80 }),
  body('email').isString().bail().trim().isEmail().normalizeEmail().isLength({ max: 254 }),
  body('password').isString().bail().isLength({ min: 12, max: 128 }),
  checkValidation,
];

const loginValidation = [
  body('email').isString().bail().trim().isEmail().normalizeEmail(),
  body('password').isString().bail().isLength({ min: 1, max: 128 }),
  checkValidation,
];

module.exports = { registerValidation, loginValidation };
