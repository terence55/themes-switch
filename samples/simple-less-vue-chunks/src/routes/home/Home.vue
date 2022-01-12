<template>
  <div class="home">
    <div id="root" class="main">
      <div class="title">Home</div>
      <button v-on:click="gotoUser()">Goto User</button>
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
import './Home.less';
import { switchTheme, getThemes } from '../../../../../src/index';

export default {
  name: 'Home',
  data() {
    return {
      themes: getThemes()
    }
  },
  methods: {
    changeTheme(key) {
      switchTheme({theme: key})
    },
    gotoUser() {
      this.$router.push('/user');
    }
  }
}
</script>
