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

const translate = function(weatherName) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: 'key=trnsl.1.1.20150220T075029Z.9cf93bf0c577ba4e.fd759dcc8e44209dc60e5046affe74f9db4bde05'
        };
        options.body += "&text=sky " + weatherName + "&lang=en-ru";
        fetch('https://translate.yandex.net/api/v1.5/tr.json/translate', options).then(function(response) {
            if (response.status === 200) {
                response.json().then(function (result) {
                    resolve(result.text[0].substring(5));
                });
            } else {
                resolve(weatherName);
            }
        });
    });
};

export default {
    state: {
        weather: null,
        showWeather: false,
    },

    getters: {
        weatherInfo(state) {
            return state.weather;
        },
        showWeather(state) {
            return state.showWeather;
        }
    },

    mutations: {

        setWeather(state, data) {
            state.weather = data;
        },
        showWeather(state, bool) {
            state.showWeather = bool;
        }
    },
    actions: {
        async getWeather({commit}, payload) {
            let cityName = payload.cityName;
            commit("showWeather", false);
            try {
                await getWeather(cityName).then((response)=>{

                    commit("weatherResponseStatus", response.status);

                    if (response.status !== 200) {
                        console.log("Сервис погоды https://openweathermap.org/ не нашел такого города" + cityName);
                    } else {
                        response.json().then(function (data) {
                            let weatherName = data.weather[0].main;
                            translate(weatherName).then((russWeatherName)=> {
                                data.weather[0].main = russWeatherName;
                                commit("setWeather", data);
                                commit("showWeather", true);
                                console.log(data);
                            });
                        });
                    }
                });
            } catch (e) {
                commit("weatherResponseStatus", 500);
            }

        }
    },

}