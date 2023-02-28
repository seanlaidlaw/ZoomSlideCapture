// ==UserScript==
// @name         Zoom Slide Recorder
// @namespace    https://sanger.zoom.us
// @version      0.1
// @description  Script to capture Screen Share as PNG data every 1s
// @author       Sean Laidlaw
// @require https://raw.githubusercontent.com/ericvergnaud/jszip/sync-methods/dist/jszip.js
// @match        https://sanger.zoom.us/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant       unsafeWindow
// @run-at      document-idle
// ==/UserScript==

var images = []
var intervals = [];
var isCapturing = false

function toggleCapture() {
	// this is the canvas that Zoom uses to display the screen share
	let screen_share = document.getElementById('sharee-container-canvas')

	if (isCapturing) {
		isCapturing = false
		intervals.forEach(clearInterval); // stop capturing screen every 2 second
		document.getElementById('startCaptureBtn').innerText = "Start Capture"

		// initiate zip file to contain the captured images
		var zip = new JSZip();
		var zipped = zip.sync(function () { // sync method to avoid async issues in Tapermonkey
			var img = zip.folder("images");
			for (let i = 0; i < images.length; i++) {
				var idx = images[i].indexOf('base64,') + 'base64,'.length;
				var content = images[i].substring(idx);
				img.file(i + ".png", content, {base64: true});
			}
			var data = null;
			zip.generateAsync({type: "base64"})
				.then(function (content) {
					data = content;
					downloadFile("data:application/zip;base64," + content)
				});
		});
	} else {
		isCapturing = true
		const interval = setInterval(function () {
			// capture state of canvas and append it to the images array
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

// this creates a button linking to a file and then clicks it to download it
// it avoids the error caused by browser blocking redirect to a file
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

		//--- Add a button to the Zoom toolbar to toggle capture of screen share.
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

