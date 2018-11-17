import chai from 'chai';
import chaiHttp from 'chai-http' ;
var server = null ; // CHANGED
let expect = chai.expect;
var datastore = null ; // CHANGED
import _ from 'lodash';
import things from 'chai-things';
chai.use( things);
chai.use(chaiHttp);

describe('Donationss', function (){
    before(function(){
        delete require.cache[require.resolve('../../bin/www')];
        delete require.cache[require.resolve('../../models/donations')];
        datastore = require('../../models/donations');
        server = require('../../bin/www');
    });
    after(function (done) {
        server.close(done);
    });
    beforeEach(function(){
        while(datastore.length > 0) {
            datastore.pop();
        }
        datastore.push(
            {id: 1000000, paymenttype: 'PayPal', amount: 1600, upvotes: 1}
        );
        datastore.push(
            {id: 1000001, paymenttype: 'Direct', amount: 1100, upvotes: 2}
        );
    });

    describe('GET /donations', function () {
        it('should GET all the donations', function(done) {
            chai.request(server)
                .get('/donations')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    expect(res.body.length).to.equal(2);
                    var result = _.map(res.body, function (donation) {
                        return { id: donation.id,
                            amount: donation.amount };
                    });
                    expect(result).to.include( { id: 1000000, amount: 1600  } );
                    expect(result).to.include( { id: 1000001, amount: 1100  } );
                    done();
                });
        });
    });
    describe('POST /donations', function () {
        it('should return confirmation message and update datastore', function(done) {
            var donation = {
                paymenttype: 'Visa' ,
                amount: 1200,
                upvotes: 0
            };
            chai.request(server)
                .post('/donations')
                .send(donation)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').equal('Donation Added!!' ) ;
                    done();
                });
        });
        after(function  (done) {
            chai.request(server)
                .get('/donations')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).be.be.a('array');
                    var result = _.map(res.body, function (donation) {
                        return { paymenttype: donation.paymenttype,
                            amount: donation.amount };
                    }  );
                    expect(result).to.include( { paymenttype: 'Visa', amount: 1200  } );
                    done();
                });
        });
    });

    describe('PUT /donations/:id/votes', function () {
        it('should return all donations with specified donation upvoted by 1', function(done) {
            chai.request(server)
                .put('/donations/1000001/votes')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).be.be.a('array');
                    var result = _.map(res.body, function (donation) {
                        return { id: donation.id,
                            upvotes: donation.upvotes };
                    }  );
                    expect(result).to.include( { id: 1000001, upvotes: 3  } );
                    done();
                });
        });
        it('should return a 404 status and message for invalid donation id', function(done) {
            chai.request(server)
                .put('/donations/1100001/votes')
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').equal('Invalid Donation Id!' ) ;
                    done();
                });
        });

    });

});
