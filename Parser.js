const request = require('request');
const cheerio = require('cheerio');
const tress = require('tress')

module.exports.Parse = function(url, keys, callback) {
    var notices = [];
    var reqUrls = [];
    var countLoc = keys['location_id'].length;
    var locations = {
        623840: 'Брянская область',
        630270: 'Калужская область',
        654860: 'Смоленская область',
        643030: 'Орловская область',
        636030: 'Курская область',
        637680: 'Московская область'
    }

    var q = tress(function(location_id, callback) {
        var params = {};
        switch (keys['params[210]'].split('_')[1]) {
            case '280':
                params = {
                    's': 101,
                    'category_id': 9,
                    'location_id': location_id,
                    'params[210]': keys['params[210]'].split('_')[0],
                    'params[280]': keys['params[280]'],
                    'params[188][from]': keys['params[188][from]'],
                    'params[185]': keys['params[185]'],
                    'params[1374][from]': keys['params[186]'],
                    'pmax': keys['pmax']
                };
                break;
            case '278':
                params = {
                    's': 101,
                    'category_id': 9,
                    'location_id': location_id,
                    'params[210]': keys['params[210]'].split('_')[0],
                    'params[278]': keys['params[278]'],
                    'params[188][from]': keys['params[188][from]'],
                    'params[185]': keys['params[185]'],
                    'params[1374][from]': keys['params[186]'],
                    'pmax': keys['pmax']
                };
                break;
            case '241':
                params = {
                    's': 101,
                    'category_id': 9,
                    'location_id': location_id,
                    'params[210]': keys['params[210]'].split('_')[0],
                    'params[241]': keys['params[241]'],
                    'params[188][from]': keys['params[188][from]'],
                    'params[185]': keys['params[185]'],
                    'params[1374][from]': keys['params[186]'],
                    'pmax': keys['pmax']
                };
                break;
            case '259':
                params = {
                    's': 101,
                    'category_id': 9,
                    'location_id': location_id,
                    'params[210]': keys['params[210]'].split('_')[0],
                    'params[259]': keys['params[259]'],
                    'params[188][from]': keys['params[188][from]'],
                    'params[185]': keys['params[185]'],
                    'params[1374][from]': keys['params[186]'],
                    'pmax': keys['pmax']
                };
                break;

        }
        var r = request.post({
                url,
                form: params
            },
            function(err, response) {
                var currentUrl = 'https://avito.ru' + response.headers['location'];
                request.get(currentUrl, function(err, respon, body) {
                    var $ = cheerio.load(body);
                    var countPages = $('div.pagination-pages').children().last().attr('href');
                    try {
                        countPages = parseInt(countPages.match(/p=\d{0,}/)[0].replace('p=', ''));
                    } catch (err) {
                        var countPages = 1;
                    }
                    reqUrls.push({
                        url: currentUrl,
                        countPage: countPages,
                        location: locations[location_id]
                    });
                    callback();
                });
            }
        );
    }, 6);

    q.drain = function() {
        var queue = tress(function(arg, callback) {
                request.get(arg.url, function(err, res, page) {
                    var $ = cheerio.load(page);
                    var catalogs = $('.item_cars').get();
                    for (var i = 0; i < catalogs.length; i++) {
                        var $ = cheerio.load(catalogs[i]);
                        var title = $('.item-description-title-link').text().trim();
                        var about = $('.about').text().trim().replace('Отчёт по автомобилю', '');
                        var link = 'https:/avito.ru' + $('.item-description-title-link').attr('href');
                        var photoLink = 'None';
                        try {
                            photoLink = $('.item-photo>a>img').attr('src');
                            if (photoLink == 'https://www.avito.st/s/a/i/0.gif?f8b9e75')
                                photoLink = 'https:' + $('.item-photo>a>img').attr('data-srcpath');
                            else
                                photoLink = 'https:' + photoLink;
                        } catch (err) {
                            photoLink = 'None';
                        };
                        notices.push({
                            location: arg.location,
                            name: title,
                            data: [about, link, photoLink]
                        });
                    }
                    callback();
                })
            },
            10);

        queue.drain = function() {
            callback(notices);
        }

        for (var i = 0; i < reqUrls.length; i++) {
            console.log(reqUrls[i]);
            for (var j = 1; j <= reqUrls[i]['countPage']; j++) {
                var tmpUrl = reqUrls[i]['url'] + '?p=' + j;
                var arg = {
                    url: tmpUrl,
                    location: reqUrls[i]['location']
                };
                queue.push(arg);
            }
        }
    }

    for (var i = 0; i < countLoc; i++)
        q.push(keys['location_id'][i]);
}