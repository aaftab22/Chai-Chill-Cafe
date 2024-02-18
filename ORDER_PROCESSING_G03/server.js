const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.static(__dirname + '/public'));

const port = 3000;
// Define MongoDB connection URI and options
const mongoURI = `mongodb+srv://PriyanshuShah:Priyanshu1219@priyanshushah.llyddbd.mongodb.net/?retryWrites=true&w=majority`;
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
//connecting to database using try catch
const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoURI, mongoOptions);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

//creating databse model for orders pending
const order_schema = new mongoose.Schema({
    customerName: String,
    customerNumber: Number,
    customerAddress: String,
    orderedItem: String,
    orderDate: Date,
    orderStatus: String,
    orderPrice: String,
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

// required for recieveing data from the browser
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res)=>{
    try {
        
        const order_results = await order_list.find()
        console.log(order_results)
        const driver_results = await drivers_collection.find()
        console.log(driver_results)
        if (order_results.length === 0) {
            
            return res.send("There are No pending Orders")
        } else {
            
            return res.render("orderlist.ejs", {orders : order_results, drivers: driver_results})
        }
    } catch(err) {
        return res.send("ERROR: with the / endpoint")
    } 
})

app.post('/update/:id', async (req, res) => {
   try{
        const getOrdersData = await order_list.findOneAndUpdate({ _id: req.params.id }, {orderStatus: "READY FOR DELIVERY"}, { new: true });
        console.log(getOrdersData);
        return res.redirect("/");
    }catch(err) {
        return res.send("ERROR: " + err);
    }
});
// Display Search page 
app.get("/search", (req,res)=>{
    return res.render("search.ejs")
})

// POST endpoint for searching for a student by name
app.post("/find", async (req,res)=> {
    console.log(`DEBUG: What did the form send us`)
    console.log(req.body)

    // Get all students with the matching name
    const results =  await order_list.find({customerName:req.body.custName})
    if (results.length === 0) {
        return res.send(`There are no matching students with name = ${req.body.custName}`)
    } else {        
        console.log(results)
        return res.render("searchlist.ejs", {list:results})
    }
})
//to run on the port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectToDatabase()
});