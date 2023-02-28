// ==UserScript==
// @name         Zoom Slide Recorder
// @namespace    https://seanlaidlaw.com
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
var imagesHashes = []
var intervals = [];
var isCapturing = false

// add the pHash library to page as a <script> tag to <head>
var scr = document.createElement('script');
scr.type = "text/javascript";
scr.src = "https://cdn.jsdelivr.net/npm/phash-js/dist/phash.js";
document.getElementsByTagName('head')[0].appendChild(scr)


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
			var capture = screen_share.toDataURL('image/png', 1.0);
			var file = dataURLtoFile(capture, 'file.png');

			pHash.hash(file).then(hash => {
				current_hash = hash.toBinary()
				console.log(current_hash)

				if (imagesHashes.length > 0) {
					previousHash = imagesHashes[imagesHashes.length - 1]
					console.log("previous hash: " + previousHash)

					similarity = calculateSimilarity(current_hash, previousHash)
					console.log(similarity)

					if (similarity < 85) {
						imagesHashes.push(current_hash);
						images.push(capture);
						console.log("added capture")
					}
				} else {
					imagesHashes.push(current_hash);
					images.push(capture);
					console.log("added capture")
				}


			})

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

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, {type: mime});
}

function calculateSimilarity(hash1, hash2) {
	let similarity = 0;
	hash1Array = hash1.split("");
	hash1Array.forEach((bit, index) => {
		hash2[index] === bit ? similarity++ : null;
	});
	return parseInt((similarity / hash1.length) * 100);
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
