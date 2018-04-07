window.onload = function() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var game = new Phaser.Game(width, height, Phaser.AUTO, "", {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  game.bGameOver = false;
  var missText;
  let plant_1;
  let plant_2;
  var missSound;
  var hitSound;
  let hitText;
  var sp_arr = [];
  hammerInit();

  var bTimeGap = false;

  var input_arr = ["tap", "panleft", "panright"];

  function zoomAniamtion(sp) {
    const w = sp.width;
    const h = sp.height;
    game.add
      .tween(sp)
      .to({ width: 1.5 * w, height: 1.5 * h }, 600, "Linear", true, 0, 0, true);
  }

  var language_map = {
    tap: 0,
    panleft: 1,
    panright: 2,
    swipeup: 3,
    swipedown: 4
  };

  function hammerInit() {
    var hammertime = new Hammer(window.document, {});
    const evDebonceCb = _.throttle(
      ev => {
        let evType = ev.type;
        let index = language_map[evType];
        if (plant_arr[index]) {
          zoomAniamtion(plant_arr[index]);
        }
      },
      1250,
      {
        leading: true
      }
    );
    hammertime.on("tap panleft panright", evDebonceCb);
  }

  function preload() {
    game.load.image("ball1", "assets/ball-1.png");
    game.load.image("ball2", "assets/ball-2.png");
    game.load.image("ball3", "assets/ball-3.png");
    game.load.image("ball4", "assets/ball-4.png");
    game.load.image("background", "assets/img/bg.jpg");
    game.load.audio("bgm", "assets/audio/bg.mp3");
    game.load.audio("hit_sound", "assets/audio/split.mp3");
    game.load.audio("miss_sound", "assets/audio/shrink.mp3");
  }

  function makePlante(texture, radius, s_x, s_y) {
    var plante = game.add.sprite(s_x, s_y, texture);
    plante.width = radius * 2;
    plante.height = radius * 2;
    plante.selfRadius = radius;
    plante.rotation_speed = _.random(0.005, 0.015);
    setAnchorCenter(plante);
    return plante;
  }

  function addNewBot(texture, speed) {
    var s = game.add.sprite(0, 0, texture);
    setAnchorCenter(s);
    s.scale.setTo(2, 2);
    s.animations.add("run");
    s.animations.play("run", 10, true);
    s.selfRad = 0;
    s.mSpeed = speed;
    var boom = addBoom("boom");
    boom.visible = false;
    s.addChild(boom);
    console.log(s);
    return s;
  }

  function addBoom(texture) {
    var s = game.add.sprite(0, 0, texture);
    setAnchorCenter(s);
    return s;
  }

  function attachRunner(sp, plant) {
    sp.source_x = plant.x;
    sp.source_y = plant.y;
    sp.source_radius = plant.selfRadius;
  }

  function makeFinishStar(texture, radius, s_x, s_y) {
    var plante = game.add.sprite(s_x, s_y, texture);
    plante.width = radius * 2;
    plante.height = radius * 2;
    plante.selfRadius = radius;
    plante.rotation_speed = _.random(0.005, 0.015);
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

  function createText(x, y, str, opt) {
    opt.font = "normal normal bold medium hand";
    opt.fontWeight = 100;
    var textObj = game.add.text(x, y, str, opt);
    return textObj;
  }

  function create() {
    game.stage.backgroundColor = "#ffffff";

    var bg_sp = game.add.sprite(0, 0, "background");
    bg_sp.width = width;
    bg_sp.height = height;

    music = game.add.audio("hit_sound");

    gwcx = game.world.centerX;
    gwcy = game.world.centerY;

    hitSound = game.add.audio("hit_sound");
    missSound = game.add.audio("miss_sound");

    timer = game.time.create(false);
    timer.start();

    //load plante
    plant_1 = makePlante("ball1", 90, 100, 150);
    plant_2 = makePlante("ball2", 70, 300, 150);
    plant_3 = makePlante("ball3", 80, 500, 150);
    plant_4 = makePlante("ball4", 100, 700, 150);
    plant_arr.push(plant_1);
    plant_arr.push(plant_2);
    plant_arr.push(plant_3);
    plant_arr.push(plant_4);

    //speed 角速度

    hitText = createText(40, 20, "", { fontSize: "32px", fill: "#FF3300" });

    timerText = createText(40, 20, "", { fontSize: "32px", fill: "#FF3300" });

    finish_sp = game.add.sprite(0, -500, "finish_sp");
    finish_sp.width = width;
    finish_sp.height = height;
    dommyGetFont(() => {
      hitText.text = "Can Your Know Our Meaning ?";
    });
  }

  let ball_radius = 10;

  let finish_sp;

  var rad = 0;
  var s2_rad = 0;
  var cooldown = false;

  var plant_arr = [];
  var checkIndex = 0;

  const finishAnimation = () => {
    if (game.bGameOver) {
      if (finish_sp.y <= 0) {
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
    let now_dist = getDistance(cp_from, cp_to);
    return now_dist;
  };

  function update() {
    if (checkGameOver()) {
      return;
    }

    //setLeftTime();

    plant_arr.forEach(one => {
      one.rotation += one.rotation_speed;
    });

    sp_arr.forEach(one => {
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
    const max_time = 20;
    const time_left = (max_time - elapseTime).toFixed(1);
    if (time_left <= 0) {
      successText.text = "你失败了";
      successText.visible = true;
    }
    hitText.text = "Time Left: " + time_left;
  }

  function render() {
    finishAnimation();
  }
};
