const AWS   = require('aws-sdk');
const ec2   = new AWS.EC2();

const config = {
  debug:          false,                                                         // print additional info to logs
  dryRunApiCalls: false,                                                        // if true, changes will not be made to AWS resources
  ec2StateCodes: ["0", "16", "64", "80"]                                        // which instance states are in-scope to this function? 0 = pending, 16 = running, 64 = stopping, 80 = stopped
  
};
//##############################################################################
exports.handler = async (event, context) => {

  try {
    
    let vpcNames  = await describeTags('vpc', ['Name']);
    
    let instances = await getEc2Instances(config.ec2StateCodes);

    for (const i of instances) {
  
      if (i.VpcId !== undefined)                                                // confirm EC2 is running inside a VPC
      {
        let tagKey   = 'vpcName';
        let tagValue = undefined;
        
        if (vpcNames[i.VpcId]['Name'] !== undefined) {                          // confirm VPC has a Name tag
          tagValue = vpcNames[i.VpcId]['Name'];
        }
        else {
          tagValue = "<VPC not named>";
        }
    
        await addTagToInstance(i.InstanceId, tagKey, tagValue);
        console.log(`Tagged ${i.InstanceId} with VpcName tag = ${tagValue}`);               
      }
      else {
        console.log(`Instance ${i.InstanceId} not in VPC; skipping tag process.`);
      }

    }
  }
  catch (err) {
    console.log("ERROR: " + err);
  }
};

//##############################################################################
async function addTagToInstance(instanceId, key, value) {
  
  //instanceId = string containing ec2 instance ID (e.g. "i-02c54b27658bbb7df");
  
  let params = { 
      Resources: [instanceId], 
      Tags: [
        {
          Key: key,
          Value: value
        }
      ]
  };
  
  debugMessage(`Calling ec2.createTags(${JSON.stringify(params)})`);
  let response = await ec2.createTags(params).promise();
  debugMessage(`ec2.createTags() response: ${JSON.stringify(response,null,2)}`);
  
  return;
}


//##############################################################################
async function describeTags(resourceType, tagKeys) {
  
  /* resourceType should be string containing one of the following values:
        ( customer-gateway | dhcp-options | elastic-ip | fleet | fpga-image | 
          image | instance | internet-gateway | launch-template | natgateway | 
          network-acl | network-interface | reserved-instances | route-table | 
          security-group | snapshot | spot-instances-request | subnet | volume |
          vpc | vpc-peering-connection | vpn-connection | vpn-gateway)
          
  // tagKeys      = array of tag key[s] to return.
  */
  
  if (tagKeys === undefined) {
    tagKeys = ['*'];                                                            // if no tagKey specified, return all keys
  }
  
  let params = {
    Filters: [
      {
        Name: 'resource-type',
        Values: [resourceType]
      },
      {
        Name: 'key',
        Values: tagKeys
      }
    ],
  };
  
  
  let  responses = {};  
  /* we will build the responses object to look like this: 
      {
        "i-02c54b27658bbb7df": {
          [
            tag1: value1,
            tag2: value2,
            ...
          ]
        },
        
        "i-02c54b2349038429": {
          ....
        }
      }
  */
  do {
    
    debugMessage(`Calling ec2.describeTags(${JSON.stringify(params)})`);
    let response = await ec2.describeTags(params).promise();
    debugMessage(`ec2.describeTags() response:\n${JSON.stringify(response,null,2)}`);
    
    for (const tag of response.Tags) {
      
      if (responses[tag.ResourceId] === undefined) {                            // if encountering a resourceId for the first time, add it to our responses object
        responses[tag.ResourceId] = {};
      }
      
      responses[tag.ResourceId][tag.Key] = tag.Value;
    }
    
  } while (params.NextToken !== undefined);
  
  debugMessage(`Resulting tags object returned by describeTags():\n${JSON.stringify(responses)}`);
  
  return responses;
  
}

//##############################################################################
function debugMessage(message) {
  if (config.debug) {
    console.log(message);
  }
}

//##############################################################################
async function getEc2Instances(stateCodes) {
  
  let instances = [];
  
  let params = {
      Filters: [
        { Name: "instance-state-code", Values: stateCodes}
      ]
    };
  
  do {
    
    debugMessage(`Calling ec2.describeInstances(${JSON.stringify(params)})`);
    let response   = await ec2.describeInstances(params).promise();
    debugMessage(`ec2.describeInstances() response:\n${JSON.stringify(response,null,2)}`);
    
    for (const r of response.Reservations) {
      for (const i of r.Instances) {
        instances.push(i);
      }
    }

    params.NextToken = response.NextToken || undefined;

  } while (params.NextToken !== undefined);
  
  return instances;
  
}