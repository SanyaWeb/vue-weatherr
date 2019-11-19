<template>
  <div id="weather">
    <weatherHeader />
    <cityList />
  </div>
</template>

<script>

  import weatherHeader from "./components/weatherHeader/weatherHeader"
  import cityList from "./components/cityList/cityList"

  export default {
    name: 'weather',
    components: {
     weatherHeader, cityList
    }
  }
</script>

<style>

html, body {
  margin: 0;
  padding: 0;
}

#weather {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #eeeeee;
  background: #303a97;
  margin: 0;
  padding: 10px;
  max-width: 500px;
  width: max-content;
}
</style>
