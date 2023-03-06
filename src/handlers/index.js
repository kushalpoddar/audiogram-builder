const path = require("path")
const { writeFileSync, readFileSync, unlinkSync } = require("fs")
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { DocumentClient: docClient } = require('./utils/ddb');
// Require settings first, for validation
require("./lib/settings/");

const mkdirp = require("mkdirp");
const Audiogram = require("./audiogram/");

// Can only register fonts once, double-registering throws an error
require("./lib/register-fonts.js");

const isFileInS3 = async (params) => {

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    console.log(error);
    return false
  }

}

const downloadFile = async (id, url, folder) => {
  const Bucket = (folder == "audio") ? process.env.AUDIO_BUCKET : process.env.TEMP_AUDIO_BUCKET
  
  const params = {
    Bucket,
    Key: url
  }

  console.log(params)

  if (!(await isFileInS3(params))) {
    throw new Error(`${url} doesnt exists`)
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) reject(err);

      const filePath = `${__dirname}/media/${folder}/${id}`

      writeFileSync(filePath, data.Body);

      resolve(filePath)
    })
  })
}

const uploadFile = async (job, url) => {

  const videoKey = job.url.replace(".mp3", ".mp4")
  const fullVideo = readFileSync(url)

  await s3.putObject({
    Bucket: process.env.AUDIO_BUCKET,
    Key: videoKey,
    Body: fullVideo
  }).promise();

  return videoKey

}

const render = async (job) => {

  // Creating a directory
  // const k = path.join(__dirname, "media", "audio", job.id)
  // mkdirp(k)

  const audiogram = new Audiogram(job);

  return new Promise((resolve, reject) => {
    audiogram.render(function (err) {
      if (err) {
        reject(err)
      }

      resolve(`${__dirname}/media/video/${job.id}.mp4`)
    });
  })
}

const updateContent = async (integrationId, contentId, video_url) => {
  const timestamp = new Date().toISOString()

  await docClient.update({
    TableName: process.env.CORE_TABLE,
    Key: {
      PK: 'INTEGRATION#' + integrationId,
      SK: 'CONTENT#' + contentId
    },
    UpdateExpression: 'set video_url = :video_url, updated_at = :updated_at',
    ExpressionAttributeValues: {
      ':video_url': video_url,
      ':updated_at': timestamp,
    }
  }).promise();

}

const createVideo = async (job) => {
  try {
    // Downloading the files from aws
    const audioLocalPath = await downloadFile(job.id, job.url, "audio")

    const srtLocalPath = await downloadFile(job.id, job.srt_url, "srt")

    job.theme.srtLocalPath = srtLocalPath

    // Creating the video and returning the local path
    const videoPath = await render(job)

    // Upload to s3
    const videoS3URL = await uploadFile(job, videoPath)

    // Update content db
    await updateContent(job.integrationId, job.contentId, videoS3URL)

    // Remove all temporary files created
    unlinkSync(audioLocalPath)
    // unlinkSync(videoPath)

    return videoPath
  } catch (err) {
    throw new Error(err)
  }

}

module.exports = createVideo