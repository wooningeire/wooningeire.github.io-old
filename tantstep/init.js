var img = new Image();
var audio = new Audio();

document.body.appendChild(img);
document.body.appendChild(audio);

img.onload = () => {
  if (HTMLCanvasElement) {
    var s = document.createElement("script");
    s.src = "index.js";
    document.head.appendChild(s);
  }
};

img.src = "sprites.png";

audio.src = "lockstep.mp3";
audio.autoload = true;