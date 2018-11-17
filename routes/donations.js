import donations from '../models/donations';
import express from 'express';
let router = express.Router();

function getByValue(arr, id) {
    var result  = arr.filter(function(o) { return o.id == id;} );
    return result ? result[0] : null; // or undefined
}

router.home = function(req, res) {
    //route to handle all angular requests
    res.sendFile('../public/index.ejs'); // load our public/index.ejs file
};

router.findAll = function(req, res) {
    // Return a JSON representation of our list
    res.json(donations);
};

router.addDonation = function(req, res) {
    //Add a new donation to our list
    var id = Math.floor((Math.random() * 1000000) + 1);
    donations.push({id : id, paymenttype: req.body.paymenttype,
        amount: req.body.amount, upvotes: 0});
    res.json({ message: 'Donation Added!!'});
};

router.deleteDonation = function(req, res) {
    //Delete the selected donation based on its id
    var donation = getByValue(donations,req.params.id);
    var index = donations.indexOf(donation);
    donations.splice(index, 1);
    router.findAll(req,res);
};

router.incrementUpvotes = function(req, res) {
    //Add 1 to upvotes property of the selected donation based on its id
    var donation = getByValue(donations,req.params.id);
    if (donation) {
        donation.upvotes += 1;
        router.findAll(req,res);
    } else {
        res.status(404);
        res.json({ message: 'Invalid Donation Id!'});
    }
};

module.exports = router;
