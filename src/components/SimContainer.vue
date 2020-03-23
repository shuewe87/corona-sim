<template>
  <div class="sim-container" :style="style">
    <Human v-for="human in humans" :key="human.id" v-bind:health="human.health" v-bind:cx="human.x" v-bind:cy="human.y" v-bind:timeInfected="human.timeInfected" />
  </div>
</template>

<script>
import Human from './Human.vue'

export default {
  name: 'sim-container',
  props: {
    humans: Array,
    width: String,
    height: String
  },
  computed: {
      style () {
        return {
          width: this.width,
          height:  this.height} 
             }
    },
  components: {
    Human
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.sim-container{
    position: relative;
    background-color: grey;
    border: 2px solid black;
}
</style>
