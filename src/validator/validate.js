const mongoose = require('mongoose')


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
}


//------------------------------- password regex ------------------------------------------//

// const isValidPassword = function (password) {
//     return (/^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/.test(password))
// }

const isValidPassword = function (password) {
    password = password.trim()
    if (password.length < 8 || password.length > 15) {
        return false
    } return true
}
//------------------------------- email regex --------------------------------------------//

const isVAlidEmail = function (email) {
    return (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/).test(email)
}

//------------------------------- phone regex --------------------------------------------//

const isValidPhone = function (phone) {
    return (/^[6789]\d{9}$/).test(phone)

}

// const isValidPincode = function (pincode) {
//     if (pincode.toString().length != 6) {
//         return false
//     } return true
// }

const isValidPincode =function (pincode) {
    return (/^[1-9][0-9]{5}$/).test(pincode)

}

const isValidbody = function (x) {
    return Object.keys(x).length > 0
}


module.exports = { isValidPassword,isVAlidEmail,isValidPhone,isValid ,isValidPincode,isValidbody}