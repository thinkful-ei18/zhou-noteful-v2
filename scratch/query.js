
const knex = require('../knex.js')
const Treeize = require('treeize')

console.log('..............')
console.log('..............')
console.log('..............')

const newNote = {
  title:'5 life lessons learned from cats',
  content:'Lorem ipsum dolor',
  folder_id:null
}
const tags = [1,2]

let noteId

knex
  .insert(newNote)
  .into('notes')
  .returning(['id'])
  .then(result => {
    noteId = result[0].id
    const tagsInsert = tags.map(tagId =>({note_id: noteId,tag_id: tagId}))
    return knex.insert(tagsInsert)
      .into('notes_tags')
  })
  .then(() => {
    return knex
      .select('notes.id as note_id','tags.id')
      .from('notes')
      .leftJoin('folders','folders.id','notes.folder_id')
      .leftJoin('notes_tags','notes_tags.note_id','notes.id')
      .leftJoin('tags','tags.id','notes_tags.tag_id')
      .where('notes.id',noteId)
  })
  .then(result => {
    const treeize = new Treeize()
    treeize.grow(result)
    const hydrated = treeize.getData()
    console.log(hydrated)
    return knex.destroy()

  })
  .catch(err => {
    console.log(err)
  })
  