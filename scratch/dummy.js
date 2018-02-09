'use strict';
const knex = require('../knex.js')
const express = require('express')
const router = express.Router();
const Treeize = require('treeize')

router.get('/notes', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query
  knex
    .select(
      'notes.id as note_id',
      'notes.title','notes.content',
      'folders.name as folder',
      'tags.id as tag_id',
      'tags.name as tag_name')
    .from('notes')
    .leftJoin('folders','folders.id','notes.folder_id')
    .leftJoin('notes_tags','notes.id','notes_tags.note_id')
    .leftJoin('tags','notes_tags.tag_id','tags.id')
    .where(function() {
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
      console.log('tagId',tagId)
      const treeize = new Treeize();
      treeize.grow(results)
      const hydrated = treeize.getData()
      res.status(200).json(hydrated)
    })
    .catch(err => {
      next(err)
    })
})