const express = require('express');
const router = express.Router('redirect:false');
const data = require('../public/data');
const cors = require('cors');
const csrf = require('csurf');
/* GET home page. */

//подключаем csrf защиту
const csrfProt = csrf();
router.use(csrfProt);

//прописываем опции доступа
const corsOptions= {
    origin: 'http://localhost:3000',
    methods: 'GET,PUT,POST',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true
};

router.get('/',cors(corsOptions), function(req, res, next) {
    res.render('index', { title: 'Viberi taxi',csrfToken: req.csrfToken()});
});

router.post('/',cors(corsOptions), async function(req, res) {
    if((req.body.start)&&(req.body.end)){
        let latstart, latend, lngstart, lngend;

        let info = await (async function () {
            //location start
            let start = await data.latlng(req.body.start);
            if(start){
                latstart = start.lat;
                lngstart = start.lng;
            }else return false;
            //location end
            let end = await data.latlng(req.body.end);
            if(end){
                latend = end.lat;
                lngend = end.lng;
            }else return false;

            let res = {
                name: [],
                price: [],
                dist: [],
                time: []
            };

            data.Obj(res,await data.Maxim(req.body.start, req.body.end, latstart, lngstart, latend, lngend));
            data.Obj(res,await data.Rutaxi(latstart, lngstart, latend, lngend));
            data.Obj(res,await data.Yandex(latstart, latend, lngstart, lngend));
            //data.Obj(res,await data.Uber(latstart, lngstart, latend, lngend));
            data.Obj(res,await data.Uber1(latstart, lngstart, latend, lngend));

            return res;
        })();
        console.log(info);
        res.json(info).end();
    }
    else res.sendStatus(400);
});

module.exports = router;
