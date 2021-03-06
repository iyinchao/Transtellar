var introLogoAni = -1

function initVue() {
    const app = new Vue({
        template: '#vue-root',
        data: function () {
            return {
                state: 'intro',
                introActive: false,
                loadingActive: false,
                arrowArr : [],
                iSingleTransIndex : 0,
                nowTime : 0,
                bHard : false,
                iFinishPlant : 0,
            }
        },
        watch: {
            state: function(nState, oState) {
                this.onStateChange(nState, oState)
            }
        },
        methods: {
            onStateChange(nState, oState) {
                if (nState === 'intro') {
                    clearTimeout(introLogoAni)
                    setTimeout(() => {
                        this.introActive = true
                    }, 300)
                    this.$nextTick(() => {
                        this.onWindowResizeThrottle()
                    })
                } else {
                    clearTimeout(introLogoAni)
                    this.introActive = false
                }

                if (nState === 'gaming') {
                    this.showLoading(true)
                }
            },
            onWindowResizeThrottle () {
                if (this.$refs.logoWrapper) {
                    if (document.body.clientHeight > document.body.clientWidth) {
                        this.$refs.logoWrapper.style.height = '100vw';
                        this.$refs.logoWrapper.style.width = '100vw';
                    } else {
                        this.$refs.logoWrapper.style.height = '100vh';
                        this.$refs.logoWrapper.style.width = '100vh';
                    }
                }
            },
            initGame () {
                this.setState('gaming')
              window.$game.state.start('gaming')
              this.iFinishPlant = 0;
            },
            onBtStartClick () {
              this.bHard = false;
              this.initGame();
            },

            onHardStartClick () {
              this.bHard = true;
              this.initGame();
            },

            onBtRestart () {
              this.initGame();
            },

            onBtnGoHome () {
              this.setState('intro')
            },
            setState : function(stateName) {
              this.state = stateName;
            },
            setFinishPlante : function(n) {
              this.iFinishPlant = n;
            },
            setLeftTime : function(t) {
              this.nowTime = t;
            },

            setTimeLineColor : function(bAdd = true) {
              if (bAdd) {
                this.$refs.timeLine.style.color = "green";
              } else {
                this.$refs.timeLine.style.color = "red";
              }
              let _this = this;
              setTimeout(function(){
                _this.$refs.timeLine.style.color = "black";
              },1500);
            },
            setSingleIndex : function(n) {
              this.iSingleTransIndex = n;
            },
            setArrowArr : function(arr) {
              var type_map = {
                "pinU"  : "mark-1",
                "pinRU" : "mark-2",
                "pinR"  : "mark-3",
                "pinRD" : "mark-4",
                "pinD"  : "mark-5",
                "pinLD" : "mark-6",
                "pinL"  : "mark-7",
                "pinLU" : "mark-8",
                "tap"   : "mark-9",
              }

              this.arrowArr = [];
              arr.forEach((one) => {
                //console.log("add %s",one);
                if (type_map[one]) {
                  this.arrowArr.push(type_map[one]);
                }
              });
            },
            showLoading: function (isShow) {
                this.loadingActive = isShow
            }
        },
        mounted () {
            if (this.state === 'intro') {
                this.onStateChange(this.state)
            }

            this.onWindowResizeThrottle()

            window.addEventListener('resize', this.onWindowResizeThrottle)
        },
        beforeDestroy () {
            window.removeEventListener('resize', this.onWindowResizeThrottle)
        }
    })
    
    app.$mount('#ui')

    window.$ui = app
}
