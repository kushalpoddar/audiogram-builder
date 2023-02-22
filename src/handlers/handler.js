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

        const { org_id, id, contentId, url } = event

        const videoPath = await createVideo({
            org_id, integrationId : id, contentId, url, id: uuidv4(), theme: {
                "width": 1280,
                "height": 720,
                "framesPerSecond": 20,
                "maxDuration": 300,
                "samplesPerFrame": 128,
                "pattern": "wave",
                "waveTop": 150,
                "waveBottom": 420,
                "captionTop": 470,
                "captionFont": "300 52px 'Source Sans Pro'",
                "captionLineHeight": 52,
                "captionLineSpacing": 7,
                "captionLeft": 200,
                "captionRight": 1080
            }
        })
    // }

    return { success : true }
}

module.exports.handle = process.env.IS_OFFLINE ? handle : lumigo.trace(handle);