var s3 = require('s3-client');

var client = s3.createClient({
  s3Options: {
    accessKeyId: "23KK5HLPBI2EXPHMEK6O",
    secretAccessKey: "dEvJfi5NBVYPKfpmmDKg0AmwNO+0ije5FvHj+GUgwsM",
    endpoint: 'sfo2.digitaloceanspaces.com'
  }
});

var params = {
  localFile: "dist/main.js",
  s3Params: {
    Bucket: "psalguero",
    Key: "bio/wc-bio/v1/main.js",
  },
};
var uploader = client.uploadFile(params);
uploader.on('error', function(err) {
  console.error("unable to upload:", err.stack);
});
uploader.on('progress', function() {
  console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
  console.log("Deploy successful process");
});
