let request = require('request');
let promiserequest = require('request-promise');
let querystring = require('querystring');

let googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCIHU1rKJYh9Fg6EE6w_PEDYEH4ekMj2Rc',
    Promise: Promise
});

async function latlng(place) {
    try {
        const response = await googleMapsClient.geocode({
            address: place
        }).asPromise();

        if(response.json.status === 'OK'){
            return response.json.results[0].geometry.location;
        }
        else return false;
    } catch (err) {
        console.error(err);
    }
}

async function Yandex(latstart, latend, lngstart, lngend) {

    let options = {
        "id": "c8771ed244734f599cb90d646f01af0c",
        "zone_name": "chelyabinsk",
        "supports_forced_surge": true,
        "parks": [],
        "requirements": {},
        "route": [[lngstart, latstart], [lngend, latend]],
        "skip_estimated_waiting": false
    };

    try {
        let response = await promiserequest({
            url: "https://taxi.yandex.ru/3.0/routestats/",
            method: "POST",
            json: true,
            headers: {
                'Content-Type': "application/json",
                'Cookie': "yandexuid=2124394431518115630; _id=c8771ed244734f599cb90d646f01af0c"
            },
            body: options
        });

        let res = {
            'name': [],
            'dist': [],
            'time': [],
            'price': []
        };
        if(response.service_levels) {
            res.time.push(response.time);
            res.dist.push(response.distance);

            for (let i = 0; i < response.service_levels.length; i++) {
                res.name.push("Yandex Taxi " + response.service_levels[i].name);
                res.price.push(response.service_levels[i].details[0].price);
            }
        }
        return await res;

    } catch (err) {
        console.error(err);
    }
}

async function Obj(res, objj){
    if(objj){
        if(objj.dist) {
            let i = 0;
            res.dist.push(objj.dist[i]);
            res.time.push(objj.time[i]);
        }
        for(let i=0;i<objj.name.length;i++){
            res.name.push(objj.name[i]);
            res.price.push(objj.price[i]);
        }
        return res;
    }
    else console.log(objj);

}

async function Rutaxi(latstart, lngstart, latend, lngend) {

    let idstr = await IDRutaxi(latstart, lngstart);
    let idend = await IDRutaxi(latend, lngend);
    let idrate = await ratesRutaxi();

    let res = {
        'name': [],
        'price': []
    };

    for (let i = 0; i < idrate.length; i++) {
        let options = {
            "city": "chel",
            "Order": {
                "rate_id": idrate[i].id,
                "points": [
                    {
                        "object_id": idstr.id,
                        "house": idstr.house
                    },
                    {
                        "object_id": idend.id,
                        "house": idend.house
                    }],
                "is_preorder": 0
            }
        };

        try {
            let response = await promiserequest({
                url: "https://api.rutaxi.ru/api/1.0.0/cost/",
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    'X-Parse-Application-Id': "App g1iyt78Tou38ELWXYrBxLmBr0nqrB44c"
                },
                json: true,
                strictSSL: false,
                body: options
            });

            res.price.push(response.data.cost);
            res.name.push('Rutaxi ' + idrate[i].name);

        } catch (err) {
            console.error(err);
        }
    }
    return await res;
}

async function ratesRutaxi() {
    options = {
        "city": "chel"
    };
    try {
        let response = await promiserequest({
            url: "https://api.rutaxi.ru/api/1.0.0/rates/",
            method: "GET",
            json: true,
            headers: {
                'Content-Type': "application/json",
                'X-Parse-Application-Id': "App g1iyt78Tou38ELWXYrBxLmBr0nqrB44c"
            },
            strictSSL: false,
            body: options
        });

        return response.data.rates;

    } catch (err) {
        console.error(err);
    }
}

async function IDRutaxi(lat, lng) {

    options = {
        "latitude": lat,
        "longitude": lng,
        "city": "chel"
    };
    try {
        let response = await promiserequest({
            url: "https://api.rutaxi.ru/api/1.0.0/near/",
            method: "POST",
            json: true,
            headers: {
                'Content-Type': "application/json",
                'X-Parse-Application-Id': "App g1iyt78Tou38ELWXYrBxLmBr0nqrB44c"
            },
            strictSSL: false,
            body: options
        });
        return response.data.objects[0];

    } catch (err) {
        console.error(err);
    }
    //console.log(JSON.stringify(response.body,'',4));
}

