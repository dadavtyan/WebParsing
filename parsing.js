const request = require('request');
const cheerio = require('cheerio');
const http = require('http');
const path  = require('path');
const fs = require('fs');
const urlUtil = require('url');
var url = "https://habr.com/";


function onRequest(request, response) {
    var parse = urlUtil.parse(request.url, true);
    view(parse,function (render) {
        response.writeHead(200,{'Content-Type': 'text/html; charset=utf-8'});
        response.write(render);
        response.end();
    });
}

function view(request, callback) {
    var page, action;
    if(request.pathname === '/'){
        action = 'render';
        page = 'index';
    }else if(request.pathname === '/ajax'){
        getData(request.query.count, callback);
        return;
    }else{
        action = 'error';
        page = 'error';
    }

    if(action === 'render'){
        callback(fs.readFileSync('./' + page + '.html'));
    }
}


function getData(count, callback) {
    request.get(url, function (error, response, body) {
        if(error){
            return new Error(error);
        }else{
            if(response){
                const $ = cheerio.load(body);
                var data = [];
                for (let i = 0; i < count; i++) {
                    let title = $('.post__title').eq(i).find('a').text().slice(0,50) + ".....";
                    let description = $('.js-mediator-article').eq(i).text().slice(0,150) + ".....";
                    let image = $('.js-mediator-article img').eq(i).attr("src");
                    data.push({title: title,description: description,image: image});
                }
                callback(JSON.stringify(data));
            }else{
                return new Error(error);
            }
        }
    });
}

http.createServer(onRequest).listen(8000);
console.log('Server is listening.....');