const smCamX = new Smoother({
  method: 'exponential',
  params: { alpha: 0.05 }
})

const smCamY = new Smoother({
  method: 'exponential',
  params: { alpha: 0.05 }
})

const smCamScale = new Smoother({
  method: 'exponential',
  params: { alpha: 0.05 }
})

const INCR_INPUT_NUM_BY_PLANT_NUM = 8;
const START_GAME_TOTAL_TIME = 100;

window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var canvasWrapper = document.querySelector('#canvas-wrapper')
    var game = new Phaser.Game(width, height, Phaser.AUTO, canvasWrapper, null, true, true);
    window.$game = game;

    initVue()

    // window.$ui.setState("gaming");

    var deviceRatio = window.devicePixelRatio || 1

    game.bGameOver = false;
    var missSound;
    var hitSound;
    var bgm;

    let dtStartTime = 0; 

    var sp_arr = [];
    var plant_arr = [];
    var checkIndex = 0;

    var bTimeGap = false;

    let iTimeTotal = START_GAME_TOTAL_TIME;

    var vaild_input_type = ["pinL","pinR","pinU","pinD","tap","pinLU","pinLD","pinRU","pinRD"];
    var input_arr = [];


    let iSingleTransIndex = 0;

    function hammerInit() {
      //var hammertime = new Hammer(window.document, {});

      const evCB = (ev) => {
        if (game.bGameOver) {
          return;
        }

        const evType = ev.type;
        let now_need_type = input_arr[checkIndex][iSingleTransIndex];

        function moveInfomation() {
          //找不到下一个需要的序列了的话 则可以move到下一个新球
          if (!input_arr[checkIndex][iSingleTransIndex]) {
            hitSound.play();
            const iNowDist = parseInt(getNowDistance());
            checkIndex += 1;
            iSingleTransIndex = 0;
            window.$ui.setSingleIndex(iSingleTransIndex);
            window.$ui.setFinishPlante(checkIndex);
            window.$ui.setTimeLineColor(true);
            iTimeTotal += 10;
            showMarker();
          } else {
            //还有多的需要操作 对当前的两个小飞船进行减速操作
            sp_arr[checkIndex].mSpeed /= 3;
            sp_arr[checkIndex + 1].mSpeed /= 3;
          }
          now_need_type = input_arr[checkIndex][iSingleTransIndex];
        }

        if (bTimeGap) {
          if (evType === now_need_type) {
            //console.log("hit %s",now_need_type);
            iSingleTransIndex++;
            window.$ui.setSingleIndex(iSingleTransIndex);
            moveInfomation();
            //throtMoveInfomation();
          } else {
            window.$ui.setTimeLineColor(false);
            iTimeTotal -= 10;
            missSound.play();
          }
        }
      }

      window.touchEventCallback = evCB;
    }

    function preload () {
        for (let i = 1 ; i <= 7; ++i) {
          game.load.image(`ball${i}`, `assets/ball-${i}.png`);
        }
        game.load.image('ball-ring', 'assets/ball-ring-1.png');
        for (let i = 1 ; i <= 3; ++i) {
          game.load.image(`ship${i}`, `assets/pc-${i}.png`);
        }
        game.load.image('boom', 'assets/msg.png');
        game.load.audio('bgm', "assets/audio/bg.mp3");
        game.load.audio('hit_sound', "assets/audio/split.mp3");
        game.load.audio('miss_sound', "assets/audio/shrink.mp3");
    }

    function makePlante(texture,scale_size,s_x,s_y) {
        var plante = game.add.sprite(s_x,s_y,texture);
        plante.width = plante.width * scale_size;
        plante.height = plante.height * scale_size;
        plante.selfRadius = plante.width / 2;
        plante.rotation_speed = _.random(0.002,0.03);
        setAnchorCenter(plante);
        return plante;
    }

    function addNewBot(texture,speed) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      s.scale.setTo(0.5, 0.5);
      s.selfRad = 0;
      s.mSpeed = speed;
      s.mFullSpeed = speed;
      var boom = addBoom("boom");
      boom.visible = false;
      boom.scale.setTo(0.8,0.8);
      s.addChild(boom);
      return s;
    }

    function addBoom(texture) {
      var s = game.add.sprite(0,0, texture);
      s.anchor.setTo(0.3,1.0)
      return s;
    }

    function attachRunner(sp,plant) {
      sp.source_x = plant.x;
      sp.source_y = plant.y;
      sp.source_radius = plant.selfRadius;
    }

    function newInputType(iCnt = 1) {
      const arr = [];

      for (let i = 0; i < iCnt ; ++i) {
        arr.push(vaild_input_type[_.random(0,vaild_input_type.length - 1)]);
      }
      return arr;
    }

    const appendPlante = () => {
      const random_ball = `ball${_.random(1,7)}`;
      const random_radius = _.random(0.2,0.35);
      let new_x = 5000;
      let new_y = 200;
      if (plant_arr.length > 0) {
        const last_plant = plant_arr[plant_arr.length - 1];
        new_x = last_plant.x + _.random(50,100) * (_.shuffle([-1,1])[0]);
        new_y = last_plant.y + random_radius * 400 + 100; // 两个飞船的大小;

        const default_start_input = [["pinL"],["pinU"],["pinD"],["tap"],["pinR"]];
        const input_arr_index = input_arr.length;
        if (default_start_input[input_arr_index]) {
          input_arr.push(default_start_input[input_arr_index]);
        } else {
          input_arr.push(newInputType(Math.ceil(plant_arr.length / INCR_INPUT_NUM_BY_PLANT_NUM)));
        }
      }
      var plant = makePlante(random_ball,random_radius,new_x,new_y);
      if (_.random(0,1,true) < 0.2) {
        var ring_sp = makePlante("ball-ring",random_radius,new_x,new_y);
        ring_sp.rotation = _.random(0,180);
        plant.ring_sp = ring_sp;
      }
      plant_arr.push(plant);

      const random_ship = `ship${_.random(1,3)}`;
      const random_ship_speed = _.random(0.03,0.06);
      const sp = addNewBot(random_ship,random_ship_speed);

      //检查和上一个飞机的速度插值，如果太小，改变初始的旋转角。
      const last_sp = sp_arr[sp_arr.length - 1];
      if (last_sp && Math.abs(sp.mSpeed - last_sp.mSpeed) < 0.01) {
        sp.selfRad = 180;
      }

      attachRunner(sp,plant)
      sp_arr.push(sp);
    };

    function showMarker() {
      //console.log("checkIndex 0 type %s",JSON.stringify(input_arr[checkIndex]));
      window.$ui.setArrowArr(input_arr[checkIndex]);
    }

    function create () {

        //console.log("game created");

        game.bGameOver = false;

        dtStartTime = new Date();
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        const resizeCallBack = _.throttle(function onResize(scale) {
          // FIXME: This causes repeat trigger
          // console.log(game.parent.clientWidth, game.parent.clientHeight)
          scale.setGameSize(
          game.parent.clientWidth * deviceRatio,
          game.parent.clientHeight * deviceRatio)
          game.input.scale = new Phaser.Point(deviceRatio, deviceRatio)
        }, 600)
        
        setTimeout(() => {
          window.$ui.showLoading(false);
        }, 200)

        game.scale.setResizeCallback(resizeCallBack, this)
        resizeCallBack.call(this, this.scale)
        game.world.setBounds(0, 0, 10000, 10000)
        
        bgm = game.add.audio('bgm');
        bgm.loop = true;
        bgm.play();
        hitSound = game.add.audio('hit_sound');
        missSound = game.add.audio('miss_sound');

        timer = game.time.create(false);
        timer.start();

        //load plante
        for (let i = 0; i < 4; ++i) {
          appendPlante();
        }

        showMarker();

        hammerInit();
    }

    const getNowDistance = () => {
      const cp_from = sp_arr[checkIndex];
      const cp_to = sp_arr[checkIndex + 1];
      if (!cp_to) {
        return 999;
      }
      let now_dist = getDistance(cp_from,cp_to);
      return now_dist;
    };

    const resetGame = () => {
      input_arr = [];
      sp_arr.forEach((one) => {
        one.children[0].kill();
        one.kill();
      });

      sp_arr = [];

      plant_arr.forEach((one) => {
        if (one.ring_sp) {
          one.ring_sp.kill();
        }
        one.kill();
      });

      plant_arr = [];

      bTimeGap = false;
      checkIndex = 0;
      iSingleTransIndex = 0;
      window.$ui.setSingleIndex(iSingleTransIndex);
      iTimeTotal = START_GAME_TOTAL_TIME;

      game.state.start("idle");

      bgm.destroy();
      hitSound.destroy();
      missSound.destroy();
    };


    let frameCount = 0;


    const getStartedTime = () => {
      return (new Date() - dtStartTime) / 1000;
    };

    const updateUITimer = () => {
      const leftTime = iTimeTotal - getStartedTime();
      if (leftTime <= 0) {
        window.$ui.setLeftTime(0);
        return true;
      }
      frameCount++;
      if (frameCount % 5 === 0) {
        window.$ui.setLeftTime(leftTime);
      }
      return false;
    };

    function update() {

      let bDead = updateUITimer();
      if (bDead) {
        game.paused = true;

        setTimeout(function(){
          game.paused = false;
          window.$ui.setState("dead");
          game.bGameOver = true;
          resetGame();
        }, 1000);

        return;
      }

      plant_arr.forEach((one) => {
        one.rotation += one.rotation_speed;
      });

      if (!plant_arr[checkIndex + 5]) {
          appendPlante();
      }

      sp_arr.forEach((one,index) => {
        if (index === checkIndex || index === checkIndex + 1) {
          one.visible = true;
        } else {
          one.visible = false;
        }
        one.children[0].visible = false;
      });

      let now_dist = getNowDistance();
      const cp_from = sp_arr[checkIndex];
      const cp_to = sp_arr[checkIndex + 1];

      if (now_dist < 200) {
        bTimeGap = true;
        cp_from.children[0].visible = true;
        cp_to.children[0].visible = true;
      } else {
        iSingleTransIndex = 0;
        window.$ui.setSingleIndex(iSingleTransIndex);
        bTimeGap = false;
      }

      for (let i = 0, len = sp_arr.length; i < len; ++i) {
        var sp = sp_arr[i];
        sp.selfRad -= sp.mSpeed;
        sp.rotation = 360 + sp.selfRad;
        if (sp.mSpeed < sp.mFullSpeed) {
          sp.mSpeed += 0.001;
        }
        var sp_run_radius = sp.source_radius * 1.2;
        sp.x = sp.source_x + sp_run_radius * Math.cos(sp.selfRad);
        sp.y = sp.source_y + sp_run_radius * Math.sin(sp.selfRad);
      }

      // Place camera to optimal position
      const pPrev = plant_arr[checkIndex]
      const pNext = plant_arr[checkIndex + 1]
      
      const boundLeft = Math.min(pPrev.left, pNext.left)
      const boundRight = Math.max(pPrev.right, pNext.right)
      const boundTop = Math.min(pPrev.top, pNext.top)
      const boundBottom = Math.max(pPrev.bottom, pNext.bottom)

      // Get bound
      const boundCenterX = (boundRight + boundLeft) / 2
      const boundCenterY = (boundBottom + boundTop) / 2
      const boundW = boundRight - boundLeft
      const boundH = boundBottom - boundTop

      const boundRatio = boundW / boundH

      // Get screen w/h ratio, which quals to game 
      const gameW = game.scale.bounds.width * deviceRatio
      const gameH = game.scale.bounds.height * deviceRatio
      const gameRatio = gameW / gameH

      let camScale = 1
      if (boundRatio < gameRatio) {
        camScale = gameH / boundH
      } else {
        camScale = gameW / boundW
      }

      camScale *= 0.65

      const camX = boundCenterX * camScale - game.camera.width / 2
      const camY = boundCenterY * camScale - game.camera.height / 2
      smCamScale.setValue(camScale)
      smCamX.setValue(camX)
      smCamY.setValue(camY)

      game.camera.scale.setTo(smCamScale.getValue())
      game.camera.x = smCamX.getValue()
      game.camera.y = smCamY.getValue()
    }

    function render() {
      //game.debug.cameraInfo(game.camera, 32, 64)
    }

    var states = {
      idle: {create : () => {}},
      gaming: {preload : preload, create: create , update: update, render: render}
    }

    game.state.add('gaming', states.gaming)
    game.state.add('idle', states.idle)

    game.state.start('idle')

};
