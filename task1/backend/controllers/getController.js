const path = require("path");
const dbConn = require("../database/mongoDatabase.js");
const db_users = dbConn.users;

let users = (req,res) =>{
    db_users.find()
        .then(list =>{
            res.render("users",{
                users: list
            })
        })
        .catch(err => {
            console.log("Users list cann't be find",err);
            res.render("users");
        });
};

// async function users(req,res){
//     const arr = await db_users.find();
//     if(arr.length>0){
//         console.log("users list is <<<<<<>>>>>>>>",arr);
//         res.render("users",{
//             users: arr
//         });
//     }
//     else{
//         console.log("users list couldn't be found");
//         res.render("users",{});
//     }
// }

let register = (req,res) => {
    res.render("newregister");
}

module.exports = {
    users : users,
    register: register
};