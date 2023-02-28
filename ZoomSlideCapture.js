// ==UserScript==
// @name         Zoom Slide Recorder
// @namespace    https://sanger.zoom.us
// @version      0.1
// @description  Script to capture Screen Share as PNG data every 1s
// @author       Sean Laidlaw
// @require https://rawgit.com/kriskowal/q/v1/q.js
// @require https://code.jquery.com/jquery-3.6.3.min.js
// @require https://raw.github.com/tantaman/LargeLocalStorage/master/dist/LargeLocalStorage.min.js
// @match        https://sanger.zoom.us/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant       unsafeWindow
// @run-at      document-idle
// ==/UserScript==

var images = []
var intervals = [];
var isCapturing = false

function toggleCapture() {
	let screen_share = document.getElementById('sharee-container-canvas')

	if (isCapturing) {
		isCapturing = false
		intervals.forEach(clearInterval);
		document.getElementById('startCaptureBtn').innerText = "Start Capture"

		for (let i = 0; i < images.length; i++) {
			downloadFile(images[i])
		}
	} else {
		isCapturing = true
		const interval = setInterval(function () {
			let capture = screen_share.toDataURL('image/png', 1.0);
			if (!(images.includes(capture))) {
				images.push(capture)
				console.log(images.length)
			}
		}, 2000);
		intervals.push(interval);
		document.getElementById('startCaptureBtn').innerText = "Capturing..."
	}

}

function downloadFile(filePath) {
	var link = document.createElement('a');
	link.href = filePath;
	link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
	link.click();
}


(function () {

	// this uses a manual 5000ms timer before running this code, due to the webpage dynamically loading.
	// without this it runs instantly before any of the targeted elements appear
	setTimeout(function () {
		var shareBtn = document.createElement('div');
		shareBtn.innerHTML = '<button id="startCaptureBtn" type="button">Start Capture</button>';
		shareBtn.setAttribute('class', 'footer-button-base__button')
		document.getElementById('foot-bar').firstChild.appendChild(shareBtn)

		//--- Activate the newly added button.
		document.getElementById("startCaptureBtn").addEventListener(
			"click", toggleCapture, false
		);


	}, 5000); // 5 seconds will elapse and Code will execute.
})();

