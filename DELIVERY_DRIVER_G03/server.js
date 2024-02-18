
const express = require('express')
const app = express()
const port = 3300
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');


const mongoURL = "mongodb+srv://PriyanshuShah:Priyanshu1219@priyanshushah.llyddbd.mongodb.net/?retryWrites=true&w=majority"
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoURL, mongoOptions);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting to the database:', error);
    }
};


app.use(express.static(__dirname + '/public'));



const order_schema = new mongoose.Schema({
    customerName: String,
    customerNumber: Number,
    customerAddress: String,
    orderedItem: String,
    orderDate: Date,
    orderStatus: String,
    orderPrice: Number,
    driverId: String,
    completeImage: {data: Buffer, contentType: String}
});
const order_list = mongoose.model("orders_collection", order_schema);


const drivers_collectionS = new mongoose.Schema({
    userName: String,
    firstName: String,
    lastName: String,
    password: String,
    vehicleModel: String,
    vehicleColor: String,
    vehicleLicense: String
})

const drivers_collection = mongoose.model("drivers_collection", drivers_collectionS)


app.get('/', (req, res) => {
    return res.render("login.ejs")
}
    )
app.get('/signup', (req, res) => {
    return res.render("signup.ejs")

}
)

app.get('/login', async (req, res) => {
    try {
        const temp = 0
        const driverDB = await drivers_collection.find()
        for (let driver of driverDB) {
            if (driver.userName === req.query.username && driver.password === req.query.password) {
                return res.redirect("/driverDashboard/" + driver._id)
            }
        }
        if (!temp) {
            return res.send('<h1>Invalid username or password</h1> <a href="/">Back to Login Page</a>')
        }
    }
    catch (err) {
        return res.send("ERROR: NOT ABLE TO LOGIN")
    }
}
)

app.get('/newdriver', async (req, res) => {
    try {
        const newDriver = new drivers_collection({
            userName: req.query.dusername,
            firstName: req.query.dfname,
            lastName: req.query.dlname,
            password: req.query.dpassword,
            vehicleModel: req.query.dvehiclemodel,
            vehicleColor: req.query.dvehiclecolor,
            vehicleLicense: req.query.dvehiclelicense
        })
        await newDriver.save();
        console.log(newDriver);
        return res.redirect("/")
    }
    catch (err) {
        return res.send("ERROR: NOT ABLE TO SIGN UP")
    }
}
)

app.get('/driverDashboard/:did', async (req, res) => {
    try {
        const driverDB = await drivers_collection.findById(req.params.did)
        const ordersDB = await order_list.find()
        return res.render("main.ejs", { orders: ordersDB, drivers: driverDB });
    }
    catch (err) {
        return res.send("ERROR: COULD NOT GET THE DATA FROM DATABASE")
    }
}
)


app.post("/driver/pickup/:oID/:dID", async (req, res) => {
    const orderDetails = await order_list.findById(req.params.oID)
    orderDetails.orderStatus = "IN TRANSIT"
    orderDetails.driverId = req.params.dID
    await orderDetails.save();
    return res.render("accepted.ejs", { orders: orderDetails });

})

const multer = require('multer');
const fs = require('fs');
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() )
    }
});

const upload = multer({ storage: storage, dest: 'uploads/' });
 
app.post("/driver/dropoff/:oID", upload.single('image') ,async (req, res) => {
try{
    const orderDetails = await order_list.findById(req.params.oID)
    console.log(req.file.filename);
    orderDetails.orderStatus = "DELIVERED"
    
    const img = {data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename )),
    contentType: 'image'}
    orderDetails.completeImage = img
    console.log(img.toString())
    if(await orderDetails.save()){
        console.log("PHOTO ADDED")
        return res.redirect("/driverDashboard/"+orderDetails.driverId)
    }
    else{
        console.log("ERROR WHILE TRANSFER")
    return res.send("TRY AGAIN");

    }
}
catch(err){console.error(err)}
return res.send("ERROR: "+ err)
})



app.listen(port, () => {
    console.log(`Working Fine on http://localhost:${port}`)
    connectToDatabase()
})