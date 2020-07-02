import * as m2 from 'mysql2/promise';

const SmartConnection = async (fn, opts) => {
  let conn = await fn(opts);

  conn.defQuery = conn.query;
  conn.query = (sql : string, args ?: Array<any>) =>
      conn.defQuery(sql, args)
          .then(([result]) => result)
          .catch(function(e) {
            e.sql = e.sql || conn.format(sql, args);
            throw e; });
  conn.promise = conn.query;

  conn.defExecute = conn.execute;
  conn.execute = (sql : string, args ?: Array<any>) =>
      conn.defExecute(sql, args)
          .then(([result]) => result)
          .catch(function(e) {
            e.sql = e.sql || conn.format(sql, args);
            throw e; });

  conn.single = (sql : string, args ?: Array<any>) =>
      conn.query(sql, args)
          .then(([row]) => row[Object.keys(row).pop()])

  // noinspection CommaExpressionJS
  conn.associative = (key : string, sql : string, args ?: Array<any>) =>
      conn.query(sql, args)
          .then(result => result.reduce((a,b) =>
              (a[b[key]] = b, a), { }));
  conn.assoc = conn.associative;

  // noinspection CommaExpressionJS
  conn.pairs = (key : string, val : string, sql : string, args ?: Array<any>) =>
      conn.query(sql, args)
          .then(result => result.reduce((a,b) =>
              (a[b[key]] = b[val], a), { }));

  return conn;
}

export const mysql21 = {
  ...m2,
  createPool: opts => SmartConnection(m2.createPool, opts),
  createConnection: opts => SmartConnection(m2.createConnection, opts)
};
