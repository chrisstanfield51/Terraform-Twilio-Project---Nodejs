var AWS = require('aws-sdk');
var ec2 = new AWS.EC2({
region: 'us-west-2'
});

const createResponse = function(response) {
    return response;
};

function getInstances(instance_state) {
    return new Promise((resolve) => {
            var instance_ids = []

            var params = {
                Filters: [
                {
                Name: 'tag:Name',
                Values: ['TestInstance']
                },
                {
                Name: 'instance-state-name',
                Values: [instance_state]
                }
                ] 
            };
        setTimeout(() => {
            ec2.describeInstances(params, function (err, data) {
                if (err) return console.error(err.message);
                var instance_ids = []

                for(let i = 0; i < data.Reservations.length; i++){
                    for(let j = 0; j < data.Reservations[i].Instances.length; j++){
                        console.log("INSTANCE: " + data.Reservations[i].Instances[j].InstanceId);
                        instance_ids.push(data.Reservations[i].Instances[j].InstanceId);
                    }
                }
                resolve(instance_ids)
            });
        }, 10)
    })
}

function change_state(instance_id, desired_state){
    if(desired_state == "Stop"){
        try{
            ec2.stopInstances({ InstanceIds: [instance_id] }).promise()
            console.log("Instance has stopped:" + instance_id)
        } catch (error) {
            console.error(error);
        };
    } else if(desired_state == "Start"){
        try{
            ec2.startInstances({ InstanceIds: [instance_id] }).promise()
            console.log("Instance has started:" + instance_id)
        } catch (error) {
            console.error(error);
        };
    } else {
        console.log("Unknown command")
    };
}

exports.handleTwilio = async function(event, context, callback) {
    let body = JSON.stringify(event.Body);
    console.log("Received an event: " + body);
    if(body.includes("Stop")){
        let instanceIDS = await getInstances('running');
        if (instanceIDS.length != 0){
            for(let i = 0; i < instanceIDS.length; i++){
                change_state(instanceIDS[i],"Stop");
                callback(null, createResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Response><Message><Body>Stopping instances!</Body></Message></Response>"));
            }
        }
        
    } else if (body.includes("Start")) {
        let instanceIDS = await getInstances('stopped');
        if (instanceIDS.length != 0){
            for(let i = 0; i < instanceIDS.length; i++){
                change_state(instanceIDS[i],"Start");
                callback(null, createResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Response><Message><Body>Starting instances!</Body></Message></Response>"));
            }
        }
    } else {
    callback(null, createResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Response><Message><Body>Command not recognized.  Try again.</Body></Message></Response>"));
    }
};