const productModel = require("../models/productModel");
const { uploadFile } = require("../controller/awsController");

const {
  isValidBody,
  isValidObjectId,
  isValidPrice,
  isValidSize,
  isValid,
} = require("../validator/validate");

//_______________________create product__________________________//

const createProduct = async function (req, res) {
  try {
    let requestBody = req.body;
    if (!isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Request body can not be empty" });
    }
    let files = req.files;

    if (files && files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman

      let validImage = files[0].mimetype.split("/");
      if (validImage[0] != "image") {
        return res
          .status(400)
          .send({ status: false, message: "Please Provide Valid Image.." });
      }
      let imageUrl = await uploadFile(files[0]);
      requestBody.productImage = imageUrl;
    }
    if (files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid product image" });
    }

    if (!isValidBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter some data " });
    }

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      availableSizes,
      installments,
      isFreeShipping,
    } = requestBody;

    if (!title) {
      return res.status(400).send({
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
      return res.status(400).send({
        status: false,
        message: "Please enter discription ,this is required ",
      });
    }

    if (!price) {
      return res.status(400).send({
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
      return res.status(400).send({
        status: false,
        message: "Please enter currency Id,this is required ",
      });
    }

    if (currencyId != "INR" && currencyId != "USD") {
      return res.status(400).send({
        status: false,
        message: " please enter currencyId in valid format",
      });
    }

    if (isFreeShipping) {
      if (isFreeShipping !== "true" && isFreeShipping !== "false") {
        return res.status(400).send({
          status: false,
          message: "isFreeShipping must be a boolean value",
        });
      }
    }

    if (!isValid(isFreeShipping)) {
      requestBody.isFreeShipping = false;
    }

    if (!currencyFormat) {
      requestBody.currencyFormat = "₹";
    }
    if (currencyFormat) {
      if (currencyFormat !== "₹") {
        return res.status(400).send({
          status: false,
          message: " please enter valid  currencyformat",
        });
      }
    }

    if (!availableSizes) {
      return res
        .status(400)
        .send({ status: false, message: " please enter at least one size" });
    }

    let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    availableSizes = availableSizes.split(",");
    for (let i = 0; i < availableSizes.length; i++) {
      if (!sizes.includes(availableSizes[i])) {
        return res.status(400).send({
          status: false,
          message: "availableSizes must be -[S, XS, M, X, L, XXL, XL]",
        });
      }
    }

    if (!Number(installments)) {
      return res
        .status(400)
        .send({ status: false, message: "installment must be a number" });
    }

    requestBody.availableSizes = availableSizes;
    let Product = await productModel.create(requestBody);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: Product });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

//_______________________get product__________________________//

const getProduct = async (req, res) => {
  try {
    const { name, size, priceGreaterThan, priceLessThan, priceSort } =
      req.query;

    const filter = {};

    filter.isDeleted = false;

    if (name) {
      filter.title = { $regex: name, $options: "i" };
    }

    if (size) {
      if (!isValidSize(size)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid size" });
      }
      filter.availableSizes = size;
    }

    if (priceGreaterThan) {
      if (!isValidPrice(priceGreaterThan)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid price" });
      }
      filter.price = { $gt: priceGreaterThan };
    }

    if (priceGreaterThan && priceLessThan) {
      if(!isValidPrice(priceGreaterThan && priceLessThan)){
        return res.status(400).send({status:false, message:"Please provide valid price"})
      }
      filter.price = {
        $gt: Number(priceGreaterThan),
        $lt: Number(priceLessThan),
      };
    }
    if (priceLessThan) {
      if (!isValidPrice(priceLessThan)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid price" });
      }
      filter.price = { $lt: priceLessThan };
    }

   

    if (priceSort) {
      if (priceSort != 1 && priceSort != -1) {
        return res.status(400).send({
          status: false,
          message: "Please enter price sort 1 or -1",
        });
      }
    }

    let sortAllValue = await productModel
    .find(filter)
    .sort({ price: priceSort });

    if(sortAllValue.length==0){
    return res
        .status(404)
        .send({ status: false, message: "No Product found" });
    }

    res
      .status(200)
      .send({ status: true, message: "Success", data: sortAllValue });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

//_____________________get product details by params____________________//

const getProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product id..." });
    }

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "Product Not Found..." });
    }

    return res
      .status(200)
      .send({ status: true, message: "Success", data: product });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//________________________update product______________________//

const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let files = req.files;
    let requestBody = req.body;
    if (!isValidBody(requestBody)&&files.length==0) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter some data to update" });
    }
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: " product id invalid" });
    }
    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!findProduct) {
      return res
        .status(404)
        .send({ status: false, message: " product not found" });
    }

    if (!isValidBody(requestBody) && files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Enter some data for update " });
    }

    let { title, price, isFreeShipping, availableSizes, installments } =
      requestBody;

    if (title) {
      let findTitle = await productModel.findOne({ title });
      if (findTitle)
        return res
          .status(400)
          .send({ status: false, message: "title already used" });
    }
    if (price) {
      if (!isValidPrice(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid price" });
      }
    }

    if (isFreeShipping) {
      if (isFreeShipping !== "true" && isFreeShipping !== "false") {
        return res.status(400).send({
          status: false,
          message: "isFreeShipping must be a boolean value",
        });
      }
    }
    if (availableSizes) {
      if (availableSizes.length == 0) {
        return res
          .status(400)
          .send({ status: false, message: "availableSizes cannot be empty" });
      }
      availableSizes = availableSizes.toUpperCase().split(",");

      for (let i = 0; i < availableSizes.length; i++) {
        if (
          !["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])
        ) {
          return res
            .status(400)
            .send({ status: false, message: `please enter valid size ` });
        }
      }
      let newArr = [...findProduct.availableSizes];
      for (let i = 0; i < availableSizes.length; i++) {
        if (!newArr.includes(availableSizes[i])) {
          newArr.push(availableSizes[i]);
        }
      }
      requestBody.availableSizes = newArr;
    }

    if (installments) {
      if (!Number(installments)) {
        return res
          .status(400)
          .send({ status: false, message: "installment must be a number" });
      }
    }

    if (files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      let imageUrl = await uploadFile(files[0]);
      requestBody.productImage = imageUrl;
    }

    let updatingData = await productModel.findByIdAndUpdate(
      { _id: productId },
      { $set: requestBody },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "update successful", data: updatingData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//________________________delete product_______________________//

const deleteProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product id..." });
    }

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "Product Not Found..." });
    }

    await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    return res
      .status(200)
      .send({ status: true, message: "Product successfully deleted" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProductById,
};
