const AWS = require('aws-sdk');

module.exports = {
    IAM_USER_KEY: 'AKIAVXXZKK6XB7YSSA5F',
    IAM_USER_SECRET: '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',
    BUCKET_NAME: 'marca-aqui-dev',
    AWS_REGION: 'sa-east-1',

    uploadToS3: function (file, filename, acl = 'public-read') {




        return new Promise((resolve, reject) => {
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3bucket = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                Bucket: BUCKET_NAME
            })

            s3bucket.createBucket(function () {
                var params = {
                    Bucket: BUCKET_NAME,
                    Key: filename,
                    Body: file.Body,
                    ACL: acl
                };



                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        return resolve({ error: true, message: err.message });
                    }
                    return resolve({ error: false, message: data });
                });
            });
        });
    },

    deleteFileS3: function (key) {
        return new Promise((resolve, reject) => {
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3bucket = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                Bucket: BUCKET_NAME
            })
            s3bucket.createBucket(function () {
                s3bucket.deleteObject({
                    Bucket: BUCKET_NAME,
                    Key: key
                }, function (err, data) {
                    if (err) {
                        return resolve({ error: true, message: err.message });
                    }
                    return resolve({ error: false, message: data });
                })
            })

        });
    }
}