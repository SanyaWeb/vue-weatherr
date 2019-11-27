<template>
    <div class="city-list">
        <div class="city-list__header" @click="toggleList">
            <span class="city-list__header-name">Выбрать/изменить город</span><span class="city-list__header-icon"></span>
        </div>
        <div class="city-list__select" :class="{'city-list__select_open': showList}">
            <form class="city-list__add" @submit.prevent="addCity">
                <input class="city-list__add-input" type="text" v-model="newCity" placeholder="Добавить город" />
                <button class="city-list__add-button">+</button>
                <span v-if="cityError" class="info info_error">{{cityErrorText}}</span>
            </form>

            <div class="city-list__options">
                <div class="city-list__option" v-for="city in cities" :key="city.id" :class="{'city-list__option_active': city.active}">
                    <label class="city-list__option-label" >
                        <input hidden type="radio" name="city" :value="city.id" v-model="activeCityId" @change="changeCity"  />
                        <span class="city-list__city-name">{{city.name}}</span>
                    </label>
                    <span :data-city-id="city.id" class="city-list__option-close" @click="deleteCity">&times;</span>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "cityList",
        data: function() {
            return {
                showList: false,
                activeCityId: 0,
                newCity: "",
                cityError: false,
                cityErrorText: ""
            }
        },
        computed: {
            cities() {
                return this.$store.getters.cities;
            },
            weatherResponseStatus() {
                return this.$store.getters.responseStatus;
            }
        },
        async mounted() {
            await this.$store.dispatch("getUserCities", {cities: this.$store.getters.cities});
            this.activeCityId = this.$store.getters.activeCity.id;
        },
        methods: {
            toggleList() {
                this.cityError = false;
                this.cityErrorText = "";
                this.showList = !this.showList;
            },
            deleteCity(e) {
                let cityId = e.target.dataset.cityId;

                this.$store.dispatch("deleteCity", {cityId});
            },
            changeCity(e) {
                this.toggleList();
                this.cityError = false;
                this.cityErrorText = "";
                if(e.target.checked) {
                    this.$store.dispatch("changeCity", {activeCityId: this.activeCityId});
                }
            },
            async addCity() {
                await this.$store.dispatch("addCity", {cityName: this.newCity});

                this.activeCityId = this.$store.getters.activeCity.id;

                if(this.weatherResponseStatus === 200) {
                    this.showList = !this.showList;
                    this.newCity = "";
                } else {
                    this.cityError = true;
                    this.cityErrorText = "Город не найден";
                }

            }
        }
    }
</script>
<style src="./cityList.css"></style>

