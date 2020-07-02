# Node MySQL 2.1

Lightweight, [mysql2][1]/[promise][2] based layer for easier database manipulation.

Inspired by PHP's awesome [dg/digi][3].

------

### Examples

#### Connection

```
// TypeScript
import { mysql21 } from 'mysql21';

// Node.js
const { mysql21 } = require("mysql21");

const opts = {
  host: 'localhost',
  user: 'test',
  password: 'test',
  database: 'test',
  multipleStatements: true
}

// single line

let connection = await mysql21.createConnection(opts);

// pool

let connection = await mysql21.createPool(opts);
```

#### Query

```

// either await

let query = await connection.query('SELECT 1');
console.log(query);
> [ TextRow { '1': 1 } ]

// or then...

connection.query('SELECT 1')
  .then(console.log);
> [ TextRow { '1': 1 } ]

connection.query('INSERT INTO listings (data) VALUES ?', [[[JSON.stringify({title: 'test'})]]])
  .then(console.log);
> 4
```

Query drops fields definitions from result.
If you want it back, use `defQuery()` or
`defExecute()` instead, triggering mysql2's
original methods, which return `[result, fields]`.

On the other hand, it returns much missing
`Error.sql` formatted string for any chance
of actual debugging.

#### Single result

```
connection.query('SELECT 1')
  .then(console.log);
> 1
```

#### Associative results

```
connection.assoc('id', "SELECT 1 as id, 'one' as value UNION SELECT 2, 'two'")
      .then(console.log);
> {
>   '1': TextRow { id: 1, value: 'one' },
>   '2': TextRow { id: 2, value: 'two' }
> }
```

#### Key-Value Pairs

```
connection.pairs('id', 'value', "SELECT 1 as id, 'one' as value UNION SELECT 2, 'two'")
      .then(console.log);
> { '1': 'one', '2': 'two' }
```

Other methods follow their [mysql2][1] origin.

[1]: https://www.npmjs.com/package/mysql2
[2]: https://www.npmjs.com/package/mysql2#using-promise-wrapper
[3]: https://github.com/dg/dibi