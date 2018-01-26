window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: preload, create: create ,update: update, render: render});

    var missText;
    var score = 0;
    var scoreText;

    function preload () {
        game.load.image('logo', 'image/phaser.png');
				game.load.spritesheet('button', 'image/button_sprite_sheet.png', 193, 71);
        game.load.atlasJSONHash('bot', 'assets/sprites/running_bot.png', 'assets/sprites/running_bot.json');
    }

    function create () {
        game.stage.backgroundColor = "#4488AA";

        btn = game.add.sprite(game.world.centerX + radius, game.world.centerY, 'button');
        btn.anchor.setTo(0.5, 0.5);
        btn.scale.setTo(0.7, 0.7);

        s = game.add.sprite(game.world.centerX, game.world.centerY, 'bot');
        s.anchor.setTo(0.5, 0.5);
        s.scale.setTo(2, 2);
        s.animations.add('run');
        s.animations.play('run', 10, true);

        scoreText = game.add.text(width - 300, 16, 'score: 0', { fontSize: '32px', fill: '#000'  });
        missText = game.add.text(game.world.centerX + radius, game.world.centerY - 200, 'Miss', { fontSize: '32px', fill: '#FF3300'  });
        missText.visible = false;
    }


    var rad = 0;
    var radius = 200;
    var cooldown = false;
    function update() {
      const worldCenterX = game.world.centerX;
      const worldCenterY = game.world.centerY;

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

          console.log(now_x);
          if (Math.abs(now_x - radius) < 10) {
            score += 10;
            scoreText.text = 'Score: ' + score;
            missText.text = "Hit!";
          } else {
            missText.text = "Miss!";
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
    }

    function render() {
      game.debug.spriteInfo(s, 20, 32);
    }

};
