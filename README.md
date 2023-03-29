
# Audiogram-Serverless

Audiogram-Serverless is a ready-to-use serverless lambda for creating shareable audiograms from your voice and srt files. It is inspired by https://github.com/nypublicradio/audiogram. Once deployed to AWS Lambda, this:
* Can generate audiograms in MP4 format from an audio and srt file in AWS s3
* Upload the video file in a video bucket (specified in .env) and return the path
* Can be customized with various themes, fonts and wave patterns


## 🖥️Run & Test Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd audiogram-serverless
```

Install dependencies

```bash
  npm install
```

Create a file .env at the root of the project and fill the variables with your own values

```bash
AUDIO_BUCKET="bucket name having audio file"
SRT_BUCKET="bucket name having srt file"
VIDEO_BUCKET="bucket name where video should be uploaded"
```

Edit test_event.json 

```bash
{
    "theme": "rectangle_ceo",
    "audio_url": "audio.mp3",
    "srt_url": "srt.srt",
    "theme_settings": {
        "framesPerSecond": 10,
        "pattern": "wave",
        "foregroundColor": "#000",
        "captionColor": "#000",
        "backgroundColor" : "#f0f"
    }
}
```

Invoke Lambda Locally

```bash
  sls invoke local --function handle --path test_event.json
```


## 📖Prerequisites

In order to run the project, we should be having node `node>=16` and `serverless>=3^`

## 🚀Production Deployment

To deploy this project on AWS Lambda service run

```bash
  sls deploy 
```


## 📦Customizing Audiogram

#### Themes
Serverless-Audiogram provides option to customize themes. Themes can be customized and the list is located at src/handlers/themes.json. Each theme comes with an svg document located at src/handlers/settings/backgrounds.

#### Theme Description
__samplesPerFrame__: Samples per frame of video (Used for processing),

__waveTop__: Distance in pixels from top for wave y-start

__waveBottom__: Distance in pixels from top for wave y-end

__captionTop__: Distance in pixels from top for caption y-start

__captionFont__: Caption Font

__captionLineHeight__: Line Height for the caption/subtitle text

__captionLineSpacing__: Spacing between two lines for captions/subtitles

__captionLeft__: Distance in pixels from left for subtitles start point

__captionRight__: Distance in pixels from left for subtitles end point

__backgroundImage__: SVG file name for audiogram theme template

#### 🤝 Contributing

#### ⚖️ LICENSE