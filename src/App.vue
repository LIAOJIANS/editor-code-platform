<template>
  <div>
    <Editor 
      v-model="state"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, provide } from 'vue'
  import Editor from './packgages/editor'
  import data from './data.json'
  
  import {registerConfig as config} from './utils/elementConfig';

  export default defineComponent({

    components: {
      Editor
    },


    setup() {

      const state = ref(data)

      provide('config', config) // 穿透

      return {
        state
      }
    }
  })
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
