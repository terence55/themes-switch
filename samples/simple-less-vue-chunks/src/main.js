import App from './App.vue';
import routes from './routes';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: routes,
  components: { App },
  template: '<App/>'
});
