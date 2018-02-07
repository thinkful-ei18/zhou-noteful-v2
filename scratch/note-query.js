const knex = require('../knex.js')
process.stdout.write('\x1Bc');
console.log('..............')
console.log('..............')
console.log('..............')

//search item
// const searchTerm = 'lorem'

// filter result
// knex
//   .select('id','title','content','created')
//   .from('notes')
//   .whereRaw(`LOWER(title) LIKE '%${searchTerm.toLowerCase()}%'`)
//   .orWhereRaw(`LOWER(content) LIKE '%${searchTerm.toLowerCase()}%'`)
//   .then(res => {
//     console.log(JSON.stringify(res,null,4))
//   })
//   .catch(err => {
//     console.log(err)}
//   )

// // find one item

// const idLookUp = 5;
// knex
//   .select('id','title','content','created')
//   .from('notes')
//   .where({id:idLookUp})
//   .then(res => {
//     console.log(JSON.stringify(res,null,4))
//   })
//   .catch(err => console.log(err))

// const updateData = {title:'newitem', content:' newContent'}
// knex('notes')
//   .update({title:updateData.title, 
//     content:updateData.content})
//   .where({id:4})
//   .then(updateNotes => {
//     console.log('success')
//   })

// const newNote = {title:'boringNote', content:'boringNote'}
// knex('notes')
//   .insert(newNote)
//   .returning(['id','created'])
//   .then(knex_res => {
//     console.log(knex_res)
//   })



// //delete by id
// const matchedId = 5
knex('notes')
  .where({id: matchedId})
  .del()
  .then(res => console.log(res))
  .catch(err => console.log(err))


knex.destroy().then(() => {
  console.log('database connection closed');
});


