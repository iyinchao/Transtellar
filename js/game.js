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

    function addNewBot(texture) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      s.scale.setTo(2, 2);
      s.animations.add('run');
      s.animations.play('run', 10, true);
      return s;
    }

    function addBoom(texture) {
      var s = game.add.sprite(0,0, texture);
      setAnchorCenter(s);
      return s;
    }

    function getDistance(sp1,sp2) {
      return Math.sqrt((sp1.x-sp2.x) * (sp1.x-sp2.x) + (sp1.y-sp2.y) *(sp1.y-sp2.y));
    }

    function create () {
        game.stage.backgroundColor = "#4488AA";
        gwcx = game.world.centerX;
        gwcy = game.world.centerY;

        music = game.add.audio('bgm');
        music.play();
        
        hitSound = game.add.audio('hit_sound');
        missSound = game.add.audio('miss_sound');

        //load plante
        p1_rad = radius * 0.8; 
        p2_rad = radius * 0.4; 
        plant_1 = makePlante("wizball",p1_rad,gwcx,gwcy);
        plant_2 = makePlante("shinyball",p2_rad,gwcx + p1_rad + p2_rad ,gwcy - p1_rad - p2_rad);

        btn = game.add.sprite(game.world.centerX + p1_rad, game.world.centerY - p1_rad, 'button');
        setAnchorCenter(btn);
        btn.scale.setTo(0.7, 0.7);

        s = addNewBot("bot");
        s_boom = addBoom("boom");
        s.addChild(s_boom);
        s2 = addNewBot("bot");
        s2_boom = addBoom("boom");
        s2.addChild(s2_boom);
        s2_boom.visible = false;

        scoreText = game.add.text(width - 300, 16, 'score: 0', { fontSize: '32px', fill: '#000'  });

        missText = game.add.text(gwcx - 300, gwcy - 300, 'Miss', { fontSize: '32px', fill: '#FF3300'  });
        missText.visible = false;
    }

    let ball_radius = 10;


    var rad = 0;
    var s2_rad = 0;
    var radius = 200;
    var cooldown = false;
    function update() {
      const worldCenterX = game.world.centerX;
      const worldCenterY = game.world.centerY;

      rotation_speed = 0.01;
      plant_1.rotation += rotation_speed;
      plant_2.rotation += rotation_speed;

      if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
			{
        if (cooldown) {
        
        } else {
          cooldown = true;
          setTimeout(function(){
            cooldown = false;
          },300);
          console.log("keyboard down");

          let now_x = s.x - worldCenterX;
          let now_y = s.y - worldCenterY;
          let now_dist = getDistance(s,s2);

          console.log(now_dist);
          if (now_dist < 80) {
            s_boom.visible = !s_boom.visible;
            s2_boom.visible = !s2_boom.visible;
            score += 10;
            hitSound.play();
            scoreText.text = 'Score: ' + score;
            missText.text = "Hit!";
          } else {
            missText.text = "Miss!";
            missSound.play();
          }
          missText.visible = true;
          setTimeout(() => {
              missText.visible = false;
          },300);
        }
			}
      rad += 0.05;
      s.x = worldCenterX + radius * Math.cos(rad);
      s.y = worldCenterY + radius * Math.sin(rad);

      s2_rad += 0.03;
      s2_s_x = worldCenterX + plant_1.selfRadius + plant_2.selfRadius;
      s2_s_y = worldCenterY - plant_1.selfRadius - plant_2.selfRadius;
      s2_run_radius = plant_2.selfRadius * 1.2;
      s2.x = s2_s_x + s2_run_radius * Math.cos(s2_rad);
      s2.y = s2_s_y + s2_run_radius * Math.sin(s2_rad);

    }

    function render() {
      game.debug.spriteInfo(s, 20, 32);
    }

};
