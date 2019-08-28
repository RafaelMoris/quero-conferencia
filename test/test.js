var assert = require('assert');

describe('Duração da palestra', function() {
    it('Duração da palestra não informada ou fora do padrão.', function() {
        var talk = "Writing Fast Tests Against Enterprise Rails 60min";
        talk = talk.replace(/\s{1}lightning$/gi, " 5min")
        let match = talk.match(/\s{1}[0-9]*min$/gi);
        if (match != null && match[0] != null) {
            let duration = parseInt(match[0].replace(/[^0-9]/gi, ''));
            assert.equal(duration, 60);
        } else {
            assert.ok(false);
        }
    });
});
