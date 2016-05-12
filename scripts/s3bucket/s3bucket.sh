#!/bin/bash
source params.sh

ECHO "<------ RUNNING S3 BUCKET SCRIPT ------>"

# Upload HTML to created bucket
aws s3api put-object --bucket $BUCKET_NAME --key index.html  --body resources/HTML/index.html 
aws s3api put-object --bucket $BUCKET_NAME --key error.html  --body resources/HTML/error.html

# Set access control list on HTML
aws s3api put-object-acl --bucket $BUCKET_NAME --key index.html \
--grant-read uri=http://acs.amazonaws.com/groups/global/AllUsers

aws s3api put-object-acl --bucket $BUCKET_NAME --key error.html \
--grant-read uri=http://acs.amazonaws.com/groups/global/AllUsers

ECHO "<------ S3 BUCKET SCRIPT COMPLETE ------>"