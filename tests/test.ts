import { expect } from 'chai';
import { mysql21 } from "../index";

let connection;
const credentials = {
  host: 'localhost',
  user: 'test',
  password: 'test',
  database: 'test',
  multipleStatements: true
};

const testMe: Array<Array<any>> = [
  ['Connect', () => {
    it('should connect', async () => {
      connection = await mysql21.createConnection(credentials);
      expect(connection.constructor.name).to.equal('PromiseConnection')
    });
    it('should not be closed', () => expect(connection.connection._paused).to.equal(false));
  }],
  ['Discconnect', () => {
    it('should disconnect', () => expect(async () => await connection.end()).not.to.throw());
  }],
  ['Connect with Pool', () => {
    it('should connect pool', async () => {
      connection = await mysql21.createPool(credentials);
      expect(connection.constructor.name).to.equal('PromisePool')
    });
    it('pool should not be closed', () => expect(connection.pool._closed).to.equal(false));
  }],
  ['Write some test data', () => {
    it('should drop table if exists', async () => {
      let query = await connection.query(`DROP TABLE IF EXISTS listings;`);
      expect(query.constructor.name).to.equal('ResultSetHeader');
    });

    it('should create table', async () => {
      let query = await connection.query(`
  CREATE TABLE listings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  data JSON NOT NULL
  )`);
      expect(query.constructor.name).to.equal('ResultSetHeader');
    });

    it('should insert', async () => {
      let query = await connection.query(`
  INSERT INTO listings (data) VALUES
  ('{
  "title": "First Listing",
  "public": false,
  "text": "Lorem ipsum",
  "address": "Klimentská 1215/25, 110 00, Prague 1"
  }'),
  ('{
  "title": "Second Listing",
  "public": true,
  "text": "Dolor sit amet",
  "address": "Rybná 716/24, 110 00, Prague 1"
  }'),
  ('{
  "title": "Third Listing",
  "public": true,
  "text": "Consectetur adipiscing elit",
  "address": "Jagellonská 1, 130 00, Prague 3"
  }');`);
      expect(query.constructor.name).to.equal('ResultSetHeader');
      expect(query.insertId).to.be.an('number');
    });
  }],
  ['Read some data', () => {
    let read;
    it('should be an array', async () => {
      read = await connection.query('SELECT * FROM listings;')
      expect(Array.isArray(read)).to.be.true;
    });
    it('should be 3', () =>
        expect(read.length).to.equal(3));
    it('data should be JSON', () =>
        expect(read.every(r => typeof r.data === 'object')).to.be.true);
    it('data should not contain `timestamp`', () =>
        expect(read[0]).to.not.have.property('timestamp'));
  }],
  ['Fail something', () => {
    let err;
    it('should catch', async () => {
      err = await connection.query('SELECT * FROM listings WHERE nofield = ?;', [-1]).catch(e => e);
      expect(err.constructor.name).to.equal('Error')
    });
    it('should be ER_BAD_FIELD_ERROR', () => expect(err.code).to.equal('ER_BAD_FIELD_ERROR'));
    it('should include formated SQL', () => expect(typeof err.sql).to.equal('string'));
  }],
  ['Read single value', () => {
    it('should be an array', async () => {
      let read = await connection.single('SELECT COUNT(*) FROM listings;');
      expect(read).to.equal(3);
    });
  }],
  ['Read as an object', () => {
    let read;
    it('should be an object, not an array', async () => {
      read = await connection.assoc('id', 'SELECT * FROM listings;');
      expect(typeof read === 'object' && !Array.isArray(read)).to.be.true;
    });
    it("'should contain key '1'", () => expect(read['1']).to.be.an('object'));
    it('should contain original row values', () => expect(read['1']).to.have.own.property('id'));
    it('should not contain data column directly', () => expect(read['1']).to.not.have.own.property('title'));
  }],
  ['Read in pairs as an object', () => {
    let read;
    it('should be an object, not an array', async () => {
      read = await connection.pairs('id', 'data', 'SELECT * FROM listings;');
      expect(typeof read === 'object' && !Array.isArray(read)).to.be.true;
    });
    it("'should contain key '1'", () => expect(read['1']).to.be.an('object'));
    it('should not contain original row values', () => expect(read['1']).to.not.have.own.property('id'));
    it('should contain data column directly', () => expect(read['1']).to.have.own.property('title'));
  }],
  ['Drop table', () => it("drop listings", () => expect(async () => await connection.query("DROP TABLE listings")).not.to.throw())],
  ['???', () => it('is unknown', () => expect(undefined).to.be.undefined)],
  ['end connection with PROFIT', () => it('at least you have hope', () =>
      expect(async () => await connection.end()).not.to.throw())]
];

testMe.forEach(([title, test], i:number) => {
  describe(`${i-1}. ${title}`, test);
});
