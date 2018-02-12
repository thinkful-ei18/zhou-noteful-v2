'use strict';
const knex = require('../knex.js')
const express = require('express')
const router = express.Router();
const Treeize = require('treeize')


// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query
  Helper.noteSubQuery()
    .where(function () {
      if (searchTerm) {
        this.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .where(function() {
      if(folderId){
        this.where('folder_id',folderId)
      }
    })
    .where(function() {
      if(tagId) {
        const subQuery = knex.select('notes.id')
          .from('notes')
          .leftJoin('notes_tags','notes.id','notes_tags.note_id')
          .where('notes_tags.tag_id',tagId)

        this.whereIn('notes.id',subQuery) // key in array
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.status(200).json(Helper.hydration(results))
    })
    .catch(err => {
      next(err)
    });
})

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  Helper.noteSubQuery(noteId)
    .then(note => {
      if(note.length !==0){
        res.status(200).json(Helper.hydration(note)[0])
      }else{
        const err = new Error('Dot not find id')
        err.status = 400
        err.id = noteId
        next(err)
      }
    })
    .catch(err => next(err))
})

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id
  const {title, content, folder_id, tags} = req.body
  const updateObj = {
    title,
    content,
    folder_id
  }

  knex
    .update(updateObj) //update notes
    .into('notes')
    .where('notes.id',req.params.id)
    .then( ()=>{  //delete old junctions
      return knex.del()
        .from('notes_tags')
        .where('notes_tags.note_id',noteId)
    })
    .then(()=> { //insert new junctions
      const pairs = tags.map( tag => {
        return({
          tag_id:tag,
          note_id:noteId
        })
      })
      return knex('notes_tags').insert(pairs)
    })
    .then(()=>{ //build queries
      return Helper.noteSubQuery(noteId)
    })
    .then(result => {
      if(result.length > 0){
        res.location(`${req.originalUrl}/${result[0].note_id}`)
          .status(201)
          .json(Helper.hydration(result)[0])
      }else{
        next()
      }
    })
    .catch(err => next(err))
})

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {title, content, folder_id, tags=[]} = req.body;
  let noteId;
  const newNote = {title, content, folder_id}

  /***** Never trust users - validate input *****/
  if (!newNote.title){
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
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
      return Helper.noteSubQuery(noteId)
    })
    .then(result => {
      res.location(`${req.originalUrl}/${result[0].note_id}`).status(201).json(Helper.hydration(result)[0])
    })
    .catch(err => next(err))
})

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id
  knex('notes')
    .where({id: id})
    .del()
    .then(knex_res => res.status(200).json({message:'remove success'}))
    .catch(next)
})

const Helper = {
  noteSubQuery(noteId = null){
    return knex
      .select('notes.id as id','title','content','notes.folder_id as folder_id',
        'folders.name as folder_name',
        'tags.id as tag_id','tags.name as tag_name')
      .from('notes')
      .leftJoin('folders','notes.folder_id','folders.id')
      .leftJoin('notes_tags','notes.id','notes_tags.note_id')
      .leftJoin('tags','notes_tags.tag_id','tags.id')
      .where(function(){
        if(noteId){
          this.where('notes.id',noteId)
        }
      })
  },
  hydration(result){
    const arr = []
    const obj = {}
    for(let item of result){
      if(!obj[item.id]){
        obj[item.id] = item
        obj[item.id].tags = []
        arr.push(obj[item.id])
      }
      if(item.tag_id){
        const tag = {id: item.tag_id, name: item.tag_name}
        obj[item.id].tags.push(tag)
        delete obj[item.id].tag_id
        delete obj[item.id].tag_name
      }
    }
    return arr
  }
}
module.exports = router
