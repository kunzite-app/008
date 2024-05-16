const { transcript, processAudio, summarize } = window.Q008;

/*
const { vad } = window.Q008;

const main2 = async () => {
  const { audio } = await processAudio({ input: "carrental.wav" });

  const now = new Date();
  console.log("Running inference...");
  const probs = await vad({ audio });
  console.log(probs);
  console.log("Finished inference.", new Date() - now);
};
// main2();
*/

const transcribe = async ({ audio }) => {
  const transcriptElem = document.getElementById("transcript");
  const summaElem = document.getElementById("summa");

  const { wav } = await processAudio({ input: audio });
  transcriptElem.innerHTML = "Transcribing...";
  let onInitProgress = (report) => {
    const { progress } = report;
    transcriptElem.innerHTML = `Transcribing... <br/>Loading model (only the first time) ${Math.floor(
      progress * 100
    )}%`;
  };
  const transcription = await transcript({ wav, onInitProgress });

  let transcript_ = "";
  transcription.forEach(({ text }) => {
    transcript_ += `${text}<br/>`;
  });
  transcriptElem.innerHTML = transcript_;

  summaElem.innerHTML = "Summarizing...";
  onInitProgress = (report) => {
    const { progress } = report;
    summaElem.innerHTML = `Summarizing... <br/>Loading model (only the first time) ${Math.floor(
      progress * 100
    )}%`;
  };

  const summa = await summarize({ transcription, onInitProgress });
  summaElem.innerHTML = summa;
};

document.getElementById("audioFile").addEventListener(
  "change",
  async (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = url;
  },
  false
);

document.getElementById("transcribeBtn").addEventListener("click", async () => {
  await transcribe({ audio: document.getElementById("audioPlayer").src });
});
