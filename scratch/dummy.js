const knex = require('../knex')

// function seedDataFolders() {
//   const folders = require('../db/seed/folders');
//   return knex('folders').del()
//     .then(() => {
//       return knex('folders').insert(folders)
//     })
//     .then(()=> knex.destroy())
// }

// seedDataFolders();

// function seedDataTags() {
//   const tags = require('../db/seed/tags');
//   return knex('tags').del()
//     .then(() => knex('tags').insert(tags));
// }

// seedDataTags()

function seedDataNotes() {
  const notes = require('../db/seed/notes');
  return knex('notes').del()
    .then(() => knex('notes').insert(notes));
}

seedDataNotes()