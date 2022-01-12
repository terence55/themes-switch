<template>
  <div class="user">
    <div id="root" class="main">
      <div class="title">User</div>
      <button v-on:click="gotoHome()">Goto Home</button>
      <div id='buttons'>
        <div class="title">Title</div>
        <div class="desc">Description</div>
        <div v-for="item in Object.keys(themes)" :key="item">
          <button v-on:click="changeTheme(item)">{{item}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import './User.less';
import { switchTheme, getThemes } from '../../../../../src/index';

export default {
  name: 'User',
  data() {
    return {
      themes: getThemes()
    }
  },
  methods: {
    changeTheme(key) {
      switchTheme({theme: key})
    },
    gotoHome() {
      this.$router.push('/home');
    }
  }
}
</script>
