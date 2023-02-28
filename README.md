# ZoomSlideCapture

Javascript userscript for capturing screen share from a Zoom meeting connected through web browser.


## Installation

### Chrome

Download the [Tampermonkey
](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) chrome extension and open up its dashboard page.

Navigate to Utilities tab and paste the URL of this repo's javascript file in the 'Install from URL'
box and press install:

```
https://raw.githubusercontent.com/seanlaidlaw/ZoomSlideCapture/master/ZoomSlideCapture.js
```

Once you press the install button, and verify the installation, it'll load a
"Start Capture" button on the Zoom Call when connected through chrome. Pressing
this will start capturing the shared screen every second.

It uses [perceptual
hashes](https://en.wikipedia.org/wiki/Perceptual_hashing) to avoid duplicating
images when the screen has only slightly changed. The current threshold for
this is if the image has changed by more than 15%.

When you want to stop capturing screen sharing pressing the same button again
will stop the loop capturing the screen and will compress the multiple captured
images into a single zip file which will be downloaded to your device.
