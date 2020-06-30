<template>
  <div class="home">
    <div id="root" class="main">
      <div class="title">Home</div>
      <button v-on:click="gotoUser()">Goto User</button>
      <div id='buttons'>
        <div class="title">Title</div>
        <div class="desc">Description</div>
        <div v-for="item in Object.keys(themes)" :key="item.clmuCode">
          <button v-on:click="changeTheme(item)">{{item}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import './Home.less';
import { changeTheme } from '../../../../../src/index';

export default {
  name: 'Home',
  data() {
    return {
      themes: process.themes
    }
  },
  methods: {
    changeTheme(key) {
      changeTheme(key, this.themes[key])
    },
    gotoUser() {
      this.$router.push('/user');
    }
  }
}
</script>
