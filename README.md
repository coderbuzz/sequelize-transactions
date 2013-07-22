sequelize-transactions
======================

Give Sequelize transactions ability

Example Usage:

```javascript
var Sequelize = require('sequelize');
var Transactions = require('sequelize-transactions');
var db = null; // sequelize instance

function connectDB(callback) {
	var sequelize = new Sequelize('database', 'username', 'password', {
	    dialect: 'sqlite',
	    storage: dbPath + '/mydb.db',
	    logging: console.log // false
	})

	Transactions.useTransaction(sequelize);	

	// Init Models
	// ...
	// if (callback) callback(sequelize);

	db = sequelize;
}


function view_myViewEndPoint() {
    var self = this;

    var name = this.get.name || '';
    var type = this.get.type || '';

    db.trx.start(function() {

        db.models.Service.find({where: {name: name, type: type}})
            .success(function(service) {

                if (service) {    
                    db.models.Queue.count({where: ['date(time)=date() AND serviceId=?', service.id]})
                        .success(function(count) {

                            db.models.Queue.create({
                                start: new Date(),
                                serviceId: service.id,
                                queueNo: utils.padDigits(count, 3),
                            })
                            .success(function(record) {
                                
                                db.trx.commit(function(error) {
                                    if (!error)   
                                        self.content('OK');
                                    else
                                        self.content('ERROR');
                                });
                                
                            })
                            .error(function(error) {
                                db.trx.rollback();
                                self.content('ERROR');
                            });

                        })
                        .error(db.trx.rollback);
                    
                } else {
                    db.trx.rollback();
                    self.content('SERVICE NOT FOUND');
                }
                    
            });
    });
}
```