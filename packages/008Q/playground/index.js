const { transcript, vad, processAudio } = window.Q008;

const main = async () => {
  const audio = await processAudio({ input: "carrental.wav" });

  console.log(audio);
  console.log(await transcript({ audio }));
};

const main2 = async () => {
  const audio = await processAudio({ input: "carrental.wav" });

  const now = new Date();
  console.log("Running inference...");
  const probs = await vad({ audio });
  console.log(probs);
  console.log("Finished inference.", new Date() - now);
};

main();
main2();
