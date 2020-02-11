function copyAddress() {
    if (document.getElementById("addr").checked ===true){
        var x = document.getElementById("current_addr").value;
        document.getElementById("permanent_addr").value = x;
    }
    else{
        document.getElementById("permanent_addr").value = "";
    }
}



function uploadFile(file, signedRequest, url){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          document.getElementById('preview').src = url;
          document.getElementById('avatar-url').value = url;
        }
        else{
          alert('Could not upload file.');
        }
      }
    };
    xhr.send(file);
}
/*
Function to get the temporary signed request from the app.
If request successful, continue to upload the file using this signed
request.
*/
function getSignedRequest(file){
const xhr = new XMLHttpRequest();
xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
xhr.onreadystatechange = () => {
    if(xhr.readyState === 4){
    if(xhr.status === 200){
        const response = JSON.parse(xhr.responseText);
        uploadFile(file, response.signedRequest, response.url);
    }
    else{
        alert('Could not get signed URL.');
    }
    }
};
xhr.send();
}
/*
Function called when file input updated. If there is a file selected, then
start upload procedure by asking for a signed request from the app.
*/
function initUpload(){
const files = document.getElementById('profile_pic').files;
const file = files[0];
if(file == null){
    return alert('No file selected.');
}
getSignedRequest(file);
}
/*
Bind listeners when the page loads.
*/
(() => {
    document.getElementById('profile_pic').onchange = initUpload;
})();