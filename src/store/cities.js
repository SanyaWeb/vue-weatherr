import idb from './indexedDb';

const weatherDb = new idb();

const idbOptions = {
    database: "Weather",
    version: 1,
    tables: [
        {
            name: "CitiesList",
            keyPath: "id",
            autoIncrement: true,
            index: [{ name: "name", unique: false}]
        }
    ]
};

const getWeather = function(cityName) {
    const fethcOptions = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        }
    };
    const requestUrl = 'https://openweathermap.org/data/2.5/weather/?appid=b6907d289e10d714a6e88b30761fae22&q='+cityName+'&units=metric';
    return fetch(requestUrl, fethcOptions);
};

const defaultCities = [
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
];

export default {
    state: {
        activeCity: {
            id: 0,
            name: "",
        },
        cities: [...defaultCities],
        weatherResponseStatus: 500
    },
    getters: {
        cities(s) {
            return s.cities;
        },
        activeCity(s) {
            return s.activeCity;
        },
        weatherResponseStatus(state) {
            return state.weatherResponseStatus;
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
        },
        activeCity(s, city) {
            s.activeCity = city;
        },
        setCities(state, cities) {
            state.cities = cities;
            state.cities.forEach((city) => {
                if(city.active) {
                    state.activeCity = city;
                }
            });
        },
        weatherResponseStatus(state, status) {
            state.weatherResponseStatus = status;
        }
    },
    actions: {
        async changeCity({dispatch, commit, state}, payload) {

            let oldActive = {...state.activeCity};
            oldActive.active = false;

            commit("changeCity", payload.activeCityId);

            let changeCities = oldActive.id ? [oldActive, state.activeCity] : [state.activeCity];

            await weatherDb.insert ("CitiesList", changeCities, function(isInsert, responseText) {
                console.log(isInsert, "---", responseText);
            });

            await dispatch("getWeather", {cityName: state.activeCity.name});

        },

        async addCity({dispatch, commit, state}, payload) {

            /** Проверка города на валидность */
            let validCity = false;

            let newCity = payload.cityName.toLowerCase();
            newCity = payload.cityName[0].toUpperCase() + payload.cityName.slice(1);

            if(typeof payload.cityName === "string" && payload.cityName.length) {

                /** Нет ли уже этого города в списке? */
                let exist = state.cities.filter((city) => {
                    return city.name === newCity;
                });
                if(!exist.length) {
                    /** Найдет ли сервис такой город? */
                    await dispatch("getWeather", {cityName: newCity});
                    console.log(newCity);
                    if (state.weatherResponseStatus === 200) {
                        validCity = true;
                    } else {
                        commit("showWeather", true);
                    }
                } else {
                    /** Если существует то изменяем город */
                    dispatch("changeCity", {activeCityId: exist[0].id });
                }
            }

            if(validCity) {

                let newCityState = {
                    name: newCity,
                    active: true,
                };

                let oldActive = {...state.activeCity};
                oldActive.active = false;
                let changeCities = oldActive.id ? [oldActive, newCityState] : [newCityState];

                await weatherDb.insert ("CitiesList", changeCities, function(isInsert, responseText) {
                    console.log(isInsert, "---", responseText);
                });
                await weatherDb.select("CitiesList", (isSelected, result)=> {
                    if(isSelected) {
                        commit("setCities", result.reverse());
                        console.log("state after add - ", state);
                    } else {
                        console.log("error select");
                    }
                });
            }
        },

        async deleteCity({dispatch, state}, payload) {
            console.log(payload.cityId);
            await weatherDb.delete ("CitiesList", parseInt(payload.cityId) , (isDeleted, responseText) => {
                if(isDeleted) {
                    console.log("success", " - ", responseText);
                } else {
                    console.log("error delete");
                }
            });

            dispatch("getUserCities", {cities: [...defaultCities]});

        },

        async getUserCities({dispatch, commit, state}, payload) {

            await weatherDb.init(idbOptions);

            let idbCitiesList = [];

            await weatherDb.select("CitiesList", (isSelected, result)=> {
                if(isSelected) {
                    idbCitiesList = result.reverse();
                } else {
                    console.log("error select");
                }
            });
            if(!idbCitiesList.length) {
                commit("setWeather", null);
                commit("showWeather", false);
                commit("activeCity", {id:0, name: ""});
                weatherDb.insert ("CitiesList", payload.cities, function(isInsert, responseText) {
                    commit("setCities", payload.cities);
                    console.log(isInsert, "---", responseText);
                });
            } else {
                commit("setCities", idbCitiesList);
                if(state.activeCity.name) {
                    dispatch("getWeather", {cityName: state.activeCity.name});
                }
                console.log("set", " - ", state);
            }
        }
    }
}