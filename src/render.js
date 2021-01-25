
const {desktopCapturer , remote} = require('electron');
const {dialog ,Menu} = remote;
const {writeFile} = require('fs');


//Buttons 

const videoELement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick = getVideoSources;

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};


stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};


async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window','screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    )

    videoOptionsMenu.popup();

}

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source){
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio:false,
        video : {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    //Create a stream

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoELement.srcObject = stream;
    videoELement.play();

    const options = {mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    //Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailabe;
    mediaRecorder.onstop = handleStop;
}

//Captures all recorder chunks
function handleDataAvailabe(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}

async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const {filePath} = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    if (filePath) {
        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
      }
}