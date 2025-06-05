
  
  // middleware/validation.js
  const Joi = require('joi');
  
  const validatePaymentIntent = (req, res, next) => {
    const schema = Joi.object({
      amount: Joi.number().positive().required(),
      currency: Joi.string().valid('usd', 'eur', 'gbp').default('usd'),
      metadata: Joi.object().optional()
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    next();
  };
  
  const validatePaymentConfirmation = (req, res, next) => {
    const schema = Joi.object({
      paymentIntentId: Joi.string().required(),
      paymentMethodId: Joi.string().required()
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    next();
  };
  
  module.exports = {
    validatePaymentIntent,
    validatePaymentConfirmation
  };
  