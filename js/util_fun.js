
function setAnchorCenter(sprite) {
  sprite.anchor.setTo(0.5,0.5);
}

function getXieLv(x1,x2,y1,y2) {
  return (y2 - y1) / (x2 - x1);
}


function getJiajiao(k1,k2) {
  let k = (k1-k2) / (1 + k1 * k2);
  k = Math.abs(k);
  k = Math.atan(k);
  k = k * 360 / (2 * Math.PI);
  return k;
}

function getXieLvJiaoduCha(sp1,sp2) {
  const k0 = getXieLv(sp1.source_x,sp2.source_x,sp1.source_y,sp2.source_y);
  const k1 = getXieLv(sp1.x,sp1.source_x,sp1.y,sp1.source_y);
  const k2 = getXieLv(sp2.x,sp2.source_x,sp2.y,sp2.source_y);
  const arctan1 = getJiajiao(k2,k0);
  const arctan2 = getJiajiao(k1,k0);
  //console.log("k0 %d k1 %d k2 %d arctan1 %d arctan2 %d",k0, k1, k2,arctan1, arctan2);
  const MAX_JIAODU = 60;
  if (getDistance(sp1,sp2) > (sp1.source_radius + sp2.source_radius)) {
    return 999;
  }
  if (arctan1 > MAX_JIAODU || arctan2 > MAX_JIAODU) {
    return 999;
  }
  return Math.abs(arctan1 - MAX_JIAODU) + Math.abs(arctan2 - MAX_JIAODU);
}

function getDistance(sp1,sp2) {
  return Math.sqrt((sp1.x-sp2.x) * (sp1.x-sp2.x) + (sp1.y-sp2.y) *(sp1.y-sp2.y));
}

function dommyGetFont(cb) {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState==4) {
      cb(null);
    }
  }
  xmlhttp.open("GET","assets/font/hand.ttf",true);
  xmlhttp.send(null);
}
