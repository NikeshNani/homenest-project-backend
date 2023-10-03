const express = require('express')
const router = express.Router()
const pgDetailsControllers = require('../controllers/pg-details-controllers')
const authenticateUser = require('../middlewares/authentication')
const authorizeUser = require('../middlewares/authorization')
const upload = require('../middlewares/multer')

// Create a new PG
router.post('/createPg', upload.array('images', 5), authenticateUser,(req, res, next)=>{
    //console.log('Received a request to create a PG')
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser,  pgDetailsControllers.createPg)


// List all PGs with resident details
router.get('/allPgs', authenticateUser, (req, res, next)=>{
    req.permittedRoles = ['pg_resident']
    next()
}, authorizeUser, pgDetailsControllers.allPgList)
// Show details of a single PG by ID
router.get('/showSinglePg/:pgDetailsId', authenticateUser, (req, res, next)=>{
    req.permittedRoles = ['pg_resident']
    next()
}, authorizeUser, pgDetailsControllers.showsinglePg)

// Update a PG by ID
router.put('/updatePg/:id', authenticateUser, (req, res, next)=>{
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, upload.array('images', 5), pgDetailsControllers.update)

// Delete a PG by ID
router.delete('/destroyPg/:id', authenticateUser, (req, res, next)=>{
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, pgDetailsControllers.destroy)

//find the Pgs for host
router.get('/getPgsForAdmin',authenticateUser, (req, res, next)=>{
    req.permittedRoles = ['pg_admin']
    next()
}, authorizeUser, pgDetailsControllers.getAllPgForAdmin)

module.exports = router


