const PgDetails = require('../models/pg-details-model')
const User = require('../models/users-model')
const sendMail = require('../helpers/nodemailer')
const axios = require('axios')

const pgDetailsControllers = {}

pgDetailsControllers.allPgList = async (req, res) =>{
    try{
        const pgs = await PgDetails.find().populate({
            path: 'reviews',
            select: 'review residentId',
            populate: {
                path: 'residentId',
                select: 'name', // 'name' is the field containing resident's name in the residents model
            }
        })
        res.json(pgs)
    }catch(e){
        res.json(e.message)
    }
}

pgDetailsControllers.showsinglePg = async (req, res) => {
    try{
        const pgDetailsId = req.params.pgDetailsId
        const showPg = await PgDetails.findOne({_id: pgDetailsId}).populate({
            path: 'reviews',
            select: 'review residentId',
            populate: {
                path: 'residentId',
                select: 'name', // 'name' is the field containing resident's name in the residents model
            }
        })
        console.log('showpg', showPg)
        res.json(showPg)
    }catch(e){
        res.json(e.message)
    }
}

pgDetailsControllers.createPg = async (req, res) => {
    try {
        const body = req.body

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.'})
        }

        const images = req.files.map(file => file.location)
        //Perform geocoding here
        const geocodingResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: body.address,
                format: 'json'
            }
        })

        if (geocodingResponse.data && geocodingResponse.data.length > 0) {
            const latitude = parseFloat(geocodingResponse.data[0].lat)
            const longitude = parseFloat(geocodingResponse.data[0].lon)

            // Create a new PgDetails instance with the geocoded values
            const pg = new PgDetails({ ...body, images, geo: { lat: latitude, lng: longitude },host : req.user.id })
            const pgDoc = await pg.save()
            return res.json(pgDoc)
        } else {
            return res.json({ message: 'Address not found.' })
        }  
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

pgDetailsControllers.update = async (req, res) => {
    try {
        const pgDetailsId = req.params.id
        const hostId = req.user.id
        const body = req.body
        let update = {}

        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => file.location)
            update.images = images
        }

        // Fetch the existing document
        const existingPg = await PgDetails.findOne({ _id: pgDetailsId, host: hostId })
        if (!existingPg) {
            return res.status(404).json({ error: 'PgDetails not found.' })
        }

        // Check if the user-provided address is different from the existing address
        if (body.address && existingPg.address !== body.address) {
            const geocodingResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: body.address,
                    format: 'json'
                }
            })

            if (geocodingResponse.data && geocodingResponse.data.length > 0) {
                const latitude = parseFloat(geocodingResponse.data[0].lat)
                const longitude = parseFloat(geocodingResponse.data[0].lon)
                update.address = body.address; // Update the address field
                update.geo = { lat: latitude, lng: longitude } // Update the geo field
            }
        } else {
            update.address = body.address // Update the address field
        }

        // Merge the `body` fields into the `update` object (excluding 'address')
        for (const key in body) {
            if (Object.prototype.hasOwnProperty.call(body, key) && key !== 'address') {
                update[key] = body[key]
            }
        }

        // Update the document using findOneAndUpdate
        const updatedPg = await PgDetails.findOneAndUpdate(
            { _id: pgDetailsId, host: hostId },
            update,
            { new: true, runValidators: true }
        )

        if (!updatedPg) {
            return res.status(404).json({ error: 'PgDetails not found.' })
        }

        // Retrieve the host's email address based on hostId
        const host = await User.findById(hostId)
        const hostEmail = host.email

        // Send email notification with the updated fields
        const subject = 'PG Details Updated'
        const text = 'Your PG Details have been updated'
        sendMail(hostEmail, subject, text)

        res.json(updatedPg)
    } catch (e) {
        console.error('Error:', e)
        res.status(500).json({ error: e.message })
    }
}


pgDetailsControllers.destroy = async (req, res) => {
    try{
       const pgDetailsId = req.params.id
       const hostId = req.user.id
       const response = await PgDetails.findOneAndDelete({_id : pgDetailsId, host : hostId})

       // Retrieve the host's email address based on hostId
       const host = await User.findById(hostId)
       const hostEmail = host.email

       // Send email notification with the updated fields
       const subject = 'PG Details Deleted'
       const text = 'Your PG Details have been deleted from your list.'
       sendMail(hostEmail, subject, text)

       res.json(response) 

    }catch(e){
        res.status(404).json({ error: e.message })
    }
}


//for finding the PGs for admin - how many PGs he/she  have
pgDetailsControllers.getAllPgForAdmin = async (req, res) => {
    try{
        const hostId = req.user.id
        const allPgsForHost = await PgDetails.find({host : hostId})
        res.json(allPgsForHost)
    }catch(e){
        res.status(404).json({ error: e.message })
    }
}

module.exports = pgDetailsControllers

