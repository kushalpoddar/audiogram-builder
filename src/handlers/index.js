const path = require("path")
const { writeFileSync, readFileSync, unlinkSync, rmSync } = require("fs")
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
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

// Downloading file from s3 in media directory with name = id
const downloadFile = async (id, url, folder) => {
  const bucketMapping = {
    "audio" : process.env.AUDIO_BUCKET,
    "srt" : process.env.SRT_BUCKET
  }

  const params = {
    Bucket : bucketMapping[folder] ,
    Key: url
  }

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

  const videoKey = job.audio_url.replace(".mp3", ".mp4")
  const fullVideo = readFileSync(url)

  await s3.putObject({
    Bucket: process.env.VIDEO_BUCKET,
    Key: videoKey,
    Body: fullVideo
  }).promise();

  return videoKey

}

const render = async (job) => {

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

const createVideo = async (job) => {
  try {
    // Downloading the files from aws
    const [audioLocalPath, srtLocalPath] = await Promise.all([
      downloadFile(job.id, job.audio_url, "audio"),
      downloadFile(job.id, job.srt_url, "srt")
    ])
    
    job.theme.srtLocalPath = srtLocalPath

    // Creating a folder for storing theme image (png from svg), i.e., PNG image without captions & waveform
    const themeLocalPath = `${__dirname}/media/theme/${job.id}`
    mkdirp(themeLocalPath)

    // Creating the video and returning the local path
    const videoPath = await render(job)

    // Upload to s3
    const videoS3URL = await uploadFile(job, videoPath)

    // Remove all temporary files created
    unlinkSync(audioLocalPath)
    unlinkSync(srtLocalPath)
    unlinkSync(videoPath)
    rmSync(themeLocalPath, { recursive: true, force: true });

    return videoS3URL
  } catch (err) {
    throw new Error(err)
  }

}

module.exports = createVideo