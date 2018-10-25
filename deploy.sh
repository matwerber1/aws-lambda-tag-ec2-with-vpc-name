aws cloudformation package \
    --template-file template.yaml \
    --s3-bucket YOUR_S3_BUCKET \
    --output-template-file packaged-template.yaml

aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --stack-name lambda-tag-ec2-with-vpc-name \
    --capabilities CAPABILITY_IAM