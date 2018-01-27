
let touchMoveCB = null;

let start_x,start_y,last_x,last_y;

document.body.addEventListener("touchstart",(ev) => {
  start_x = ev.touches[0].clientX;
  start_y = ev.touches[0].clientY;
  last_x = start_x;
  last_y = start_y;
  //console.log(ev);
  touchMoveCB = (ev) => {
    //console.log(ev);
    if (ev.touches) {
      last_x = ev.touches[0].clientX;
      last_y = ev.touches[0].clientY;
    }
  } 
  document.body.addEventListener("touchmove",touchMoveCB)
})

window.touchEventCallback = null;

document.body.addEventListener("touchend",(ev) => {
  //console.log(ev);
  const xl = getXieLv(last_x,start_x,last_y,start_y);
  let jiajiao = getJiajiao(xl,0);
  document.body.removeEventListener("touchmove",touchMoveCB)

  let eventName = "";
  const dist = Math.sqrt((last_x - start_x) * (last_x - start_x) + (last_y - start_y) * (last_y - start_y));
  if (dist < 30) {
    eventName = "tap";
  } else {
    let xiangxian_index = 0;
    if (last_x >= start_x && last_y <= start_y) {
      xiangxian_index = 1;
    }
    if (last_x <= start_x && last_y <= start_y) {
      xiangxian_index = 2;
      jiajiao = 180 - jiajiao;
    }
    if (last_x <= start_x && last_y >= start_y) {
      xiangxian_index = 3;
      jiajiao += 180;
    }
    if (last_x >= start_x && last_y >= start_y) {
      xiangxian_index = 4;
      jiajiao = 360 - jiajiao;
    }

    if (last_x === start_x) {
      if (last_y > start_x) {
        jiajiao = 270;
      } else {
        jiajiao = 90;
      }
    }
    console.log("xl %f jiaojiao %d",xl,jiajiao);
    // 22.5
    // 67.5
    // 112.5
    // 157.5
    // 202.5
    // 247.5
    // 292.5
    // 337.5
    if (jiajiao < 22.5 || jiajiao > 337.5 ) {
      eventName = "pinR";
    } else if ( jiajiao >= 22.5 && jiajiao < 67.5 ) {
      eventName = "pinRU";
    } else if ( jiajiao >= 67.5 && jiajiao < 112.5 ) {
      eventName = "pinU";
    } else if ( jiajiao >= 112.5 && jiajiao < 157.5 ) {
      eventName = "pinLU";
    } else if ( jiajiao >= 157.5 && jiajiao < 202.5 ) {
      eventName = "pinL";
    } else if ( jiajiao >= 202.5 && jiajiao < 247.5 ) {
      eventName = "pinLD";
    } else if ( jiajiao >= 247.5 && jiajiao < 292.5 ) {
      eventName = "pinD";
    } else if ( jiajiao >= 292.5 && jiajiao < 337.5 ) {
      eventName = "pinRD";
    }
  }

  console.log("get event %s",eventName);

  if (typeof window.touchEventCallback === "function") {
    window.touchEventCallback({
      type :eventName,
    });
  }
})

