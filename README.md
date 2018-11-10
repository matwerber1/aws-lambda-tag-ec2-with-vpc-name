# aws-lambda-tag-ec2-with-vpc-name

This NodeJS Lambda function adds a "vpcName" tag to each EC2 instance equal to the "Name" tag of the instance's corresponding VPC. The purpose is to make it easier to determine where your EC2 instances are running either through the console or when describing instances through APIs. 

# Infrastructure

This [AWS SAM](https://github.com/awslabs/serverless-application-model) project deploys a serverless function comprised of a Lambda that is triggered once every 24 hours by a CloudWatch Event to tag EC2 instances with their corresponding VPC name. The included CloudFormation template also creates an IAM role for the Lambda that allows the function to describe and tag EC2 instances. 

# Deployment

1. Clone the repository
  ```sh
  git clone https://github.com/matwerber1/aws-lambda-tag-ec2-with-vpc-name.git
  ```

2. Within ./deploy.sh, replace YOUR_S3_BUCKET with an existing S3 bucket to use for uploading packaged template to CloudFormation. 
  
  ```sh
  BUCKET_NAME=_YOUR_S3_BUCKET
  ```

3. OPTIONAL - within ./src/index.js, set config.debug to true to have the Lambda function output raw API responses to the function logs. 

4. Run deploy.sh

  ```sh
  ./deploy.sh
  ```
  
# Example Results

Here is an example of the output from the Lambda function: 

  ```
  2018-10-25T17:13:47.547Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-0cf89faa939d3b343 with VpcName tag = SandboxVPC
  2018-10-25T17:13:47.727Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-0a09edbdfb958036b with VpcName tag = SandboxVPC
  2018-10-25T17:13:47.883Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-0b65ad3e2e9285307 with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.033Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-02c54b27658bbb7df with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.162Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-0692ff4de87185f69 with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.322Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-030e06b1a18a30f60 with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.504Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-049d45e1532a1d2ef with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.674Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-049f03f1414aaebdb with VpcName tag = SandboxVPC
  2018-10-25T17:13:48.843Z	53b67926-d879-11e8-83ec-5b4b77722835	Tagged i-0c53f9fef9d4bda63 with VpcName tag = SandboxVPC
  ```

Here is an example of the effect that is visible from within the EC2 console: 

  ![EC2 Console Example](https://github.com/matwerber1/aws-lambda-tag-ec2-with-vpc-name/blob/master/images/ec2-console.png)