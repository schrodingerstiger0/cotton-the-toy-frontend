const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const statusText = document.getElementById("status");

let mediaRecorder;
let audioChunks = [];

recordButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
  audioChunks = [];
  statusText.textContent = "🎙️ Recording...";

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  stopButton.disabled = false;
  recordButton.disabled = true;
};

stopButton.onclick = async () => {
  mediaRecorder.stop();
  statusText.textContent = "⏳ Processing...";

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch("https://kotton-the-toy0-1.onrender.com/process", {
      method: "POST",
      body: formData
    });

    const audioData = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = await audioContext.decodeAudioData(audioData);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);

    statusText.textContent = "✅ Done! Ready to record again.";
    recordButton.disabled = false;
    stopButton.disabled = true;
  };
};
