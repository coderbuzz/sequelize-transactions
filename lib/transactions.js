function Transaction(sequelize) {
    this.adapter = sequelize;
    this.inTransaction = false;

    sequelize.trx = this;
}

Transaction.prototype.start = function(waitTransaction, callback) {
    var self = this;

    function doStart() {
        if (!self.inTransaction) {
            self.inTransaction = true;

            self.adapter.query('BEGIN')
                .success(callback)
                .error(callback);
        } else {
            if (waitTransaction)
                self.waitTransaction(doStart);
            else
                self.adapter.query('BEGIN')
                    .success(callback)
                    .error(callback);
        }    
    }

    doStart();
}

Transaction.prototype.commit = function(callback) {
    var self = this;

    if (this.inTransaction) {
        this.adapter.query('COMMIT')
            .success(function () {
                self.inTransaction = false;
                if (callback) callback();
            })
            .error(function (error) {
                self.inTransaction = false;
                if (callback) callback(error);
                throw error;
            });
    }    
}

Transaction.prototype.rollback = function(callback) {
    var self = this;

    if (this.inTransaction) {
        this.adapter.query('ROLLBACK')
            .success(function () {
                self.inTransaction = false;   
                if (callback) callback(); 
            })
            .error(function (error) {
                self.inTransaction = false;
                if (callback) callback(error);
                throw error;
            });
    }  
}

Transaction.prototype.waitTransaction = function(callback, waitTimeout) {

    var self = this;
    waitTimeout = waitTimeout || 1;

    function checkInTransaction() {
        if (self.inTransaction) {
            // console.log('Waiting...');
            setTimeout(function() {
                process.nextTick(checkInTransaction)
            }, waitTimeout);
        } else
            process.nextTick(callback);
    }

    checkInTransaction();
}

Transaction.useTransaction = function(sequelize) {
    return new Transaction(sequelize);
}

exports.Transaction = Transaction;
