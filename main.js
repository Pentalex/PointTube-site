var videoSocket = new WebSocket("ws://localhost:8081")

const videoFrame = document.getElementById("video")

videoSocket.onmessage = function (event) {
  console.log(event.data);
}
