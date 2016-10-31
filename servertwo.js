
var unirest = require('unirest');
var express = require('express');
var events = require('events');

var  getRelatedArtist= function(endpoint, id){

  var emitter = new events.EventEmitter();
  unirest.get('https://api.spotify.com/v1/artists/'+id+'/related-artists')
  .end(function(response){
    if (response.ok) {

        emitter.emit('related', response.body);
        console.log(response.body);
    }
    else {
        emitter.emit('error', response.code);
    }
  });


};

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);

                }
                else {
                    emitter.emit('error', response.code);
                }
            });

    return emitter;
};

var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {

    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });



    searchRel.on('related',function(artistId){

        console.log(artistId);

    });


    searchReq.on('end', function(item) {

        var artist = item.artists.items[0];
        res.json(artist);

        var artistId = artist.id;
        var emitter = new events.EventEmitter();

        var searchRel= getRelatedArtist('artists',artistId);
        emitter.emit('related', artistId);
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

app.listen(process.env.PORT || 8080);
