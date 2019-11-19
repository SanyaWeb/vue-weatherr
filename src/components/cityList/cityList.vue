<template>
    <div class="city-list">
        <div class="city-list__header" @click="toggleList">
            <span class="city-list__header-name">Выбрать/изменить город</span><span class="city-list__header-icon"></span>
        </div>
        <div class="city-list__select" :class="{'city-list__select_open': showList}">
            <form class="city-list__add">
                <input class="city-list__add-input" type="text" value="" placeholder="Добавить город" />
                <button class="city-list__add-button">+</button>
            </form>
            <div class="city-list__options">
                <label class="city-list__option" v-for="city in cities" :key="city.id" :class="{'city-list__option_active': city.active}">
                    <input type="radio" name="city" :value="city.id" v-model="activeCityId" @change="changeCity" /> <span class="city-list__city-name">{{city.name}}</span>
                </label>
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
            }
        },
        computed: {
            cities() {
                return this.$store.getters.cities;
            },
        },
        mounted() {
            this.activeCityId =this.$store.getters.activeCity.id;
        },
        methods: {
            toggleList() {
                this.showList = !this.showList;
            },
            changeCity(e) {
                if(e.target.checked) {
                    this.$store.dispatch("changeCity", {activeCityId: this.activeCityId});
                }
            }
        }
    }
</script>
<style src="./cityList.css"></style>

