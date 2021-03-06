sequelize-transactions
======================

# Obsolete: Since Sequelize already has a built-in Transaction, this library is no longer needed. Archived.

Give Sequelize transactions ability

Example Usage:

```javascript
var Sequelize = require('sequelize');
var useTransaction = require('sequelize-transactions');
var db = null; // sequelize instance

function connectDB(callback) {
	var sequelize = new Sequelize('database', 'username', 'password', {
	    dialect: 'sqlite',
	    storage: dbPath + '/mydb.db',
	    logging: console.log // false
	})

	// Create new Transaction and attach to adapter
	useTransaction(sequelize);

	// Init Models
	// ...
	// if (callback) callback(sequelize);

	db = sequelize;
}

function view_myViewEndPoint() {
    var self = this;

    var name = this.get.name || '';
    var type = this.get.type || '';
        
    // You might also wait transactions to prevent deadlock in some database (ie: SQLite) 
    // using waitTransaction(). Set first param of start() = true
    	
    db.trx.start(true, function(commit, rollback) {

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
	                        
	                        commit(function(error) {
	                            if (!error)   
	                                self.content('OK');
	                            else
	                                self.content('ERROR');
	                        });
	                        
	                    })
	                    .error(function(error) {
	                        rollback();
	                        self.content('ERROR');
	                    });
	
	                })
	                .error(rollback);
	            
	        } else {
	            rollback();
	            self.content('SERVICE NOT FOUND');
	        }
	            
	    });
    });
}
```
