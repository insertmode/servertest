var Lab = require('lab'),
    mock_couch = require('mock-couch'),
    request = require('request'),
    designDoc = require('../db/_design-user'),
    DBPORT = 5985,
    couch;

Lab.before(function(done) {
    couch = mock_couch.createServer();
    couch.addDB('user', [
        { _id : 'first', type:'user', twitter: {id: '101'} },
        { _id : 'second', type:'user', twitter: {id: '202'} },
        { _id : 'third', type:'loser', twitter: {id: 'xxx'} },
        { _id : 'forth', type:'user', twitter: {id: '303'} }
    ]);
    couch.listen(DBPORT, done);
});

Lab.after(function(done) {
    couch.close();
    done();
});

Lab.test('the view indexes users by twitter id', function(done) {
    couch.addDoc('user', designDoc);
    request('http://localhost:'+DBPORT+'/user/_design/user/_view/twitter/', function(err, res, body) {
        var r = JSON.parse(body);
        //console.log(err, r);    
        Lab.expect(r.total_rows).equals(3);
        Lab.expect(r.rows[0].key).equals('101');
        Lab.expect(r.rows[1].key).equals('202');
        Lab.expect(r.rows[2].key).equals('303');
        done(err);
    });
});
