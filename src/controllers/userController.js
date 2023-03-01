const userModel = require('../models/userModel');
const validator = require('../validator/validator')

const jwt = require('jsonwebtoken')

//*********************---------------------CREATE USER ----------------------------------********************* //

const createUser = async function (req, res) {

    try {
        let body = req.body;

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "Data should be provide" });
        }
    
        if (!validator.isValidBody(body.name)) {
            return res.status(400).send({ status: false, message: "Enter Name first" });
        }

         // *************---------------- Phone && Email validation ----------------------********************* //
        
        if (!body.phone) {
            return res.status(400).send({ Status: false, message: " phone is required" })
        }
        if (!validator.isValidPhone(body.phone)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid phone number, please use 10 digit phone number " })
        }

        if (!body.email) {
            return res.status(400).send({ Status: false, message: " email is required" })
        }
        if (!validator.isValidEmail(body.email)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid email" })
        }

        let FinalEmail= body.email
        let changeEmail= FinalEmail.toLowerCase()  // changing capital word into lowercase

         //******------------------- Email and phone unique condition -------------------****** //

        let Checkuniquedata = await userModel.findOne({ $or: [{ email: changeEmail}, { phone: body.phone }] })
        if (Checkuniquedata) {
            if (Checkuniquedata.phone == body.phone) {
                return res.status(400).send({ Status: false, message: " This phone has been used already" })
            }
            if (Checkuniquedata.email === changeEmail) {
                return res.status(400).send({ Status: false, message: " This email has been used already" })
            }
        }
        // *****------------- Checking PassWord -----------------------------------*******//

        if (!body.password) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }
        if (!validator.isValidPass(body.password)) {
            return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        }
        
            let userCreate = await userModel.create(body)
            return res.status(201).send({ Status: true, message: 'Success', data: userCreate })   
    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}

//--------------------------------------------------USER LOGIN------------------------------------------------***//

const login = async function (req, res) {

    try {
        let body = req.body

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        //******------------------- Email validation -------------------****** //

        if (!body.email) {
            return res.status(400).send({ Status: false, message: " email is required" })
        }
        if (!validator.isValidEmail(body.email)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid email" })
        }
        let FinalEmail= body.email
        let changeEmail= FinalEmail.toLowerCase()  // changing capital word into lowercase

        //******------------------- password validation -------------------****** //

        if (!body.password) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }
        if (!validator.isValidPass(body.password)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        }

        //******------------------- checking User Detail -------------------****** //
    

        let CheckUser = await userModel.findOne({ email: changeEmail, password: body.password });

        if (!CheckUser) {
            return res.status(400).send({ Status: false, message: "username or the password is not correct" });
        }
        //******------------------- generating token for user -------------------****** //
        let user_token = jwt.sign({

            UserId: CheckUser._id,

        }, 'Mobiloitte', { expiresIn: '86400s' });    // token expiry in 24hrs

        res.setHeader("x-api-key", user_token);
        return res.status(201).send({ status: true, data: {token:user_token }});
    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        const requestBody = req.body
        console.log(requestBody)
        const userId = req.params.userId
        let newData = {}
console.log(userId)
        //---------------dB call for UserID check-----------------
        const userCheck = await userModel.findById(userId)
        
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "No user found by User Id given in path params" })
        }
        //-------------Destructuring--------------
        const { name, email, phone, password, confirmPassword } = requestBody
        //-----------validation-------------

        if(name){
            newData['name'] = name
        }

        if (validator.isValidBody(email)) {
            if (!validator.isValidEmail(email))
                return res.status(400).send({ status: false, message: "Please Enter a valid Email ID" })
            newData['email'] = email
        }
        if (validator.isValidBody(phone)) {
            if (!validator.isValidPhone(phone))
                return res.status(400).send({ status: false, message: "Please Enter a valid phone number" })
            newData['phone'] = phone
        }
        if (validator.isValidBody(password)) {
            if (!validator.isValidPass(password))
                return res.status(400).send({ status: false, message: "Please Enter a valid Password, would have min 8 and max 15 characters" })
                if(!confirmPassword){
                    return res.status(400).send({status: false, message: "Please confirm Password"})
                }
                if(confirmPassword !== password){
                    return res.status(400).send({status: false, message: "Password is not match"})
                }

            newData['password'] = password
        }

        //--------Authentication here-----------
     
        //---------Already Exixts for phone and email data --DB Check-----
        if ("email" in requestBody || "phone" in requestBody) {
            const doublicateCheck = await userModel.find({ $or: [{ email: email, phone: phone }] })
            if (doublicateCheck.length != 0)
                return res.status(400).send({ status: false, message: "Please Check wheather phone number and email Id already exists" })
        }
        //---------updation perform in DB-------------
        const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, newData, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: updatedUser })
    }
    catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
}



module.exports={createUser,login, updateUser}
