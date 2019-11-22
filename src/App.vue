<template>
    <div id="weather">
        <div class="weather-header-wrap">
            <weatherHeader />
        </div>
        <cityList />
        <weatherResult />
    </div>
</template>

<script>

  import weatherHeader from "./components/weatherHeader/weatherHeader"
  import cityList from "./components/cityList/cityList"
  import weatherResult from "./components/weatherResult/weatherResult"

  export default {
    name: 'weather',
    components: {
     weatherHeader, cityList, weatherResult
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
  max-width: 100%;
  width: max-content;
}
.weather-header-wrap {
    padding-bottom: 7px;
}
</style>
