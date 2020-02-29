const {GoogleSpreadsheet} = require("google-spreadsheet");
const cred = require("./client_secret.json");
const AWS = require("aws-sdk");
const dbConn = require("../database/mongoDatabase.js");
const db_users = dbConn.users;
// const s3 = new aws.S3();
// process.env.AWS_ACCESS_KEY_ID = "AKIAILZRN2J4PZXNOUDQ";
// process.env.AWS_SECRET_ACCESS_KEY = "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";
// myConfig = new aws.Config();
// myConfig.update({
//   region: 'ap-south-1'
// });


//////////////////////////////////////////////////////////////////////////////////
////// For resume submission in S3 then inserted in googlesheet///////////////////
//////////////////////////////////////////////////////////////////////////////////
AWS.config.region = 'ap-south-1'; // Region
AWS.config.apiVersions = {
    s3: 'latest'
};
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-south-1:0b6fa64b-9335-49a4-811d-0c8d065b15d2',
});
s3 = new AWS.S3(AWS.config);

let nework = async(req, res) =>{
  console.log("Started nework");
  const {firstName, lastName, email, phone, gender} = req.body;
  console.log("File details are\n", req.files);
  if(!(firstName && lastName && email && phone && gender)){
    console.log("Fill all required details")
    res.redirect("/nework");
  }else if(req.files.resume){
    const date = new Date();
    let params = {Bucket: 'konfinity/resume', 
                        Key: (date+email+".pdf"), 
                        Body: req.files.resume.data,
                        ACL: "public-read-write",
                        StorageClass: "STANDARD"
        };
        s3.upload(params,async function(err, data) {
            if(err){
                console.log("Errorn in S3 upload ", err);
                res.redirect("/nework");
            }
            else{
                console.log(data.Location)
                const doc = new GoogleSpreadsheet("1tf2mfuRLh1N-cERelPFzbGxkKmhz3dPdL_rR7KhpV8M");
                await doc.useServiceAccountAuth(cred);
                await doc.loadInfo(); // loads sheets
                const sheet = doc.sheetsByIndex[0]; // the first sheet
                
                // add new row, returns a GoogleSpreadsheetRow object
                const sundar = await sheet.addRow({ first_name: firstName, last_name: lastName,email: email, phone: phone, gender: gender, resume: data.Location });
                console.log("Data uploaded to worksheet",sundar);
                res.redirect("/nework");
            }
        });
  }else{
    console.log("Didn't get resume file from form\n");
    res.redirect("/nework");
  }
}
//////////////////////////////////////////////////////////////////////////////////
////// Resume submission in S3 then inserted in googlesheet Ends here/////////////
//////////////////////////////////////////////////////////////////////////////////

// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'riteshraj/images',
//     acl : 'public-read-write',
//     metadata: function (req, file, cb) {
//       cb(null, {fieldName: "TESTING_METADATA"});
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     }
//   })
// })
// app.use(multer({dest:'./uploads/'}));
// const singleUpload = upload.single("profile_pic");

async function register(req,res){
  console.log("start registering");
  const { 
      user_name,
      college,
      branch,
      gender,
      dob,
      phone,
      email,
      current_addr,
      permanent_addr
  } = req.body ;
  console.log("files details are",req.files);
  if(!(user_name && college && branch && gender && dob && phone && email && current_addr && permanent_addr)){
    res.redirect("/signup");
  }
  // ending of if block
  else{
    var params = {Bucket: 'riteshraj/image', 
                Key: email, 
                Body: req.files.profile_pic.data,
                ACL: "public-read-write",
                StorageClass: "STANDARD"};
    s3.upload(params, function(err, data) {
      if(err){
        console.log(err);
      }
      else{
        console.log("data uploaded are", data.Location);
        uploading(data.Location);
      }
    });
    function uploading(address){
      db_users.create({
        name            : user_name,
        email           : email,
        college         : college,
        branch          : branch,
        gender          : gender,
        dob             : dob,
        phone           : phone,
        email           : email,
        current_addr    : current_addr,
        permanent_addr  : permanent_addr,
        profile_pic     : address,
        edit            : false
      },function (err, user) {
          if (err){
            console.log(err);
            res.redirect("/signup");
          }
          else{
            console.log("new user detail ",user);
            console.log("new user name is",user.name);
            res.redirect("/");
          }
        }
      );
    }
  }                                    // ending of else block
};

async function del(req,res)  {
  const { id } = req.body;
  const response = await db_users.deleteOne({ _id : id });
  if(response.n){
    console.log("User deleted");
    res.redirect("/");
  }
  else{
    console.log("Error in deleting user");
    res.redirect("/");
  }
  // db_users.deleteOne({ id : id}, function (err, result){
  //   if(err){
  //     console.log("Error in deleting user",err);
  //     res.redirect("/");
  //   }
  //   else{
  //     console.log("User info deleted",result);
  //     res.redirect("/");
  //   }
  // })
};

// let del = (req,res) => {
//     const { id  } = req.body  ;
//     db_users.destroy({
//         where: {
//         id: id
//         }
//     })
//     .then(() => {
//         console.log("User deleted");
//         res.redirect("/");
//     })
//     .catch(err => {
//       console.log("Error in deleting user",err);
//       res.redirect("/");
//     });
// };

