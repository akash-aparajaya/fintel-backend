/*
==========================================
✅ Joi Validation Middleware
==========================================
Usage in routes:

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register
);

This keeps validation out of controllers so controllers stay clean.
*/

module.exports = (schema = {}) => (req, res, next) => {
  try {
    const parts = ["params", "query", "body"];

    for (const part of parts) {
      if (!schema[part]) continue;

      const { error, value } = schema[part].validate(req[part], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((d) => d.message),
        });
      }

      // Replace req body/params/query with validated+cleaned value.
      req[part] = value;
    }

    next();
  } catch (err) {
    next(err);
  }
};

