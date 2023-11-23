(function (loader) {
    const mod = loader();
    if (typeof window !== "undefined") {
        window.basicsqlquerybuilderormframework = mod;
    }
    if (typeof global !== "undefined") {
        global.basicsqlquerybuilderormframework = mod;
    }
    if (typeof module !== "undefined") {
        module.exports = mod;
    }
})(function () {

    const sqlstring = require("sqlstring");

    const enabledOperations = [
        "IS NULL",
        "IS NOT NULL",
        "IN",
        "NOT IN",
        "LIKE",
        "NOT LIKE",
        "=",
        "!=",
        ">",
        ">=",
        "<",
        "<="
    ];

    const applyWhere = function() {
        let sql = "";
        if (this._where) {
            if (Array.isArray(this._where)) {
                for (let index = 0; index < this._where.length; index++) {
                    const whereRule = this._where[index];
                    if (!Array.isArray(whereRule)) {
                        throw new Error("Se requiere parámetro «where» índice «" + index + "» ser un array en función «Select.toString»");
                    }
                    if (index === 0) {
                        sql += "\n WHERE ";
                    } else {
                        sql += "\n   AND ";
                    }
                    const [subj, op, obj] = whereRule;
                    if (enabledOperations.indexOf(op) === -1) {
                        throw new Error("Se requiere parámetro «where» índice «" + index + "» subíndice «operador» ser un operador válido en función «Select.toString»");
                    }
                    sql += sqlstring.escapeId(subj);
                    sql += " ";
                    sql += op;
                    if ((op === "IS NULL") || (op === "IS NOT NULL")) {
                        // ok
                    } else if ((op === "IN") || (op === "NOT IN")) {
                        if (!Array.isArray(obj)) {
                            throw new Error("Se requiere parámetro «where» índice «" + index + "» subíndice «objeto» ser un array en función «Select.toString»");
                        }
                        sql += " (";
                        for (let subindex = 0; subindex < obj.length; subindex++) {
                            const item = obj[subindex];
                            if(subindex !== 0) {
                                sql += ", ";
                            }
                            sql += sqlstring.escape(item);
                        }
                        sql += ")";
                    } else {
                        sql += " ";
                        sql += sqlstring.escape(obj);
                    }
                }
            } else if (typeof this._where === "undefined") {
                // OK
            } else {
                throw new Error("Se requiere parámetro «where» como array o indefinido en función «Select.toString»");
            }
        }
        return sql;
    }

    class Select {
        static create(...args) {
            return new this(...args);
        }
        constructor() {
            this._table = undefined;
            this._where = undefined;
            this._orderBy = undefined;
            this._limit = undefined;
            this._offset = undefined;
            this._page = undefined;
            this._items = undefined;
            this._pagination = true;
        }
        table(table) {
            this._table = table;
            return this;
        }
        where(where) {
            this._where = where;
            return this;
        }
        orderBy(orderBy) {
            this._orderBy = orderBy;
            return this;
        }
        limit(limit) {
            this._limit = limit;
            return this;
        }
        offset(offset) {
            this._offset = offset;
            return this;
        }
        page(page) {
            this._page = page;
            return this;
        }
        items(items) {
            this._items = items;
            return this;
        }
        activatePagination() {
            this._pagination = true;
            return this;
        }
        deactivatePagination() {
            this._pagination = false;
            return this;
        }
        toString() {
            if (typeof this._table !== "string") throw new Error("Se requiere parámetro «table» en función «Select.toString»")
            let sql = "";
            sql += "SELECT * FROM ";
            sql += sqlstring.escapeId(this._table);
            sql += applyWhere.call(this);
            if (this._orderBy) {
                if (Array.isArray(this._orderBy)) {
                    for (let index = 0; index < this._orderBy.length; index++) {
                        const orderByRule = this._orderBy[index];
                        if (!Array.isArray(orderByRule)) {
                            throw new Error("Se requiere parámetro «orderBy» índice «" + index + "» ser un array en función «Select.toString»");
                        }
                        if (orderByRule.length !== 2) {
                            throw new Error("Se requiere parámetro «orderBy» índice «" + index + "» ser un array de 2 ítems en función «Select.toString»");
                        }
                        if (["ASC", "DESC"].indexOf(orderByRule[1]) === -1) {
                            throw new Error("Se requiere parámetro «orderBy» índice «" + index + "» ser un array de 2 ítems cuyo segundo ítem sea 'ASC' o 'DESC' en función «Select.toString»");
                        }
                        if (index === 0) {
                            sql += "\n ORDER BY ";
                        } else {
                            sql += ", ";
                        }
                        sql += sqlstring.escapeId(orderByRule[0]);
                        sql += " ";
                        sql += orderByRule[1];
                    }
                } else if (typeof this._orderBy === "undefined") {
                    // OK
                } else {
                    throw new Error("Se requiere parámetro «orderBy» como array o indefinido en función «Select.toString»");
                }
            }
            if (this._pagination) {
                let page, items;
                if (typeof this._page !== "undefined") {
                    page = parseInt(this._page);
                    if(isNaN(page)) {
                        throw new Error("Se requiere parámetro «page» ser un número normal o indefinido en función «Select.toString»");
                    }
                }
                if (typeof this._items !== "undefined") {
                    items = parseInt(this._items);
                    if(isNaN(items)) {
                        throw new Error("Se requiere parámetro «items» ser un número normal o indefinido en función «Select.toString»");
                    }
                }
                if(typeof this._page !== "undefined" && typeof this._items !== "undefined") {
                    const limit = items;
                    const offset = (page * items) - items;
                    sql += "\n LIMIT ";
                    sql += limit;
                    sql += "\n OFFSET ";
                    sql += offset;
                } else if(typeof this._page === "undefined" && typeof this._items === "undefined") {
                    // OK
                } else {
                    throw new Error("Se requieren ambos parámetros «page» e «items» utilizarse a la vez o dejarlos en indefinido en función «Select.toString»");
                }
            } else {
                const limit = this._limit;
                const offset = this._offset;
                if(limit) {
                    sql += "\n LIMIT ";
                    sql += sqlstring.escape(limit);
                }
                if(offset) {
                    sql += "\n OFFSET ";
                    sql += sqlstring.escape(offset);
                }
            }
            return sql;
        }
    }

    class Insert {
        static create(...args) {
            return new this(...args);
        }
        constructor() {
            this._table = undefined;
            this._columns = undefined;
            this._values = undefined;
        }
        table(table) {
            this._table = table;
            return this;
        }
        columns(columns) {
            this._columns = columns;
            return this;
        }
        values(values) {
            this._values = values;
            return this;
        }
        toString() {
            let sql = "";
            sql += "INSERT INTO ";
            sql += sqlstring.escapeId(this._table);
            sql += " (";
            for(let index=0; index<this._columns.length; index++) {
              const column = this._columns[index];
              if(index !== 0) {
                sql += ", ";
              }
              sql += "\n   ";
              sql += sqlstring.escapeId(column);
            }
            sql += ")";
            sql += "\n VALUES (";
            for(let index=0; index<this._columns.length; index++) {
              const column = this._columns[index];
              const value = this._values[column];
              if(index !== 0) {
                sql += ", ";
              }
              sql += "\n   ";
              sql += sqlstring.escape(value);
            }
            sql += ")";
            return sql;
        }
    }

    class Update {
        static create(...args) {
            return new this(...args);
        }
        constructor() {
            this._table = undefined;
            this._values = undefined;
            this._where = undefined;
        }
        table(table) {
            this._table = table;
            return this;
        }
        values(values) {
            this._values = values;
            return this;
        }
        where(where) {
            this._where = where;
            return this;
        }
        toString() {
            let sql = "";
            sql += "UPDATE ";
            sql += sqlstring.escapeId(this._table);
            sql += " SET ";
            const keys = Object.keys(this._values);
            for(let index=0; index<keys.length; index++) {
              const column = keys[index];
              const value = this._values[index];
              if(index !== 0) {
                sql += ", ";
              }
              sql += "\n   ";
              sql += sqlstring.escapeId(column);
              sql += " = ";
              sql += sqlstring.escape(value);
            }
            sql += applyWhere.call(this);
            return sql;
        }
    }

    class Delete {
        static create(...args) {
            return new this(...args);
        }
        constructor() {
            this._table = undefined;
            this._where = undefined;
        }
        table(table) {
            this._table = table;
            return this;
        }
        where(where) {
            this._where = where;
            return this;
        }
        toString() {
            let sql = "";
            sql += "DELETE FROM ";
            sql += sqlstring.escapeId(this._table);
            sql += applyWhere.call(this);
            return sql;
        }
    }

    return { Select, Insert, Update, Delete };

});