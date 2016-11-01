var unirest = require('unirest');
var express = require('express');
var events = require('events');


var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();

    unirest.get('https://api.spotify.com/v1/' + endpoint)
        .qs(args)
        .end(function(response) {
            if (response.ok) {

                emitter.emit('end', response.body);


            } else {
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




    searchReq.on('end', function(item) {

        var artist = item.artists.items[0];

        var artistId = item.artists.items[0].id;

        var searchRel = getFromApi('artists/' + artistId + '/related-artists');

        searchRel.on('end', function(data) {

            artist.related = data.artists;

            var artistArray = data.artists;


            artistArray.forEach(function(singleArtist) {

                var singleArtistId = singleArtist.id;

                var searchTop = getFromApi('artists/' + singleArtistId + '/top-tracks', {
                    country: 'US'
                }); //request

                searchTop.on('end', function(data) {

                  if(!data){
                    throw err;
                  }


                });


                searchTop.on('error', function(code) {
                    res.sendStatus(code);
                });

            });


            // artistArray.forEach(function(singleArtist){
            //     console.log(singleArtist);
            // });
            //

            res.json(artist);
              artist.tracks = data.tracks;
            console.log(artist);

        });



        searchRel.on('error', function(code) {
            res.sendStatus(code);
        });

    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

app.listen(process.env.PORT || 8080);
