const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const statusText = document.getElementById("status");
const logBox = document.getElementById("log");

let mediaRecorder;
let audioChunks = [];

function log(message) {
  console.log(message);
  logBox.textContent += `\n> ${message}`;
  logBox.scrollTop = logBox.scrollHeight;
}

recordButton.onclick = async () => {
  log("🎤 Start button pressed");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
    log("🎙️ Audio chunk captured");
  };

  mediaRecorder.onstart = () => {
    statusText.textContent = "Recording...";
    log("⏺ Recording started");
  };

  mediaRecorder.start();
  stopButton.disabled = false;
  recordButton.disabled = true;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  statusText.textContent = "Processing...";
  log("⏹ Stop button pressed, stopping recorder");

  mediaRecorder.onstop = async () => {
    log("✅ Recording stopped, preparing upload...");

    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    log("📤 Sending audio to backend...");
    try {
      const response = await fetch("https://kotton-the-toy0-1.onrender.com/process", {
        method: "POST",
        body: formData
      });

      log("🔁 Got response from backend");
      const audioData = await response.arrayBuffer();

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      statusText.textContent = "Done! Ready again";
      log("🔊 Playing AI response");

      recordButton.disabled = false;
      stopButton.disabled = true;
    } catch (err) {
      log("❌ Error: " + err.message);
      statusText.textContent = "Error occurred";
      recordButton.disabled = false;
      stopButton.disabled = true;
    }
  };
};
