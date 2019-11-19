export default {
    state: {
        activeCity: {
            id: 0,
            name: "",
        },
        cities: [
            {
                id: 1,
                name: "Барнаул",
                active: false,
            },
            {
                id: 2,
                name: "Москва",
                active: false,
            }
        ]
    },
    getters: {
        cities(s) {
            return s.cities;
        },
        activeCity(s) {
            return s.activeCity;
        }
    },
    mutations: {
        changeCity(state, activeId) {
            state.cities.forEach((city) => {
                if(activeId === city.id) {
                    city.active = true;
                    state.activeCity = city;
                } else {
                    city.active = false;
                }
            });
        }
    },
    actions: {
        changeCity({commit}, payload) {
            commit("changeCity", payload.activeCityId);
        }
    }
}