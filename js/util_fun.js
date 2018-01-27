
function setAnchorCenter(sprite) {
  sprite.anchor.setTo(0.5,0.5);
}

function getDistance(sp1,sp2) {
  return Math.sqrt((sp1.x-sp2.x) * (sp1.x-sp2.x) + (sp1.y-sp2.y) *(sp1.y-sp2.y));
}

function dommyGetFont(cb) {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState==4) {
      console.log("done font");
      cb(null);
    }
  }
  xmlhttp.open("GET","assets/font/hand.ttf",true);
  xmlhttp.send(null);
}
