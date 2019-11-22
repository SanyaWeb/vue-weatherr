<template>
    <div class="weather-result">
        <preloader v-if="preloader" />
        <div v-else>
            <div class="weather-result__head">{{cityName}}: {{weatherInfo.main.temp}} C&deg; {{weatherInfo.weather[0].main}}</div>
            <div class="weather-result__info">
                <div class="weather-result__attrs">
                    <div class="weather-result__attr">Ветер: </div>
                    <div class="weather-result__attr">Влажность: </div>
                    <div class="weather-result__attr">Давление: </div>
                </div>
                <div class="weather-result__values">
                    <div class="weather-result__value">{{weatherInfo.wind.speed}} м/с</div>
                    <div class="weather-result__value">{{weatherInfo.main.humidity}} %</div>
                    <div class="weather-result__value">{{parseInt(weatherInfo.main.pressure*0.75)}} мм. рт. ст</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import preloader from "../preloader/preloader";
    export default {
        name: "weatherResult",

        computed: {
            preloader() {
                return !this.$store.getters.showWeather;
            },
            cityName() {
                return this.$store.getters.activeCity.name;
            },
            weatherInfo() {
                return this.$store.getters.weatherInfo;
            },
        },
        components: {
            preloader
        }
    }
</script>
<style src="./weatherResult.css" scoped></style>