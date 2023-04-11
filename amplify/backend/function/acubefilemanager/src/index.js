

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');


AWS.config.update({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION
});

const s3 = new AWS.S3();

var environment = process.env.ENV;


const getListOfKyes = async (params) => {
  console.log(`I am successfully called: ${JSON.stringify(params)}`);
  const s3Params = {
    Bucket:   params.bucket, 
    Prefix: params.prefix,
  };
  const response = await s3.listObjectsV2(s3Params).promise();
  const s3Keys = response.Contents.map(file => file.Key);
  return s3Keys;
}

const Resolvers = {
  Query: {
    getSignedUrl: async (params) => {
      console.log(`I am successfully called: ${JSON.stringify(params)}`);
      const s3Params = {
        Bucket:   params.bucket, 
        Key: params.key,
        Expires: 60*60
      };
      const signedUrl = await s3.getSignedUrlPromise('getObject', s3Params);
      return { signedUrl: signedUrl }
    },
    getListS3KeysFromPrefix: async (params) => {
      const s3Keys = await getListOfKyes(params);
      return { s3Keys: s3Keys }
    },
  },
  Mutation: {
    s3DeleteObject: async (params) => {
      try {
        await s3
          .deleteObject({
            Bucket: params.bucket,
            Key: params.key,
          })
          .promise();
        return {
          message: "Object Deleted Successfully",
        };
      } catch (e) {
        console.error(`error executing s3DeleteObject: ${e.message}`);
        throw new Error(`error executing s3DeleteObject: ${e.message}`);
      }
    },
    s3DeleteObjectByPrefix: async (params) => {
      try {
        const s3Keys = await getListOfKyes(params);

        if (s3Keys.length === 0) {
          return {
            message: "No Objects Found",
          };
        }
        const deleteParams = {
          Bucket: params.bucket,
          Delete: { Objects: [] },
        };

        s3Keys.forEach((key) => {
          deleteParams.Delete.Objects.push({ Key: key });
        });
        console.log(deleteParams);

        await s3.deleteObjects(deleteParams).promise();
        return {
          message: "Objects Deleted Successfully",
        };
      } catch (e) {
        console.error(`error executing s3DeleteObjectByPrefix: ${e.message}`);
        throw new Error(`error executing s3DeleteObjectByPrefix: ${e.message}`);
      }
    }
  }
};

exports.handler = async (event) => {
  const typeResolver = Resolvers[event.typeName];
  if (typeResolver) {
    const fieldResolver = typeResolver[event.fieldName];
    if (fieldResolver) {
      return await fieldResolver(event.arguments);
    } else {
      console.error(`no field resolver found for [${event.fieldName}]`);
    }
  } else {
    console.error(`no type resolver found for [${event.typeName}]`);
  }

};
