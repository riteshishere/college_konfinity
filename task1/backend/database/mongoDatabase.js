let mongoose = require('mongoose')
let validator = require('validator')

mongoose.connect("mongodb://localhost/userData", {useNewUrlParser: true});

mongoose.connection
    .once("open", () => { console.log("Connected to database");
    })
    .on("error", error => {
        console.log("Your Error", error);
    })

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    current_addr: {
        type: String,
        required: true
    },
    permanent_addr: {
        type: String,
        required: true
    },
    profile_pic: {
        type: String,
        required:true
    },
    edit: {
        type: Boolean,
        required: true
    }
})

let user = mongoose.model('User', userSchema);
module.exports = {
    users    : user
};