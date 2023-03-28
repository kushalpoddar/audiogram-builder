'use strict';
const createVideo = require("./index")
const {v4 : uuidv4} = require("uuid")
const THEMES = require("./themes.json")
// const {createServiceEvent, createServiceUserOnLogin, updateServiceUser} = require("../utils");
// const { getUser, getUserByUsername } = require('../utils/cognito');
// const { getUserFromOrgId } = require('../utils/user-db');

const handle = async event => {

    console.log({ event })

    // for (let i = 0; i < event.Records.length; i++) {
    //     const record = event.Records[i];
    //     const body = record.body
        // const body = JSON.parse(record.body);

        const { audio_url, srt_url, theme, theme_settings } = event

        const videoPath = await createVideo({
            audio_url, srt_url, id: uuidv4(), theme: {
                ...theme_settings,
                ...THEMES[theme]
            }
        })
    // }

    return { success : true, data : videoPath }
}

module.exports.handle = handle