const productModel = require("../models/productModel");
const { uploadFile } = require("../controller/awsController");

const {
  isValidbody,
  isValidName,
  isvalidObjectId,
  isValidPrice,
} = require("../validator/validate");

const createProduct = async function (req, res) {
  let data = req.body;
  let files = req.files;

  if (files && files.length > 0) {
    //upload to s3 and get the uploaded link
    // res.send the link back to frontend/postman
    let imageUrl = await uploadFile(files[0]);
    data.productImage = imageUrl;
  }
  if (!isValidbody(data)) {
    return res.status(400).send({ status: false, message: "Enter some data " });
  }
  let {
    title,
    description,
    price,
    currencyId,
    currencyFormat,
    isFreeShipping,
    style,
    availableSizes,
    installments,
  } = data;

  if (!title) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please enter title ,this is required ",
      });
  }
  let findTitle = await productModel.findOne({
    title: title,
    isDeleted: false,
  });
  if (findTitle) {
    return res
      .status(400)
      .send({ status: false, message: "Title already exist" });
  }

  if (!description) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please enter discription ,this is required ",
      });
  }
  if (!price) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please enter price ,this is required ",
      });
  }
  if (!isValidPrice(price)) {
    return res
      .status(400)
      .send({ status: false, message: "Enter valid price" });
  }
  if (!currencyId) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please enter currency Id,this is required ",
      });
  }
  if (currencyId != "INR") {
    return res
      .status(400)
      .send({
        status: false,
        message: " please enter currencyId in valid format",
      });
  }

  if (!currencyFormat) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please enter discription ,this is required ",
      });
  }
  if (currencyFormat !== "₹") {
    return res
      .status(400)
      .send({ status: false, message: " please enter valid  currencyformat" });
  }
  if (!availableSizes) {
    return res
      .status(400)
      .send({ status: false, message: " please enter at least one size" });
  }

  let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  for (let i = 0; i > availableSizes.length; i++) {
      if (!sizes.includes(availableSizes[i]))
          return res.status(400).send({ status: false, message: "availableSizes must be -[S, XS, M, X, L, XXL, XL]" })
  
    }
  if (!Number(installments)) {
    return res
      .status(400)
      .send({ status: false, message: "installment must be a number" });
  }
  data.availableSizes = availableSizes;
  let Product = await productModel.create(data);
  return res
    .status(201)
    .send({
      status: false,
      message: "product created successfully",
      data: Product,
    });
};




//-----------------------get product-------------------------------//

const getProduct = async (req,res)=> {
    try {

        const {name, size, priceGreaterThan, priceLessThan, priceSort} = req.query;

        const filter = {};

        filter.isDeleted = false;

        if(name){
            filter.title = { $regex: name, $options: 'i' };
        }

        if(size){
            filter.availableSizes = {$regex: size};
        }

        if(priceGreaterThan){
            filter.price = {$gt: priceGreaterThan};
        }

        if(priceLessThan){
            filter.price = {$lt: priceLessThan};
        }
        

        let sortAllValue = await productModel.find(filter).sort({ price: priceSort});

        const fetchData = await sortAllValue;
        
        if (!fetchData.length > 0) {
            return res.status(404).send({ status: false, msg: "No Product found" });
        }
      
        res.status(200).send({status: true, data: fetchData});

        
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }

}




module.exports.createProduct = createProduct;
module.exports.getProduct = getProduct;