async function edit(req,res){
  const id = req.param('id');
  console.log("id for editing is>>>>>", id);
  const response = await db_users.update({ _id: id }, { edit: true });
  if(response.nModified === 1){
    console.log("user edit set => True");
    res.redirect("/");
  }
  else{
    console.log("Error in setting edit => True");
    res.redirect("/");
  }
  // db_users.update({ id: id }, { edit: true }, function (err, op){
  //   if(err){
  //     console.log("Error in setting edit => True");
  //     res.redirect("/");
  //   }
  //   else{
  //     console.log("user edit set => True",op);
  //     res.redirect("/");
  //   }
  // })
}

// let edit = (req,res) => {
//   const {id} = req.body;
//   console.log("id is", id);
//   db_users.update(
//     {edit:  true},{
//       where :{
//         id : id
//       }
//     }
//   )
//   .then(user => {
//     console.log("user edit set => True",user.id);
//     res.redirect("/");
//   })
//   .catch(err => {
//     console.log("Error in setting edit => True", err);
//     res.redirect("/");
//   });
// }

async function update(req,res){
  const { 
    user_name,
    college,
    branch,
    gender,
    dob,
    phone,
    email,
    current_addr,
    permanent_addr,
    pic_url
  } = req.body ;
  console.log("files details are",req.files);
  const id = req.param('id');
  // working pic uploading lines
  // fetching credentials
  // 
  // aws.config.getCredentials(function(err) {
  //   if (err) console.log(err.stack);
  //   // credentials not loaded
  //   else {
  //     console.log("Access key:", aws.config.credentials.accessKeyId);
  //     console.log("Secret access key:", aws.config.credentials.secretAccessKey);
  //   }
  // });
  if(req.files){
    var params = {Bucket: 'riteshraj/image', 
                  Key: email, 
                  Body: req.files.profile_pic.data,
                  ACL: "public-read-write",
                  StorageClass: "STANDARD"};
    s3.upload(params, function(err, data) {
      if(err){
        console.log(err);
      }
      else{
        console.log("data uploaded are", data);
        uploading(data.Location);
      }
    });
  }
  else{
    console.log("no file to be uploaded");
    uploading(pic_url);
  }
  async function uploading(address){
    const response = await db_users.update({ _id : id }, {
      name            : user_name,
      email           : email,
      college         : college,
      branch          : branch,
      gender          : gender,
      dob             : dob,
      phone           : phone,
      email           : email,
      current_addr    : current_addr,
      permanent_addr  : permanent_addr,
      profile_pic     : address,
      edit            : false
    });
    if(response.nModified === 1){
      console.log("user updated successfully");
      res.redirect("/");
    }
    else{
      console.log("Error in updating user",response);
      res.redirect("/");
    }
  }
    // const response = await db_users.update({ _id : id }, {
    //   name            : user_name,
    //   email           : email,
    //   college         : college,
    //   branch          : branch,
    //   gender          : gender,
    //   dob             : dob,
    //   phone           : phone,
    //   email           : email,
    //   current_addr    : current_addr,
    //   permanent_addr  : permanent_addr,
    //   // profile_pic     : address,
    //   edit            : false
    // });
    // if(response.nModified === 1){
    //   console.log("user updated successfully");
    //   res.redirect("/");
    // }
    // else{
    //   console.log("Error in updating user",response);
    //   res.redirect("/");
    // }
    // db_users.update({ id : id }, {
    //   name            : user_name,
    //   email           : email,
    //   college         : college,
    //   branch          : branch,
    //   gender          : gender,
    //   dob             : dob,
    //   phone           : phone,
    //   email           : email,
    //   current_addr    : current_addr,
    //   permanent_addr  : permanent_addr,
    //   edit            : false
    //   }, function(err, op){
    //     if(err){
    //       console.log("Error in undating user",err);
    //       res.redirect("/");
    //     }
    //     else{
    //       console.log("user updated successfully",op);
    //       res.redirect("/");
    //     }
    //   });
  // }
}

// let update = (req,res) => {
//   console.log("updating start...........");
//   const { 
//     user_name,
//     college,
//     branch,
//     gender,
//     dob,
//     phone,
//     email,
//     current_addr,
//     permanent_addr,
//     id
//   } = req.body ;
//   if(!(user_name && college && branch && gender && dob && phone && email && current_addr && permanent_addr && id)){
//     res.redirect("/");
//   }
//   else{
//     db_users.update(
//       {
//         name            : user_name,
//         email           : email,
//         college         : college,
//         branch          : branch,
//         gender          : gender,
//         dob             : dob,
//         phone           : phone,
//         email           : email,
//         current_addr    : current_addr,
//         permanent_addr  : permanent_addr,
//         edit            : false
//       },
//       { where : { id : id }  }
//     )
//     .then(() => {
//       console.log("User successfully updated");
//       res.redirect("/");
//     })
//     .catch(err => {
//       console.log("Error in updating User Data",err);
//       res.redirect("/");
//     })
//   }
// }


let test = async(req,res) =>{
  let {value} = req.body;
  console.log("From backend ",value);
}

module.exports = {
    register      : register,
    delete        : del,
    edit          : edit,
    update        : update,
    test          : test,
    nework        : nework
}