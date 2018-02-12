module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://postgres:5408@localhost/noteful_app',
    debug: true, // http://knexjs.org/#Installation-debug
    pool: {min : 1 , max : 2}
  },
  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || 'postgres://postgres:5408@localhost/noteful_test',
    pool: {min : 1 , max : 2}
  },
  production: {
    client: 'pg',
    connection:process.env.ELEPHANTSQL_URL || 'postgres://bmvypusz:k7U3oCNM635KYnD7oCdPXbRMAIPeQf0K@baasu.db.elephantsql.com:5432/bmvypusz'
  }
};