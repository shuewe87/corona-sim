<template>
    <div :style="fullSize">
    <svg :style="fullSize">
        <circle v-bind:cx="cx" v-bind:cy="cy" v-bind:r="radius" stroke="grey"  :fill="getColor" opacity=0.6 />
    </svg>
    </div>
</template>

<script>
export default {
  name: 'human',
  props: {
    cx: Number,
    cy: Number,
    timeInfected: Number,
    health: Number,
    radius: Number
  },
  computed:{ 
      fullSize(){
        return {width:"100%",height:"100%"};
        },
      getColor(){
        if(this.health == -100){
            return "black";
        }
        if(this.health == 100 && this.timeInfected > 0){
              return "white";
        }
        if(this.health > 0){
              return "green";
        }
        return "red";
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div{
    position:absolute;
}
</style>
