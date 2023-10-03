const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')

const authenticateUser = require('../middlewares/authentication')
const authorizeUser = require('../middlewares/authorization')
const paymentsControllers = require('../controllers/payment-controllers')

// Create a rate limiter with your desired configuration
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // 5 requests per minute
    message: 'Too many requests from this IP, please try again later.',
  })

// Route to send payment reminders to residents of a specific PG
router.post('/sendPaymentReminders/:pgDetailsId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, limiter, paymentsControllers.sendPaymentReminders)

// Get payment details using Razorpay ID
router.get('/getPaymentDetails/:razorPayId', paymentsControllers.getRazorPayId)

// Confirm payment status
router.post('/payment/confirmation', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_resident']
    next()
}, authorizeUser, paymentsControllers.paymentConfirmation)

router.get('/getCompletedPayments/:pgDetailsId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, paymentsControllers.getCompletedPayments)

router.get('/getPendingPayments/:pgDetailsId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, paymentsControllers.getPendingPayments)

router.get('/getCompletedPaymentsTotal/:pgDetailsId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, paymentsControllers.getCompletedPaymentsTotal)

router.get('/getPendingPaymentsTotal/:pgDetailsId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, paymentsControllers.getPendingPaymentsTotal)

router.get('/getResidentPayments/:pgDetailsId/:residentId', authenticateUser, (req, res, next) => {
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, paymentsControllers.getResidentsPayments)

module.exports = router
