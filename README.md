# basic-sql-query-builder-orm-framework

A basic SQL Query Builder ORM Framework. 

## Installation

```sh
npm install --save basic-sql-query-builder-orm-framework
```

## Usage

```js
const { Select, Insert, Update, Delete } = require("basic-sql-query-builder-orm-framework");

console.log(
    Select.create()
        .table("Usuario")
        .where([
            ["id", "=", 1],
            ["id", "!=", 2]
        ])
        .orderBy([["id","DESC"],["name", "ASC"]])
        .page(1)
        .items(20)
        .toString()
);

console.log(
    Insert.create()
        .table("Usuario")
        .columns(["name", "password", "email"])
        .values({ name: "admin", password: "admin", email: "admin@admin.admin" })
        .toString()
);

console.log(
    Update.create()
        .table("Usuario")
        .values({ name: "admin", password: "admin", email: "admin@admin.admin" })
        .where([[ "id", "=", 8 ]])
        .toString()
);

console.log(
    Delete.create()
        .table("Usuario")
        .where([
            ["id", "=", 3]
        ])
        .toString()
);
```

Simple.