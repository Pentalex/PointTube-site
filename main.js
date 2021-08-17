var videoSocket = new WebSocket("ws://localhost:8081")

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const videoFrame = document.getElementById("video")
var player;
var videoQueue = []

videoSocket.onopen = function (event) {
  videoSocket.send("overlay");
};


var reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)(?:(\?t|&start)=(\d+))?.*/gm;


function connect(){

	var videoSocket = new WebSocket("ws://localhost:8081")
	videoSocket.onopen = function (event) {
	  videoSocket.send("overlay");

	  videoSocket.onmessage = function (event) {
	  console.log(event.data);
	  if(event.data === 'skip'){
	  	player.pauseVideo()
	  	return
	  } else {
	  	const splitData = event.data.split(' ')
		  const time = splitData[0]
		  const id = splitData[1]
		  const startTime = splitData[2]
		  if(player.getPlayerState() != 5 && player.getPlayerState() != 0 && player.getPlayerState() != 2){
		  	videoQueue.push({'id': id, 'time': time, 'startTime' : startTime})
		  	console.log('added video to queue')
		  } else{
		  	player.cueVideoById({
		  		'videoId': id,
		  		'startSeconds': startTime,
		  		'endSeconds': parseInt(startTime) + parseInt(time)
		  	})
		  	console.log('playing video')
		  	player.playVideo()
		  }
		  }
		}	

		};
	videoSocket.onclose = function(e) {
	  console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
	  setTimeout(function() {
	    connect();
	  }, 1000);
	};
	videoSocket.onerror = function(err){
		console.error(err)
		videoSocket.close();
	}
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '1080',
    width: '1920',
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
    });
}

function onPlayerReady(event) {
  console.log('player ready!')
  player.stopVideo()
  connect()
}

function onPlayerStateChange(event) {
	const iframeElement = document.getElementById('player')
	console.log(player.getVideoUrl())
	console.log('Playerstate: ' + event.data)
	if (event.data == YT.PlayerState.ENDED) {
		if(videoQueue.length > 0){
			player.cueVideoById({
			  	'videoId': videoQueue[0].id,
			  	'startSeconds': videoQueue[0].startTime,
			  	'endSeconds': parseInt(videoQueue[0].time) + parseInt(videoQueue[0].startTime)
			 })
			player.playVideo()
		} else{
			iframeElement.style.opacity = 0;
		}
	} else if (event.data == YT.PlayerState.PLAYING){
		iframeElement.style.opacity = 1;
		if(videoQueue[0] && videoQueue[0].id == player.getVideoUrl().split(reg)[2]){
			videoQueue.shift()
		}
	} else if (event.data == YT.PlayerState.PAUSED){
		if(videoQueue.length > 0){
			player.cueVideoById({
			  	'videoId': videoQueue[0].id,
			  	'startSeconds': videoQueue[0].startTime,
			  	'endSeconds': parseInt(videoQueue[0].time) + parseInt(videoQueue[0].startTime)
			 })
			player.playVideo()
		} else{
			iframeElement.style.opacity = 0;
		}
	}
}


