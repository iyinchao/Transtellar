function initVue() {
    const app = new Vue({
        template: '#vue-root',
        data: function () {
            return {
                state: 'intro'
            }
        },
        methods : {
          setState : function(stateName) {
            this.state = stateName;
          },
        }
    })
    
    app.$mount('#ui')

    window.$ui = app
}
