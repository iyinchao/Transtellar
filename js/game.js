

window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: preload, create: create ,update: update, render: render});

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
        game.load.image('ship', 'assets/pc-1.png');
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
      //s.animations.add('run');
      //s.animations.play('run', 10, true);
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
        const x = plant_arr[i].x + plant_arr[i+1].x;
        const marker = makePlante(mark_name,0.8, parseInt(x/2), 300);
        marker.visible = false;
        marker_arr[i] = marker;
      }
    }

    function create () {
        game.stage.backgroundColor = "#ffffff";

        var bg_sp = game.add.sprite(0,0,"background");
        bg_sp.width = width; 
        bg_sp.height = height; 
        gwcx = game.world.centerX;
        gwcy = game.world.centerY;
        
        hitSound = game.add.audio('hit_sound');
        missSound = game.add.audio('miss_sound');

        timer = game.time.create(false);
        timer.start();

        //load plante
        p1_rad = 100; 
        p2_rad = 40; 
        plant_1 = makePlante("ball1",0.4,100,200);
        plant_2 = makePlante("ball2",0.2,300,200);
        plant_3 = makePlante("ball3",0.3,500,200);
        ball_ring = makePlante("ball-ring",0.3,500,200);
        plant_4 = makePlante("ball4",0.25,750,200);
        plant_arr.push(plant_1);
        plant_arr.push(plant_2);
        plant_arr.push(plant_3);
        plant_arr.push(plant_4);

        //显示操作的图标
        addMarker();

        //speed 角速度
        s1 = addNewBot("ship",0.05);
        attachRunner(s1,plant_1);

        s2 = addNewBot("ship",0.03);
        attachRunner(s2,plant_2);

        s3 = addNewBot("ship",0.07);
        attachRunner(s3,plant_3);

        s4 = addNewBot("ship",0.06);
        attachRunner(s4,plant_4);

        sp_arr.push(s1);
        sp_arr.push(s2);
        sp_arr.push(s3);
        sp_arr.push(s4);

        scoreText = createText(16, 16, '', { fontSize: '32px', fill: '#000'  });
        timerText = createText(500, 16, '', { fontSize: '32px', fill: '#000'  });
        missText = createText(gwcx - 300, gwcy - 300, '', { fontSize: '32px', fill: '#FF3300'  });
        missText.visible = false;
        successText = createText(30, 30, '', { fontSize: '80px', fill: '#FF3300'  });
        successText.visible = false;
        dommyGetFont(() => {
          scoreText.text = "Score : 0";
          missText.text = "Miss";
          successText.text = "Mission Complate";
        })

        finish_sp = game.add.sprite(0,-500,"finish_bg");
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

      sp_arr.forEach((one) => {
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
    }

};
