/*can-local-store@0.0.0#can-local-store*/
define([
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-memory-store/make-simple-store'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var makeSimpleStore = require('can-memory-store/make-simple-store');
    module.exports = function memoryStore(baseConnection) {
        baseConnection.constructor = memoryStore;
        var behavior = Object.create(makeSimpleStore(baseConnection));
        canReflect.assignMap(behavior, {
            clear: function () {
                localStorage.removeItem(this.name + '/queries');
                localStorage.removeItem(this.name + '/records');
            },
            updateQueriesSync: function (queries) {
                localStorage.setItem(this.name + '/queries', JSON.stringify(queries));
            },
            getQueriesSync: function () {
                return JSON.parse(localStorage.getItem(this.name + '/queries')) || [];
            },
            getRecord: function (id) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                return this._recordsMap[id];
            },
            getAllRecords: function () {
                if (!this._recordsMap) {
                    var recordsMap = JSON.parse(localStorage.getItem(this.name + '/queries')) || {};
                    this._recordsMap = recordsMap;
                }
                var records = [];
                for (var id in this._recordsMap) {
                    records.push(this._recordsMap[id]);
                }
                return records;
            },
            destroyRecords: function (records) {
                canReflect.eachIndex(records, function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    delete this._recordsMap[id];
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            },
            updateRecordsSync: function (records) {
                records.forEach(function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    this._recordsMap[id] = record;
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            }
        });
        return behavior;
    };
});