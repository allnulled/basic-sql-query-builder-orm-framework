const sqlqbormframework = require(__dirname + "/../src/index.js");
const { Select, Insert, Update, Delete } = sqlqbormframework;

console.log(
    Select.create()
        .table("Usuario")
        .where([
            ["id", "=", 1],
            ["id", "!=", 2],
            ["id", "NOT IN", [2,3,4,5,6,7,8,9]]
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