#!/bin/bash

# Change BUCKET_NAME to a bucket you own for use by CloudFormation
BUCKET_NAME=YOUR_S3_BUCKET
STACK_NAME=lambda-tag-ec2-with-vpc-name

aws cloudformation package \
    --template-file template.yaml \
    --s3-bucket $BUCKET_NAME \
    --output-template-file packaged-template.yaml

aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM