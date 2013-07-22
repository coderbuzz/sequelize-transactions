function Transaction(sequelize) {
    this.adapter = sequelize;
    this.inTransaction = false;

    sequelize.trx = this;
}

Transaction.prototype.start = function(callback) {
    if (!this.inTransaction) {
        this.inTransaction = true;

        this.adapter.query('BEGIN')
            .success(callback)
            .error(callback);
    }
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
    waitTimeout = waitTimeout || 10;

    function checkInTransaction() {
        if (self.inTransaction) {
            // console.log('Waiting...');
            setTimeout(checkInTransaction, waitTimeout);
        } else
            process.nextTick(callback);
    }

    checkInTransaction();
}

Transaction.useTransaction = function(sequelize) {
    return new Transaction(sequelize);
}

exports.Transaction = Transaction;