async function Maxim(start, end, latstart, lngstart, latend, lngend) {

    let csrf = await getToken();

    Token = csrf.token;
    cookie = csrf.cookie;

    let res = {
        'name': [],
        'price': []
    };

    let tariff = {
        'id': [1,2,3],
        'name':['Эконом','Комфорт','Бизнес']

    };
    for (let i = 0; i<tariff.id.length; i++) {
        options = {
            'OrderForm[baseId]': 4,
            'OrderForm[tariffId]': tariff.id[i],
            'AddressForm[0][pointField]': start,
            'AddressForm[0][latitude]': latstart,
            'AddressForm[0][longitude]': lngstart,
            'AddressForm[1][pointField]': end,
            'AddressForm[1][latitude]': latend,
            'AddressForm[1][longitude]': lngend
        };
        //const formBody1 = Object.keys(options).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(options[key])).join('&');
        let formBody = querystring.stringify(options);

        try {
            let response = await promiserequest({
                url: "https://client.taxsee.com/service/calculate/?org=maxim&baseId=4&tax-id=SrvMpYHWr%2FWymRmBUdoa6isCaQcmnFtb0xmL4kP74iIgk8vmpGZoL%2BOsQU0m3lMOMwpCkSyA%2FU4qVJmAQaXbTw%3D%3D",
                method: "POST",
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded",
                    'X-CSRF-Token': Token,
                    'Cookie': cookie
                },
                body: formBody
            });
            if (response) {
                let from = response.indexOf('price', 30);
                let to = response.search('/span');
                let go = response.substring(from + 8, to - 1);
                res.price.push(go);
                res.name.push('Maxim ' + tariff.name[i]);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return res;
}

async function getToken() {

    try {
        let response = await promiserequest({
            url: "https://client.taxsee.com/frame/?tax-id=SrvMpYHWr%2FWymRmBUdoa6isCaQcmnFtb0xmL4kP74iIgk8vmpGZoL%2BOsQU0m3lMOMwpCkSyA%2FU4qVJmAQaXbTw%3D%3D&fp=d526896f1310a3431da23ee6a55fb970&c=ru&l=ru&b=4&p=1&theme=maximV2",
            method: "GET",
            resolveWithFullResponse: true
        });
        let token = response.body;
        let from = token.search('token');
        let to = token.search('<title>');
        token = token.substring(from + 16, to - 7); //Token

        let cookie = response.headers['set-cookie'];

        return {token: token, cookie: cookie};

    } catch (err) {
        console.error(err);
    }
}

async function Uber(latstart, lngstart, latend, lngend) {

    options = {
        "pickupLat": latstart,
        "pickupLng": lngstart,
        "destinationLat": latend,
        "destinationLng": lngend
    };

    let res = {
        'name': [],
        'price': []
    };

    let bodyopt = querystring.stringify(options);
    let site = "https://www.uber.com/api/fare-estimate?"

    try {
        let response = await promiserequest({
            url: site + bodyopt,
            method: "GET",
            json: true
        });
        console.log(response);
        for (let i = 0; i < response.prices.length; i++) {
            res.price.push(response.prices[i].fareString);
            res.name.push(response.prices[i].vehicleViewDisplayName);
        }

        return res;

    } catch (err) {
        console.error(err);
    }

}

async function Uber1(latstart, lngstart, latend, lngend) {

    options = {
        "start_latitude": latstart,
        "start_longitude": lngstart,
        "end_latitude": latend,
        "end_longitude": lngend
    };

    let res = {
        'name': [],
        'price': []
    };

    let bodyopt = querystring.stringify(options);
    let site = "https://api.uber.com/v1.2/estimates/price?";

    try {
        let response = await promiserequest({
            url: site + bodyopt,
            method: "GET",
            json: true,
            headers:{
                'Authorization': "Token 4d6ohusG9oItrfRuuI59Q1-4ka-J5Vahsu8I-2aU"
            }
        });
        console.log(response);
        if(response.prices) {
            for (let i = 0; i < response.prices.length; i++) {
                res.price.push(response.prices[i].estimate);
                res.name.push(response.prices[i].display_name);
            }
        }else console.log(response);
        return res;

    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    latlng: latlng,
    Yandex: Yandex,
    Rutaxi: Rutaxi,
    Maxim: Maxim,
    Uber: Uber,
    Obj: Obj,
    Uber1: Uber1
};
