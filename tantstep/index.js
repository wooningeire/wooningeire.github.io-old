"use strict";

var img = new Image();
var audio = new Audio();

document.body.appendChild(img);
document.body.appendChild(audio);

onload = () => {
  run();
};

img.src = "sprites.png";

audio.src = "lockstep.mp3";
audio.autoload = true;

function run() {
  var c = document.querySelector(".main");
  var x = c.getContext("2d");

  function queryVar(name) {
    var pairs = location.search.substring(1).split("&");
    for (var pair of pairs) {
      var splitPair = pair.split("=");
      if (splitPair[0] == name) {
        return splitPair[1];
      }
    }
  }
  c.width = Math.max(Number(queryVar("size")), 0) || 384;
  c.height = c.width / 3 * 2;

  var lengthRatio = c.width / 384;

  audio.volume = Math.max(Number(queryVar("volume")), 0) || 1;
  audio.playbackRate = Math.max(Number(queryVar("speed")), 0) || 1;

  var sprites = document.querySelector("img");

  var bcs = [...document.querySelectorAll(".buffer")];
  var bxs = bcs.map(function (c) { return c.getContext("2d"); });

  var bc0 = bcs[0];
  var bx0 = bxs[0];

  var bc1 = bcs[1];
  var bx1 = bxs[1];

  var bc2 = bcs[2];
  var bx2 = bxs[2];

  var bc3 = bcs[3];
  var bx3 = bxs[3];

  var bc4 = bcs[4];
  var bx4 = bxs[4];

  var scale = 1;

  var overlayImages = [
    new Image,
    crop(192, 394, 192, 256),
    crop(0, 394, 192, 256)
  ];
  var overlayImage = overlayImages[0];

  var middleCircle = crop(218, 0, 16, 16);
  var circleEyes = crop(234, 0, 20, 12);

  x.imageSmoothingEnabled = false;

  var colors = ["#ff499d", "#d44b9d", "#d70074", "#450d43"];
  bx1.fillStyle = colors[0];

  var cx;
  var cy;

  function resetTouchCoords() {
    cx = 96;
    cy = 128;
  }
  resetTouchCoords();

  document.addEventListener("mousemove", (e) => {
    if (e.target == c) {
      var rect = c.getBoundingClientRect();
      var coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (coords.x > c.width / 2) {
        cx = (coords.x - c.width / 2) / lengthRatio;
        cy = coords.y / lengthRatio - 8;
      } else {
        resetTouchCoords();
      }
    } else {
      resetTouchCoords();
    }
  });

  function clear(context = bx0) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  function crop(sx, sy, sw, sh) {
    var c = document.createElement("canvas");
    var x = c.getContext("2d");

    c.width = sw;
    c.height = sh;

    x.drawImage(sprites, sx, sy, sw, sh, 0, 0, sw, sh);

    return c;
  }
  var spriteArray = [];
  for (var i = 0; i < 14; i++) {
    var y;
    var sh;
    var oy;

    if (i < 7) {
      y  = 3;
      sh = 70;
      oy = -10;
    } else {
      y  = 76;
      sh = 60;
      oy = 0;
    }

    spriteArray.push({
      c:  crop(3 + 31 * (i % 7), y, 28, sh),
      ox: 0,
      oy: oy
    });
  }
  spriteArray = spriteArray.concat([
    { c: crop(123, 139, 47, 62), ox: -23, oy: -2 },
    { c: crop(173, 139, 48, 62), ox: -24, oy: -2 },
    { c: crop( 89, 139, 31, 62), ox:  -4, oy: -2 },
    { c: crop( 62, 139, 24, 62), ox:   0, oy: -2 },
    { c: crop( 34, 139, 24, 62), ox:   0, oy: -2 },
    { c: crop(  3, 139, 28, 62), ox:   0, oy: -2 },

    { c: crop(123, 204, 47, 62), ox: 4, oy: -2 },
    { c: crop(173, 204, 48, 62), ox: 4, oy: -2 },
    { c: crop( 89, 204, 31, 62), ox: 1, oy: -2 },
    { c: crop( 62, 204, 24, 62), ox: 3, oy: -2 },
    { c: crop( 34, 204, 24, 62), ox: 4, oy: -2 },
    { c: crop(  3, 204, 28, 62), ox: 0, oy: -2 },
  ]);

  function drawLeft(s) {
    clear(bx3);

    bx1.fillRect(0, 0, 192, 256);

    var width = s.c.width;
    var height = s.c.height;

    bx0.drawImage(bc1, 0, 0, 192, 256);

    bx3.globalCompositeOperation = "source-over";
    for (var i = 0; i < (192 / 48 + 2) / scale ; i++) {
      for (var j = 0; j < 192 / 45 / scale + 1; j++) {
        bx3.drawImage(
          s.c,
          (-25 + j * 45 + (i % 2 ? i % 2 * 22 : 0) + s.ox) * scale,
          (-29 + i * 48 + s.oy) * scale,
          width * scale,
          height * scale
        );
      }
    }

    function matchesAny(...spriteIDs) {
      for (var id of spriteIDs) {
        if (Object.is(s, spriteArray[id])) {
          return true;
        };
      }
      return false;
    }

    if (!overlayImage.src && matchesAny(14, 15, 20, 21)) {
      bx3.globalCompositeOperation = "source-in";
      bx3.drawImage(overlayImage, 0, 0);
    }

    bx0.drawImage(bc3, 0, 0, 192, 256);

    x.drawImage(bc0, 0, 0, c.width, c.height);
  }

  function drawRight(r, showMiddleCircle) {
    clear(bx4);

    bx2.fillStyle = colors[2];
    bx2.fillRect(0, 0, 192, 256);

    if (r > 0) {
      bx4.fillStyle = colors[3];
      bx4.beginPath();
      bx4.arc(cx, cy, r, 0, 2 * Math.PI);
      bx4.fill();

      if (showMiddleCircle) {
        bx4.drawImage(middleCircle, cx - 8, cy - 8);
      }
      bx4.drawImage(circleEyes, cx - 10, cy - 17 - r);

      bx2.drawImage(bc4, 0, 0);
    }

    bx0.drawImage(bc2, 192, 0, 192, 256);

    x.drawImage(bc0, 0, 0, c.width, c.height);
  }
  drawLeft(spriteArray[7]);
  drawRight(0);

  const BPM = 162;
  const T1 = 60000 / BPM;

  setTimeout(() => {

    bounce();

    var awPairs = [];
    for (var i =  0; i < 12; i += 2) awPairs.push([i, bounce]);
    for (var i = 12; i < 16; i += 1) awPairs.push([i, bounce]);

    addFlickbeatSet   ( 16,  32, false);
    addFlickoffbeatSet( 32,  48);
    addFlickbeatSet   ( 48,  64);
    addFlickoffbeatSet( 64,  80);
    addFlickbeatSet   ( 80,  88);
    addFlickoffbeatSet( 88,  96);
    addFlickbeatSet   ( 96, 104);
    addFlickoffbeatSet(104, 112);
    addFlickbeatSet   (112, 116);
    addFlickoffbeatSet(116, 120);
    addFlickbeatSet   (120, 124);
    addFlickoffbeatSet(124, 128);
    addFlickbeatSet   (128, 132);
    addFlickoffbeatSet(132, 140);
    addFlickbeatSet   (140, 152);
    addFlickoffbeatSet(152, 158);
    addFlickbeatSet   (158, 168);
    addFlickoffbeatSet(168, 174);
    addFlickbeatSet   (174, 192);
    addFlickoffbeatSet(192, 208);
    addFlickbeatSet   (208, 233, true, false);

    console.log(awPairs);

    function addFlickbeatSet(start, end, useStart = true, useEnd = true) {
      if (useStart) {
        awPairs.push([start, hai]);
      }

      for (var i = start + (useStart ? 1 : 0); i < end - (useEnd ? 4 : 0); i++) {
        awPairs.push([i, flickbeat]);
      }

      if (useEnd) {
        for (var i = end - 4; i < end; i++) {
          awPairs.push([i, hai]);
        }
      }
    }

    function addFlickoffbeatSet(start, end, useStart = true, useEnd = true) {
      if (useStart) {
        awPairs.push([start - .5, ho]);
      }

      for (var i = start + (useStart ? 1 : 0); i < end - (useEnd ? 1 : 0); i++) {
        awPairs.push([i - .5, flickoffbeat]);
      }

      if (useEnd) {
        for (var i = end - 2; i < end; i += .5) {
          awPairs.push([i, mmha]);
        }
      }
    }

    setTimeout(() => {
      bounce();
      audio.play();
    }, T1 * 2);

    audioWatcher(awPairs, 40);

    audioWatcher([
      [ 63.5, () => { scale = .75; }],
      [ 80  , () => { scale = 1  ; }],
      [ 87.5, () => { scale = .75; }],
      [ 96  , () => { scale = .5 ; }],
      [103.5, () => { scale = .75; }],
      [112  , () => { scale = 1  ; }],
      [115.5, () => { scale = .75; }],
      [120  , () => { scale = .5 ; }],
      [123.5, () => { scale = .3 ; }],
      [128  , () => { scale = .15; overlayImage = overlayImages[1]; }],
      [131.5, () => { scale = .3 ; overlayImage = overlayImages[0]; }],
      [140  , () => { scale = .5 ; }],
      [141  , () => { scale = .75; }],
      [141.5, () => { scale = 1  ; }],
      [142  , () => { scale = .5 ; }],
      [143  , () => { scale = .75; }],
      [143.5, () => { scale = 1  ; }],
      [144  , () => { scale = .3 ; }],
      [151.5, () => { scale = .15; overlayImage = overlayImages[2]; }],
      [158  , () => { scale = 1  ; overlayImage = overlayImages[0]; }],
      [160  , () => { scale = .3 ; }],
      [167.5, () => { scale = .15; overlayImage = overlayImages[2]; }],
      [174  , () => { scale = 1  ; overlayImage = overlayImages[0]; }],
      [176  , () => { scale = .75; }],
      [177  , () => { scale = .5 ; }],
      [178  , () => { scale = .3 ; }],
      [179  , () => { scale = .15; overlayImage = overlayImages[1]; }],
      [184  , () => { scale = .75; overlayImage = overlayImages[0]; }],
      [185  , () => { scale = .5 ; }],
      [186  , () => { scale = .3 ; }],
      [187  , () => { scale = .15; overlayImage = overlayImages[1]; }],
      [191.5, () => { scale = 1  ; overlayImage = overlayImages[0]; }],
      [192.5, () => { scale = .5 ; }],
      [193.5, () => { scale = .5 ; }],
      [194.5, () => { scale = .3 ; }],
      [195.5, () => { scale = .15; overlayImage = overlayImages[2]; }],
      [199.5, () => { scale = .75; overlayImage = overlayImages[0]; }],
      [200.5, () => { scale = .5 ; }],
      [201.5, () => { scale = .3 ; }],
      [202.5, () => { scale = .15; overlayImage = overlayImages[2]; }],
      [208  , () => {              overlayImage = overlayImages[1]; }],
    ], 40);

    audioWatcher([[230, () => {
      c.addEventListener("transitionend", () => {
        var n = document.querySelector(".notice");
        n.innerHTML = "– wooningc :)<br />Tant Day 2017<br /><a href='javascript: location.reload()'>Replay</a>";
        n.style.animation = "none";
        n.style.webkitAnimation = "none";
        n.style.pointerEvents = "auto";
        n.style.opacity = 1;
        n.style.background = "none";
        n.style.color = "rgba(255, 255, 255, .4)";
      }, false);
      c.style.opacity = 0;
    }]], 500);

  }, 2000);

  function audioWatcher(pairs, accuracy) {
    var i = 0;
    var iID = setInterval(() => {
      if (!pairs[i]) {
        clearInterval(iID);
        return;
      }
      if (audio.currentTime >= (pairs[i][0] * T1 - accuracy / 2) / 1000) {
        pairs[i][1]();
        i++;
      }
    }, accuracy);
    return iID;
  }

  var iIDs = [];
  function repeat(func, amount, delay, customDelays, doneFunc = () => {}, index = 0) {
    var i = 0;
    interval();

    function interval() {
      func(i);
      i++;
      var newDelay = customDelays ? customDelays.get(i) || delay : delay;
      if (i <= amount - 1) {
        iIDs[index] = setTimeout(interval, newDelay / audio.playbackRate);
      } else {
        doneFunc();
      }
    }
  }

  function bounce() {
    repeat((i) => { drawLeft(spriteArray[i]); }, 7, 40);
  }

  function flickbeat() {
    clearTimeout(iIDs[0]);
    repeat((i) => { drawLeft(spriteArray[i + 14]); }, 6, 20, new Map().set(2, 150));
    touch();
  }
  function hai() {
    bx1.fillStyle = bx1.fillStyle === colors[1] ? colors[0] : colors[1];
    flickbeat();
  }
  function ho() {
    bx1.fillStyle = bx1.fillStyle === colors[1] ? colors[0] : colors[1];
    flickoffbeat();
  }

  function flickoffbeat() {
    clearTimeout(iIDs[0]);
    repeat((i) => { drawLeft(spriteArray[i + 20]); }, 6, 20, new Map().set(2, 150));
    touch();
  }
  function mmha() {
    if (bx1.fillStyle === colors[0]) {
      bx1.fillStyle = colors[1];
      flickoffbeat();
    } else {
      bx1.fillStyle = colors[0];
    }
  }

  function touch() {
    clearTimeout(iIDs[1]);
    repeat((i) => { drawRight(i < 5 ? 4 * i : 40 - 4 * i, i < 6); }, 11, 25, false, () => {}, 1);
  }
}
