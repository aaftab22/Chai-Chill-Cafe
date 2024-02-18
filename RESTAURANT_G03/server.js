const express = require('express');
const app = express();
const port = 5500;
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://PriyanshuShah:Priyanshu1219@priyanshushah.llyddbd.mongodb.net/?retryWrites=true&w=majority';
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({extended : true}));

const connectToDatabase = async ()=>{
    try{
        await mongoose.connect(mongoURI);
        console.log("Database connection successful");
    }
    catch(error){
        console.log("Databse connection Faild...!! : " + error);
    }
}
connectToDatabase();

const orderDetailsSchema = new mongoose.Schema({
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

const menuDetailsSchema = new mongoose.Schema({
    itemName: String,
    itemUrl: String,
    itemPrice: Number,
    itemDescription: String
});

const orderModel = mongoose.model("orders_collection", orderDetailsSchema); 
const menuModel = mongoose.model("menu_items_collection", menuDetailsSchema);
let confirmed = false;

app.get("/", async (req,res) => {
    confirmed = false;
    try{
        const menuArrays = await menuModel.find();
        const orderConfirmed = req.query.orderConfirmed === 'true';
        const orderId = req.query.id;
        const orderStatus = req.query.orderStatus;
        return res.render("index.ejs", { menuList: menuArrays, orderConfirmed: orderConfirmed, orderId: orderId, orderStatus: orderStatus });
    }
    catch(err){
        return res.send("Error is : " + err);
    }
});

app.post("/orderOnline", async (req,res) => {
   
    const orderedItem = req.body.orderedItem;
    const temp = await menuModel.findOne({itemName :orderedItem});
    const price = temp.itemPrice;
    
    const ordersDetails = new orderModel ({
        customerName: req.body.fullName,
        customerNumber: req.body.mobileNumber,
        customerAddress: req.body.address,
        orderedItem: req.body.orderedItem,
        orderPrice:  price,
        orderDate: new Date,
        orderStatus: "RECEIVED"
    });
    
    try{
        const saveOrder = await ordersDetails.save();
        // console.log("ID = " + saveOrder._id);
        return res.redirect(`/?orderConfirmed=true&id=${saveOrder._id}#OrderTrackingSection`);
    }
    catch(err){
        console.log(err);
    }
});

app.post("/orderTrack", async (req,res)=>{
    const orderId = req.body.trackNumber;
    // console.log("order is " + orderId);

    try {
        const order = await orderModel.findById(orderId);
        // console.log("this is order" + order);
        if (order) {
            const orderStatus = "Order Status : " + order.orderStatus;
            // console.log("order status = " + orderStatus);
            return res.redirect(`/?orderStatus=${orderStatus}#OrderTrackingSection`);
        } else {
            return res.redirect(`/?orderStatus="order id "+ ${orderId} + " not found"+#OrderTrackingSection`);
        }
    } catch (err) {
        return res.redirect(`/?orderStatus=order id  ${orderId}  not found"+#OrderTrackingSection`);
    }
});

app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
});
