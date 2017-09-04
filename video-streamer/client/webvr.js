var socket = io();

/* global VRSamplesUtil */
(function () {
"use strict";


// used to display VR HMD sensor data
function buildVRElement (vrDisplay) {
var vrElement = document.createElement("div");
vrElement.classList.add("vr-display");

var header = document.createElement("h1");
// header.innerHTML = vrDisplay.displayId + " - " + vrDisplay.displayName;
vrElement.appendChild(header);

// This function walks through the object recursively and builds a
// list of all the properties and values. It's a quick and dirty way
// to dump the contents of a VRDisplay onto the screen.
function buildMemberList (obj, depth) {
  if (depth >= 5) {
    return; // Don't let this infinitely recurse on us.
  }

  var ul = document.createElement("ul");

  for (var key in obj) {
    // Ignore some names that are intended to be "private"
    if (!key.length || key[0] == "_" || key[key.length-1] == "_") {
      continue;
    }
    // Don't list functions
    if (typeof obj[key] === "function") {
      continue;
    }

    var li = document.createElement("li");

    if (obj[key] === null) {
      li.innerHTML = "<b>" + key + ":</b> <i>null</i>";
    } else if (Object.prototype.toString.call(obj[key]) === "[object Float32Array]") {
      // This formatting ensures that the array prints at a fixed size
      // as the values in the array change.
      var value = "";
      for (var idx in obj[key]) {
        if (value !== "")
          value += ",";
        if (obj[key][idx] >= 0)
          value += " ";
        value += obj[key][idx].toFixed(3);
      }
      li.innerHTML = "<b>" + key + ":</b> <span class='float-array'>[" + value + " ]</span>";
    } else if (typeof obj[key] === "number" && obj[key] !== (obj[key]|0)) {
      li.innerHTML = "<b>" + key + ":</b> " + obj[key].toFixed(3);
    } else if (typeof obj[key] === "object") {
      li.innerHTML = "<b>" + key + ":</b>";
      li.appendChild(buildMemberList(obj[key], depth+1)); // <-- recursive 
    } else {
      li.innerHTML = "<b>" + key + ":</b> " + obj[key];
    }

    ul.appendChild(li);
  }

  return ul;
}

var memberUL = buildMemberList(vrDisplay, 0);
var frameData = new VRFrameData();

vrDisplay.getFrameData(frameData);


var frameDataLI = document.createElement("li");
frameDataLI.innerHTML = "<b>getFrameData():</b>";
var frameDataUL = buildMemberList(frameData);
frameDataLI.appendChild(frameDataUL);
memberUL.appendChild(frameDataLI);

var leftEye = vrDisplay.getEyeParameters("left");
var leftEyeLI = document.createElement("li");
leftEyeLI.innerHTML = "<b>getEyeParameters('left'):</b>";
var leftEyeUL = buildMemberList(leftEye);
leftEyeLI.appendChild(leftEyeUL);
memberUL.appendChild(leftEyeLI);

var rightEye = vrDisplay.getEyeParameters("right");
var rightEyeLI = document.createElement("li");
rightEyeLI.innerHTML = "<b>getEyeParameters('right'):</b>";
var rightEyeUL = buildMemberList(rightEye);
rightEyeLI.appendChild(rightEyeUL);
memberUL.appendChild(rightEyeLI);

// Update the values that may change frame-to-frame
function onAnimationFrame () {
  vrDisplay.requestAnimationFrame(onAnimationFrame);

  vrDisplay.getFrameData(frameData);

  // get leftViewMatrix data to be transmitted to server side
  var leftViewMatrix = frameData.leftViewMatrix;

  // send leftViewMatrix data to server using socket.io
  socket.emit('vr_data', leftViewMatrix.buffer);
  //console.log(leftViewMatrix);

  frameDataLI.removeChild(frameDataUL);
  frameDataUL = buildMemberList(frameData);
  frameDataLI.appendChild(frameDataUL);

  leftEye = vrDisplay.getEyeParameters("left");
  leftEyeLI.removeChild(leftEyeUL);
  leftEyeUL = buildMemberList(leftEye);
  leftEyeLI.appendChild(leftEyeUL);

  rightEye = vrDisplay.getEyeParameters("right");
  rightEyeLI.removeChild(rightEyeUL);
  rightEyeUL = buildMemberList(rightEye);
  rightEyeLI.appendChild(rightEyeUL);
}

vrDisplay.requestAnimationFrame(onAnimationFrame);

vrElement.appendChild(memberUL);

return vrElement;
}

function eventFired(evt) {
VRSamplesUtil.addInfo("[" + evt.type + "] VR Display: " + evt.display.displayName + ", Reason: " + evt.reason, 3000);
}

if (navigator.getVRDisplays) {
// Enumerate the VRDisplays
navigator.getVRDisplays().then(function (displays) {
  if (!displays.length) {
    VRSamplesUtil.addInfo("WebVR supported, but no VRDisplays found.");
    return;
  }
  for (var i = 0; i < displays.length; ++i) {
    document.body.appendChild(buildVRElement(displays[i]));
  }
});

window.addEventListener("vrdisplayconnect", eventFired, false);
window.addEventListener("vrdisplaydisconnect", eventFired, false);
window.addEventListener("vrdisplayactivate", eventFired, false);
window.addEventListener("vrdisplaydeactivate", eventFired, false);
window.addEventListener("vrdisplayblur", eventFired, false);
window.addEventListener("vrdisplayfocus", eventFired, false);
} else if (navigator.getVRDevices) {
VRSamplesUtil.addError("Your browser supports WebVR but not the latest version. See <a href='http://webvr.info'>webvr.info</a> for more info.");
} else {
VRSamplesUtil.addError("Your browser does not support WebVR. See <a href='http://webvr.info'>webvr.info</a> for assistance.");
}
})();