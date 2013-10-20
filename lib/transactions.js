function Transaction(adapter) {
    this.adapter = adapter;
    this.inTransaction = false;

    adapter.trx = this;
}

Transaction.prototype.start = function(waitTransaction, callback) {
    var self = this;

    function begin() {
        self.adapter.query('BEGIN')
            .success(function() {
                callback(function(cb) { self.commit(cb) },
                         function(cb) { self.rollback(cb) });
            })
            .error(callback);
    }

    function doStart() {
        if (!self.inTransaction) {
            self.inTransaction = true;
            begin();
        } else {
            if (waitTransaction)
                self.waitTransaction(doStart);
            else
                begin();
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
    } else if (callback) callback();
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
    } else if (callback) callback();
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

module.exports = function(adapter) {
    return new Transaction(adapter);
}
