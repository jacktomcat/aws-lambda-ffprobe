var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static'),
    aws = require("aws-sdk");
 
 
var sqs = new aws.SQS({
    region: 'xxxx',
    accessKeyId: 'xxxx',
    secretAccessKey: 'xxxx',
   
    params: {
            QueueUrl:'https://xxxxxxx/xxxxxx/aws-lambda-ffprobe'
    }
});
 
exports.handler = handler;
 
function handler(event, context, callback) {
  
  var result = {};
  result.code = '400';
 
  //event.url='http://xxxxxxx/2015/12/24/FD2B3875000095B8.mp4'; 
  result.url = event.url;
  var url = event.url;
   
  console.log('being executed .....'+url);
  
  ffprobe(url, {path:ffprobeStatic.path},
        function (err, info) {
         if (err){
           //var e=done(err);
           console.log('---------------------'+err);
           result.error=err;
         }else{
            result.code='200';
            result.bitrate = info["format"]["bit_rate"];
            result.height = info["streams"][0]["height"];
            result.width=info["streams"][0]["width"];
            result.duration = info["format"]["duration"];
            result.size=info["format"]["size"];
         }
         var sqsParams = {
              MessageBody: JSON.stringify(result)
         };
 
         sqs.sendMessage(sqsParams, function(err, data) {
           if (err) {
             context.succeed(JSON.stringify({message:url+' send message is processed failed: '+err}));
           }else{
              context.succeed(JSON.stringify({message:url+' send message is processed successful!'}));
           }
        });
  });
}
