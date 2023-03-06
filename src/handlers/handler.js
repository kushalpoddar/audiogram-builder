'use strict';
const lumigo = require('@lumigo/tracer')({ token: process.env.LUMIGO_TOKEN })
const createVideo = require("./index")
const {v4 : uuidv4} = require("uuid")
// const {createServiceEvent, createServiceUserOnLogin, updateServiceUser} = require("../utils");
// const { getUser, getUserByUsername } = require('../utils/cognito');
// const { getUserFromOrgId } = require('../utils/user-db');

const handle = async event => {

    console.log({ event })

    // for (let i = 0; i < event.Records.length; i++) {
    //     const record = event.Records[i];
    //     const body = record.body
        // const body = JSON.parse(record.body);

        const { org_id, id, contentId, url, srt_url } = event

        const videoPath = await createVideo({
            org_id, integrationId : id, contentId, url, srt_url, id: uuidv4(), theme: {
                "width": 1080,
                "height": 1080,
                "framesPerSecond": 20,
                "maxDuration": 300,
                "samplesPerFrame": 128,
                "pattern": "wave",
                "waveTop": 600,
                "waveBottom": 700,
                "captionTop": 500,
                "captionFont": "300 52px 'Source Sans Pro'",
                "captionLineHeight": 40,
                "captionLineSpacing": 7,
                "captionLeft": 180,
                "captionRight": 900,
                "backgroundGradientColor1" : "#5A575E",
                "backgroundGradientColor2" : "#5B5E57",
                // "backgroundColor" : "#182229",
                // "logoImage": "logo.svg",
                "backgroundImage": "284mchopd5xlewggy9x.svg",
                "foregroundColor": "#fff",
                "captionColor": "#fff",
                "srt" : "SUBTITLE-8190f571-b272-45d8-8f1b-5488ad0cdaf4.srt",
                // "design" : {
                //     elements : [{
                //         boxWPerc : 0.5,
                //         boxHPerc : 0.5,
                //         boxXPerc : 0.075,
                //         boxYPerc : 0.075,
                //         type : "IMAGE",
                //         path : "image 13.png"
                //     },{
                //         boxWPerc : 0.2,
                //         boxHPerc : 0.2,
                //         boxXPerc : 0.7,
                //         boxYPerc : 0.075,
                //         type : "IMAGE",
                //         path : "image 7.png"
                //     }]
                // }
            },
            caption : "Hello from l2it"
        })
    // }

    return { success : true }
}

module.exports.handle = process.env.IS_OFFLINE ? handle : lumigo.trace(handle);