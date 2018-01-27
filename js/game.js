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


window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvasWrapper = document.querySelector('#canvas-wrapper')
    var game = new Phaser.Game(width, height, Phaser.AUTO, canvasWrapper, { preload: preload, create: create ,update: update, render: render}, true, true);
    window.$game = game;
    var deviceRatio = window.devicePixelRatio || 1

    game.bGameOver = false;
    var missText;
    var score = 0;
    var scoreText;
    let plant_1;
    let plant_2;
    var missSound;
    var hitSound;
    var successText;

    var bTimeGap = false;
    var marker_arr = [];

    //支持五种输入 tap panup pandown panright panleft
    var input_arr = ["panup","pandown","panright","tap","pandown"];

    var type_map = {
      "panup"    : "mark1",
      "pandown"  : "mark2",
      "panleft"  : "mark3",
      "panright" : "mark4",
      "tap"      : "mark5",
    }

    hammerInit();

    //对hammerjs的手势增加额外检查
    function checkPanPype(ev) {
      let bOk = true;
      console.log(ev);
      if (ev.type === "pan") {
        if (ev.distance > 30) {
          bOk = false;
        }
      }
      const toll_rad = 30;
      if (ev.type === "panup") {
        if (Math.abs(ev.angle - (-90)) > toll_rad) {
          bOk = false;
        }
      }
      if (ev.type === "pandown") {
        if (Math.abs(ev.angle - (90)) > toll_rad) {
          bOk = false;
        }
      }
      if (ev.type === "panright") {
        if (Math.abs(ev.angle) > toll_rad) {
          bOk = false;
        }
      }
      if (ev.type === "panleft") {
        if (Math.abs(ev.angle) > (180 - toll_rad)) {
          bOk = false;
        }
      }
      return bOk;
    }

    function hammerInit() {
      var hammertime = new Hammer(window.document, {});

      const evCB = (ev) => {
        const evType = ev.type;
        let now_need_type = input_arr[checkIndex];

        function moveInfomation() {
          hammertime.off(now_need_type,evCB);
          hitSound.play();
          const iNowDist = parseInt(getNowDistance());
          score += iNowDist;
          checkIndex += 1;
          now_need_type = input_arr[checkIndex];
          hammertime.on(now_need_type,evCB);
          checkGameOver();
          console.log("checkIndex move %d",checkIndex);
        }

        const throtMoveInfomation = _.throttle(moveInfomation,400);

        if (bTimeGap) {
          if (evType === now_need_type && checkPanPype(ev)) {
            throtMoveInfomation();
          } else {
            missSound.play();
          }
        }
      }
      hammertime.on(input_arr[0],evCB);
    }

    function preload () {
        //game.load.image('logo', 'image/phaser.png');
        game.load.atlasJSONHash('bot', 'assets/sprites/running_bot.png', 'assets/sprites/running_bot.json');
        for (let i = 1 ; i <= 6; ++i) {
          game.load.image(`ball${i}`, `assets/ball-${i}.png`);
        }
        for (let i = 1 ; i <= 3; ++i) {
          game.load.image(`mark${i}`, `assets/mark_${i}.png`);
        }
        game.load.image('ball-ring', 'assets/ball-ring-1.png');
        for (let i = 1 ; i <= 3; ++i) {
          game.load.image(`ship${i}`, `assets/pc-${i}.png`);
        }
        game.load.image('boom', 'assets/sprites/diamond.png');
        game.load.image('star', 'assets/sprites/a.png');
        game.load.image('background', 'assets/img/bg.jpg');
        game.load.image('finish_bg', 'assets/sprites/f_bg.png');
        game.load.audio('bgm', "assets/audio/bg.mp3");
        game.load.audio('hit_sound', "assets/audio/split.mp3");
        game.load.audio('miss_sound', "assets/audio/shrink.mp3");
    }

    function makePlante(texture,scale_size,s_x,s_y) {
        var plante = game.add.sprite(s_x,s_y,texture);
        plante.width = plante.width * scale_size;
        plante.height = plante.height * scale_size;
        plante.selfRadius = plante.width / 2;
        plante.rotation_speed = _.random(0.005,0.015);
        setAnchorCenter(plante);
        return plante;
    }

    function addNewBot(texture,speed) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      s.scale.setTo(0.5, 0.5);
      s.selfRad = 0;
      s.mSpeed = speed;
      var boom = addBoom("boom");
      boom.visible = false;
      boom.scale.setTo(3,3);
      s.addChild(boom);
      return s;
    }

    function addBoom(texture) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      return s;
    }

    function attachRunner(sp,plant) {
      sp.source_x = plant.x;
      sp.source_y = plant.y;
      sp.source_radius = plant.selfRadius;
    }

    function makeFinishStar(texture,radius,s_x,s_y) {
        var plante = game.add.sprite(s_x,s_y,texture);
        plante.width = radius * 2;
        plante.height = radius * 2;
        plante.selfRadius = radius;
        plante.rotation_speed = _.random(0.005,0.015);
        setAnchorCenter(plante);
        return plante;
    }

    let gwcx;
    let gwcy;

    function checkGameOver() {
      if (checkIndex >= 3) {
        successText.text = "Mission Complate";
        successText.visible = true;
        game.bGameOver = true;
        return true;
      } else {
        return false;
      }
    }

    function createText(x,y,str,opt) {
      opt.font = 'normal normal bold medium hand';
      opt.fontWeight = 100; 
      var textObj = game.add.text(x, y, str ,opt);
      return textObj;
    }

    function addMarker() {
      for (let i = 0, len = plant_arr.length - 1; i < len; ++i) {
        const need_type = input_arr[i];
        const mark_name = type_map[need_type];
        const y = plant_arr[i].y + plant_arr[i+1].y;
        const marker = makePlante(mark_name,0.8, 100,parseInt(y/2));
        marker.visible = false;
        marker_arr[i] = marker;
      }
    }

    const appendPlante = () => {
      const random_ball = `ball${_.random(1,6)}`;
      const random_radius = _.random(0.2,0.35);
      let new_x = 5000;
      let new_y = 200;
      if (plant_arr.length > 0) {
        const last_plant = plant_arr[plant_arr.length - 1];
        new_x = last_plant.x + _.random(50,100) * (_.shuffle([-1,1])[0]);
        new_y = last_plant.y + random_radius * 400 + 100; // 两个飞船的大小;
      }
      var plant = makePlante(random_ball,random_radius,new_x,new_y);
      if (_.random(0,1,true) < 0.3) {
        makePlante("ball-ring",random_radius,new_x,new_y);
      }
      plant_arr.push(plant);

      const random_ship = `ship${_.random(1,3)}`;
      const random_ship_speed = _.random(0.03,0.07);
      const sp = addNewBot(random_ship,random_ship_speed);
      attachRunner(sp,plant)
      sp_arr.push(sp);
    };

    function create () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        game.scale.setResizeCallback(_.throttle(function onResize(scale) {
          scale.setGameSize(
          game.parent.clientWidth * deviceRatio,
          game.parent.clientHeight * deviceRatio)
          game.input.scale = new Phaser.Point(deviceRatio, deviceRatio)
        }, 500), this)
        game.world.setBounds(0, 0, 10000, 10000)

        gwcx = game.world.centerX;
        gwcy = game.world.centerY;
        
        hitSound = game.add.audio('hit_sound');
        missSound = game.add.audio('miss_sound');

        timer = game.time.create(false);
        timer.start();

        //load plante
        for (let i = 0; i < 10; ++i) {
          appendPlante();
        }

        //显示操作的图标
        addMarker();


        scoreText = createText(16, 16, '', { fontSize: '32px', fill: '#000'  });
        timerText = createText(450, 16, '', { fontSize: '32px', fill: '#000'  });
        missText = createText(gwcx - 300, gwcy - 300, '', { fontSize: '32px', fill: '#FF3300'  });
        missText.visible = false;
        successText = createText(gwcx, gwcy, '', { fontSize: '40px', fill: '#FF3300'  });
        setAnchorCenter(successText);
        successText.visible = false;
        dommyGetFont(() => {
          scoreText.text = "Score : 0";
          missText.text = "Miss";
          successText.text = "Mission Complate";
        })

        finish_sp = game.add.sprite(0,-2000,"finish_bg");
        finish_sp.width = width;
        finish_sp.height = height;
    }

    let ball_radius = 10;

    let finish_sp;

    var rad = 0;
    var s2_rad = 0;
    var cooldown = false;

    var sp_arr = [];
    var plant_arr = [];
    var checkIndex = 0;

    const finishAnimation = () => {
      if (game.bGameOver) {
        if (finish_sp.y <= 0 ) {
          finish_sp.y += 5;
        }  
      }
    };

    const getNowDistance = () => {
      const cp_from = sp_arr[checkIndex];
      const cp_to = sp_arr[checkIndex + 1];
      if (!cp_to) {
        return 999;
      }
      let now_dist = getDistance(cp_from,cp_to);
      return now_dist;
    };

    function update() {

      if (checkGameOver()) {
        return ;
      }

      if (scoreText) {
        scoreText.text = "Score: " + score;
        setLeftTime();
      }

      const worldCenterX = game.world.centerX;
      const worldCenterY = game.world.centerY;

      plant_arr.forEach((one) => {
        one.rotation += one.rotation_speed;
      });

      

      sp_arr.forEach((one,index) => {
        if (index === checkIndex || index === checkIndex + 1) {
          one.visible = true;
        } else {
          one.visible = false;
        }
        one.children[0].visible = false;
      });

      marker_arr.forEach((one) => {
        one.visible = false;
      });

      let now_dist = getNowDistance();
      const cp_from = sp_arr[checkIndex];
      const cp_to = sp_arr[checkIndex + 1];

      if (now_dist < 200) {
        bTimeGap = true;
        marker_arr[checkIndex].visible = true;
        cp_from.children[0].visible = true;
        cp_to.children[0].visible = true;
      } else {
        bTimeGap = false;
      }

      for (let i = 0, len = sp_arr.length; i < len; ++i) {
        var sp = sp_arr[i];
        sp.selfRad += sp.mSpeed;
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

      // let a = smCamScale.getValue()
      // let b = smCamX.getValue()
      // let c = smCamY.getValue()

      // console.log(camScale.toFixed(3), camX.toFixed(3), camY.toFixed(3), a.toFixed(3),b.toFixed(3),c.toFixed(3))

      game.camera.scale.setTo(smCamScale.getValue())
      game.camera.x = smCamX.getValue()
      game.camera.y = smCamY.getValue()
    }

    function setLeftTime() {
      const elapseTime = game.time.totalElapsedSeconds();
      const max_time = 999;
      const time_left = (max_time - elapseTime).toFixed(1);
      if (time_left <= 0) {
        successText.text = "你失败了";
        successText.visible = true;
      }
      if (!timerText) {
        return;
      }
      timerText.text = "Time Left: " + time_left;
    }

    function render() {
      finishAnimation();

      game.debug.cameraInfo(game.camera, 32, 64)
    }

};
