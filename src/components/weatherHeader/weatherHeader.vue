<template>
    <div class="weather-header">
        Погода:
        <span v-if="activeCity.id">
             г. {{activeCity.name}}
        </span>
        <span v-else>
            выберите город
        </span>
    </div>

</template>

<script>

    export default {
        name: 'weatherHeader',
        computed: {
            activeCity() {
                return this.$store.getters.activeCity;
            }
        }
    }
</script>
<style src="./weatherHeader.css"></style>