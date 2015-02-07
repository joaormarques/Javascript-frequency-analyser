// cross browser trickery
navigator.getUserMedia = (navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia);
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// create audio context using the Web Audio API
var audioCtx = new AudioContext();

// analyser node setup
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 1024;
analyser.minDecibels = -100;
analyser.maxDecibels = 0;

// data to be passed in to navigator.userMedia
var session = {
	audio: true
};

// create instance and ask for permission to use users microphone
navigator.getUserMedia(session, userMediaSuccess, userMediaError);

// userMedia success callback
function userMediaSuccess(stream) {
	// create media stream source from the userMedia stream
	var source = audioCtx.createMediaStreamSource(stream);
	//route from source to analyser node
	source.connect(analyser);
	// initialize an array to the length of the buffer
	var dataArray = new Uint8Array(analyser.frequencyBinCount);

	initVisualisation(analyser, dataArray);
}

// on userMedia error
function userMediaError(error) {
	console.log('Error: ', error);
}

// initialize visualization
// analyser: the analyser node instance
// dataArray: the data array containing frequency information
function initVisualisation(analyser, dataArray) {
	var visualisation = $("#visualisation");
	var barWidth = 100 / analyser.frequencyBinCount;
	for (var i = 0; i < analyser.frequencyBinCount; i++) {
		$("<div/>").css({
			"position": "absolute",
			"left": i * barWidth + "%",
			"bottom": 0,
			"width": (barWidth - 0.1) + "%",
			"float": 'left'
		}).appendTo(visualisation);
	}
	var bars = $("#visualisation > div");

	// run update every 10ms (VERY HEAVY - but looks cool!)
	setInterval(function() {
		// fill dataArray with frequency data
		analyser.getByteFrequencyData(dataArray);

		// update each bar using frequency information
		bars.each(function(index, bar) {
			$(bar).css({
				'height': dataArray[index].map(0, 255, 0, $(window).height()) + 'px',
				'background': 'rgb(' + dataArray[index] + ', ' + (255 - dataArray[index]) + ', 0)'
			});
		});
	}, 10);
}

// simple function to map values from one range to another
Number.prototype.map = function (in_min , in_max , out_min , out_max) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
};