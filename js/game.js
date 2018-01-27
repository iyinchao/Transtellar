window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: preload, create: create ,update: update, render: render});

    var missText;
    var score = 0;
    var scoreText;
    let plant_1;
    let plant_2;
    var missSound;
    var hitSound;
    hammerInit();

    var bTimeGap = false;

    var input_arr = ["tap","panleft","panright"]

    function hammerInit() {
      var hammertime = new Hammer(window.document, {});
      const evDebonceCb = _.debounce((ev) => {
        if (bTimeGap) {
          const evType = ev.type;
          if (evType === input_arr[checkIndex]) {
            const iNowDist = parseInt(getNowDistance());
            hitSound.play();
            score += iNowDist;
            checkIndex += 1;
            checkGameOver();
          } else {
            missSound.play();
          }
          console.log("checkIndex move %d",checkIndex);
        }
      },0);
      hammertime.on('tap panleft panright press', evDebonceCb);
    }

    function preload () {
        //game.load.image('logo', 'image/phaser.png');
				game.load.spritesheet('button', 'image/button_sprite_sheet.png', 193, 71);
        game.load.atlasJSONHash('bot', 'assets/sprites/running_bot.png', 'assets/sprites/running_bot.json');
        game.load.image('wizball', 'assets/sprites/wizball.png');
        game.load.image('shinyball', 'assets/sprites/shinyball.png');
        game.load.image('boom', 'assets/sprites/diamond.png');
        game.load.audio('bgm', "assets/audio/bg.mp3");
        game.load.audio('hit_sound', "assets/audio/split.mp3");
        game.load.audio('miss_sound', "assets/audio/shrink.mp3");
    }

    function makePlante(texture,radius,s_x,s_y) {
        var plante = game.add.sprite(s_x,s_y,texture);
        plante.width = radius * 2;
        plante.height = radius * 2;
        plante.selfRadius = radius;
        setAnchorCenter(plante);
        return plante;
    }

    function setAnchorCenter(sprite) {
      sprite.anchor.setTo(0.5,0.5);
    }

    function addNewBot(texture,speed) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      s.scale.setTo(2, 2);
      s.animations.add('run');
      s.animations.play('run', 10, true);
      s.selfRad = 0;
      s.mSpeed = speed;
      var boom = addBoom("boom");
      boom.visible = false;
      s.addChild(boom);
      console.log(s);
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

    let gwcx;
    let gwcy;

    function checkGameOver() {
      if (checkIndex > 3) {
        successText.visible = true;
        return true;
      } else {
        return false;
      }
    }

    function create () {
        game.stage.backgroundColor = "#4488AA";
        gwcx = game.world.centerX;
        gwcy = game.world.centerY;
        
        hitSound = game.add.audio('hit_sound');
        missSound = game.add.audio('miss_sound');

        //load plante
        p1_rad = 100; 
        p2_rad = 40; 
        plant_1 = makePlante("wizball",100,100,200);
        plant_2 = makePlante("shinyball",50,300,200);
        plant_3 = makePlante("wizball",80,500,200);
        plant_4 = makePlante("shinyball",100,750,200);
        plant_arr.push(plant_1);
        plant_arr.push(plant_2);
        plant_arr.push(plant_3);
        plant_arr.push(plant_4);

        //speed 角速度
        s1 = addNewBot("bot",0.05);
        attachRunner(s1,plant_1);

        s2 = addNewBot("bot",0.03);
        attachRunner(s2,plant_2);

        s3 = addNewBot("bot",0.07);
        attachRunner(s3,plant_3);

        s4 = addNewBot("bot",0.06);
        attachRunner(s4,plant_4);

        sp_arr.push(s1);
        sp_arr.push(s2);
        sp_arr.push(s3);
        sp_arr.push(s4);

        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'  });

        missText = game.add.text(gwcx - 300, gwcy - 300, 'Miss', { fontSize: '32px', fill: '#FF3300'  });
        missText.visible = false;

        successText = game.add.text(30, 30, 'Mission Complate', { fontSize: '80px', fill: '#FF3300'  });
        successText.visible = false;
    }

    let ball_radius = 10;


    var rad = 0;
    var s2_rad = 0;
    var cooldown = false;

    var sp_arr = [];
    var plant_arr = [];
    var checkIndex = 0;

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


      scoreText.text = "Score: " + score;

      const worldCenterX = game.world.centerX;
      const worldCenterY = game.world.centerY;

      rotation_speed = 0.01;
      plant_1.rotation += rotation_speed;
      plant_2.rotation += rotation_speed;
      plant_3.rotation += rotation_speed;

      sp_arr.forEach((one) => {
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

    function render() {
      //game.debug.spriteInfo(s, 20, 32);
    }

};
