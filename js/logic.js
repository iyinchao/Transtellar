const lodash = _;

const val = {
  "mx" : {
    n : "民心",
    v : 100,
  },
  "zc" : {
    n : "大臣忠诚",
    v : 80,
  },
}


const eventDef = {
  "gg" : {
    bOver : true,
    desc : "你失败了",
    checkFunc : () => {
      if (val.mx.v < 10 || val.zc.v < 10) {
        return true;
      } else {
        return false;
      }
    }
  },
  "goodking" : {
    bOver : false,
    desc : "盛世如您所愿",
    checkFunc : () => {
      if (val.mx.v > 90 || val.zc.v > 90) {
        return true;
      } else {
        return false;
      }
    }
  },
} 

const finishEvent = {};

const quesArr = [{
  q : "陛下，南方有农民军起义，兵部尚书要求前往镇压",
  a_1 : {
    desc : "准",
    res : {
      "mx" : 2,
      "zc" : 2
    }
  },
  a_2 : {
    desc : "退散",
    res : {
      "mx" : -2,
      "zc" : -2
    }
  },
  pic_url : "http://imgtu.lishiquwen.com/20160818/06e481535f40e518030e96ced86a8360.jpg",
  sound_url : "",
},
{
  q : "陛下，应该及早册立太子",
  a_1 : {
    desc : "准",
    res : {
      "mx" : 2,
      "zc" : 2
    }
  },
  a_2 : {
    desc : "退散",
    res : {
      "mx" : -20,
      "zc" : -2
    }
  },
  pic_url : "https://puui.qpic.cn/qqvideo_ori/0/f0360cwk2fb_496_280/0",
},
{
  q : "陛下，太皇太后诞辰到了，提请建造阿房宫已献孝心",
  a_1 : {
    desc : "准",
    res : {
      "mx" : 2,
      "zc" : 2
    }
  },
  a_2 : {
    desc : "退散",
    res : {
      "mx" : -20,
      "zc" : -2
    }
  },
},
{
  q : "陛下，修炼仙丹嘛",
  a_1 : {
    desc : "准",
    res : {
      "mx" : 2,
      "zc" : 2
    }
  },
  a_2 : {
    desc : "退散",
    res : {
      "mx" : -2,
      "zc" : -2
    }
  },
}]

const judgeRes = (q,choose,g_val) => {
  if (q[choose]) {
    console.log("陛下英明，选择【 %s 】",q[choose].desc);
    const res = q[choose].res;
    for (let key in res) {
      if (g_val.hasOwnProperty(key)) {
        g_val[key].v += res[key];
      } else {
        console.error("无效字段");
      }
    }
  } else {
    console.error("无效的结果");
  }
};

const showVal = () => {
  for (let key in val) {
    console.log(" %s - %d",val[key].n,val[key].v);
  }
};

const checkEvent = () => {
  showVal();
  for (let eventKey in eventDef) {
    const eventObj = eventDef[eventKey];
    if (eventObj.checkFunc()) {
      console.log("触发事件【%s】",eventObj.desc);
      if (eventObj.bOver) {
        return true;
      }
    }
  }
  return false;
};

const mainLoop = () => {
  bGameOver = false;
  iRepeatCount = 1;
  iYear = 1325;
  iDay = 0;
  while(true) {
    console.log("您已经登基 %d 天",iDay++);
    const rand_indx = lodash.random(quesArr.length - 1);
    console.log(rand_indx);
    const q = quesArr[rand_indx];
    if (q) {
      iRepeatCount = 0;
      console.log(q);
      judgeRes(q,"a_2",val)
    } else {
      iRepeatCount++;
    }

    if (iRepeatCount >= 5) {
      bGameOver = true;
    }

    if (checkEvent()) {
      bGameOver = true;
    }

    if (bGameOver) {
      console.log("游戏结束");
      break;
    }
  }
};

mainLoop()
