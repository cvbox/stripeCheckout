const express = require('express');
const router = express.Router();


const config = require('config-lite')(__dirname)

const keyPublishable = config.keyPublishable
const keySecret = config.keySecret

const stripe = require("stripe")(keySecret);

router.get('/status', function (req, res) {
    res.send("health")
});

router.get('/', function (req, res) {
    res.type('html')
    res.render('payindex')
});


// rest api , return json data
router.post('/charge', (req, res) => {
    let amount = req.body.amount || 101
    try {
        stripe.customers.create({
            name: 'xxxxx',
            email: req.email,
            source: req.body.stripeToken
        }).then(customer => {
            console.log("step 1 stripe customer create success info")
            stripe.charges.create({
                amount: amount,
                currency: 'usd',
                customer: customer.id,
                description: 'Thank you for your generous donation.'
            }).then((rsp) => {
                console.log("cool,success pay")
                res.json({ec: 0, msg: 'success'})
            }).catch((err) => {
                console.log('step 2 stripe create charges err', err)
                res.json({ec: 2, msg: err})
            })
        }).catch((err) => {
            console.log('step 1 stripe create customer err', err)
            res.json({ec: 1, msg: err})
        })

    } catch (err) {
        console.log('step final invoke pay charge err', err)
        res.json({ec: 999, msg: err})
    }
})


module.exports = router;
