function Transaction(adapter) {
    this.adapter = adapter;
    this.inTransaction = false;

    adapter.trx = this;
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

Transaction.useTransaction = function(sequelize) {
    return new Transaction(sequelize);
}

exports.Transaction = Transaction;