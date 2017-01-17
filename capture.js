var app = angular.module('licensePlate', []);

app.controller('licensePlateCtrl', function($scope, $http, $interval) {
 $scope.getCountry = 'us';

   $scope.options = [
        {
          name: 'USA',
          value: 'us'
        }, 
        {
          name: 'Europe',
          value: 'eu'
        }
    ];

    $scope.selectedOption = $scope.options[0];

 $scope.init =  function()
{
    if(navigator.webkitGetUserMedia)
    {
        navigator.webkitGetUserMedia({video:true}, onSuccess, onFail);
    }
    else
    {
        alert('webRTC not available');
    }
}

function onSuccess(stream)
{
    document.getElementById('camFeed').src = webkitURL.createObjectURL(stream);
}

function onFail()
{
    alert('could not connect stream');
}

$scope.takePhoto = function()
{
    var c = document.getElementById('image');
    var v = document.getElementById('camFeed');
    c.getContext('2d').drawImage(v, 0, 0, 320, 240);
    return false;
}

$scope.uploadPicture = function() {  
  // Generate the image data
  var pic = document.getElementById("image").toDataURL("image/png");
  var country = $scope.selectedOption.value;
  console.log("country selected", country);
 /*convert to blob*/
  var blob = dataURItoBlob(pic);
  var fileName = Math.random().toString(36).substring(7);
  /*convert to file*/
  var file = new File([blob], fileName+'.png', { type: 'image/png' });
  console.log("captured image file", file);
  var fd = new FormData();
  fd.append('image', file);

  var url = window.location.href;
  var arr = url.split("/");
  var baseUrl = arr[0] + "//" + arr[2];

  pic = pic.replace(/^data:image\/(png|jpg);base64,/, "");

  var uploadImgURL = baseUrl+"/upload?country="+country;
  var ky = {
      file:fd,
      cty:country
  }

  $http.post(uploadImgURL, fd, {transformRequest: angular.identity, headers: { 'Content-Type': undefined }})
    .success(function (data) {
        console.log("success file upload", data);
        var plt = data.plate.split('-')[1].trim();
        swal({
            title: "License Plate Number!",
            text: plt,
            timer: 4000,
            imageUrl: pic,
            showConfirmButton: true
        });
    }).
    error(function (error) {
        console.log("Error in file upload", error);
    });

  return false;
}


//converting blob to image file
function dataURItoBlob(dataURI) {
    //console.log("data URI " , dataURI);
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== 'string') {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

var idx = 0;
var filters = ['grayscale', 'sepia', 'blur', 'brightness', 'contrast', 'hue-rotate','hue-rotate2', 'hue-rotate3', 'saturate', 'invert', ''];

function changeFilter(e) {
  var el = e.target;
  el.className = '';
  var effect = filters[idx++ % filters.length]; // loop through filters.
  if (effect) {
    el.classList.add(effect);
  }
}

document.querySelector('video').addEventListener('click', changeFilter, false);

});