const productModel = require("../models/productModel")
const { uploadFile } = require("../controller/awsController")

const { isValidbody, isValidName, isvalidObjectId, isValidPrice } = require("../validator/validate")


const createProduct = async function (req, res) {
    let data = req.body
    let files = req.files
    if (!files) {
        return res.status(400).send({ status: false, message: "product Image is mandatory " })
    }
    if (files && files.length > 0) {
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman
        let imageUrl = await uploadFile(files[0]);
        data.productImage = imageUrl;
    }
    if (!isValidbody(data)) {
        return res.status(400).send({ status: false, message: "Enter some data " })
    }
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes,installments } = data


    if (!title) {
        return res.status(400).send({ status: false, message: "Please enter title ,this is required " })
    }
    let findTitle = await productModel.findOne({ title: title, isDeleted: false })
    if (findTitle) {
        return res.status(400).send({ status: false, message: "Title already exist" })
    }

    if (!description) {
        return res.status(400).send({ status: false, message: "Please enter discription ,this is required " })
    }
    if (!price) {
        return res.status(400).send({ status: false, message: "Please enter price ,this is required " })
    }
    if (!isValidPrice(price)) {
        return res.status(400).send({ status: false, message: "Enter valid price" })
    }
    if (!currencyId) {
        return res.status(400).send({ status: false, message: "Please enter currency Id,this is required " })
    }
    console.log(currencyId,price,title)
    if (currencyId != "INR") {
        return res.status(400).send({ status: false, message: " please enter currencyId in valid format" })
    }

    if (!currencyFormat) {
        return res.status(400).send({ status: false, message: "Please enter discription ,this is required " })
    }
    if (currencyFormat !== "₹") {
        return res.status(400).send({ status: false, message: " please enter valid  currencyformat" })
    }
    if (!availableSizes) {
        return res.status(400).send({ status: false, message: " please enter at least one size" })
    }
    availableSizes=availableSizes.split(",")
        console.log(availableSizes)
       for(let i=0 ;i<availableSizes.length;i++){
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) {
            return res.status(400).send({ status: false, message: `please enter valid size ` })
        }
       }
    
    if (!Number(installments)) {
        return res.status(400).send({ status: false, message: "installment must be a number" })
    }
    console.log(data)
data.availableSizes=availableSizes
    let Product = await productModel.create(data)
    return res.status(201).send({ status: false, message: "product created successfully", data: Product })

}

module.exports.createProduct = createProduct







