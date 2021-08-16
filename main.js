var videoSocket = new WebSocket("ws://localhost:8081")

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const videoFrame = document.getElementById("video")
var player;
var videoQueue = []

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
  const iframeElement = document.getElementById('player')
  videoSocket.onmessage = function (event) {
	  console.log(event.data);
	  const splitData = event.data.split(' ')
	  const time = splitData[0]
	  const id = splitData[1]
	  if(player.getPlayerState() != 5 && player.getPlayerState() != 0){
	  	videoQueue.push({'id': id, 'time': time})
	  	console.log('added video to queue')
	  } else{
	  	player.cueVideoById({
	  		'videoId': id,
	  		'startSeconds': 0,
	  		'endSeconds': time
	  	})
	  	player.playVideo()
	  }


}

}

function onPlayerStateChange(event) {
	const iframeElement = document.getElementById('player')
	console.log(player.getVideoUrl())
	console.log('Playerstate: ' + event.data)
	if (event.data == YT.PlayerState.ENDED) {
		console.log(videoQueue.length)
		if(videoQueue.length > 0){
			player.cueVideoById({
			  	'videoId': videoQueue[0].id,
			  	'startSeconds': 0,
			  	'endSeconds': videoQueue[0].time
			 })
			player.playVideo()
		} else{
			iframeElement.style.opacity = 0;
		}
	} else if (event.data == YT.PlayerState.PLAYING){
		iframeElement.style.opacity = 1;
		if(videoQueue[0] && videoQueue[0].id == youtube_parser(player.getVideoUrl())){
			videoQueue.shift()
		}
	}
}


function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

