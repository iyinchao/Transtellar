function initVue() {
    const app = new Vue({
        template: '#vue-root',
        data: function () {
            return {
                state: 'intro'
            }
        }
    })
    
    app.$mount('#ui')

    window.$ui = app
}
