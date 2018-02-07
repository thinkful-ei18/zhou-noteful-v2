
const knex = require('../knex.js')
process.stdout.write('\x1Bc');
console.log('..............')
console.log('..............')
console.log('..............')

//get all folders
const searchTerm = 'Per'
knex
  .select()
  .from('folders')
  .where( function() {
    if(searchTerm){
      this.where('name','like',`%${searchTerm}%`)
    }
  })
  .then(res => console.log(res))
  .catch(err => console.log(err))

// get folder by id
// knex
//   .select()
//   .from('folders')
//   .where({id: 100})
//   .then(res => console.log(res))
//   .catch(err => console.log(err))

//update folder by id
// const dummyObj = {name:'Archive2'}
// knex('folders')
//   .update(dummyObj)
//   .where({id:100})
//   .returning(['id','name'])
//   .then(res => console.log(res))
//   .catch(err => console.log(err))

// create new folder
// const newItem = {name: 'newFolder5'}
// knex('folders')
//   .insert(newItem)
//   .returning(['id','name'])
//   .then(res => console.log(res))
//   .catch(err => console.log(err))

//deletef folder
// knex('folders')
//   .where({id:110})
//   .del()
//   .then(res => console.log(res))
//   .catch(err => console.log(err))

//
knex.destroy().then(() => {
  console.log('database connection closed');
});