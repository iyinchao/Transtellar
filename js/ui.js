var introLogoAni = -1

function initVue() {
    const app = new Vue({
        template: '#vue-root',
        data: function () {
            return {
                state: 'intro',
                introActive: false
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
                }
            },
            onWindowResizeThrottle () {
                if (document.body.clientHeight > document.body.clientWidth) {
                    this.$refs.logoWrapper.style.height = '100vw';
                    this.$refs.logoWrapper.style.width = '100vw';
                } else {
                    this.$refs.logoWrapper.style.height = '100vh';
                    this.$refs.logoWrapper.style.width = '100vh';
                }
            },
            setState : function(stateName) {
                this.state = stateName;
            },
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
