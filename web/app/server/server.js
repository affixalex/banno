"use strict";

// Third party libraries.
const koa     = require('koa');
const serve   = require('koa-static');
const IO      = require('koa-socket');
// Use 're' instead of 'r' just so columns line up.
const re      = require('rethinkdbdash')({
  pool: false,
  cursor: true
});

const app = koa();
app.use(serve('./public'));


const io = new IO();
io.attach(app);

const RDB_HOST = process.env.RDB_HOST || "rethinkdb";

// We kick off the Koa server within the context of a RethinkDB connection.
// As a stylistic note, I call .then() on this line to keep a single indent.
re.connect({host: RDB_HOST, port: 28015}).then(function(dbconn) {
  
});