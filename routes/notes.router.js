'use strict';
const knex = require('../knex.js')
const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
/* 
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);
*/

// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  knex
    .select('id','title','content','created')
    .from('notes')
    .whereRaw(`LOWER(title) LIKE '%${searchTerm? searchTerm.toLowerCase() : ''}%'`)
    .orWhereRaw(`LOWER(content) LIKE '%${searchTerm?searchTerm.toLowerCase() : ''}%'`)
    .then(notes => {
      res.status(200).json(notes)
    })
    .catch(err => next(err))
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  knex
    .select('id','title','content','created')
    .from('notes')
    .where({id:noteId})
    .then(note => {
      if(note.length !==0){
        res.status(200).json(note[0])
      }else{
        const err = new Error('Dot not find id')
        err.status = 400
        err.id = noteId
        next(err)
      }
    })
    .catch(err => next(err))
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  knex('notes')
    .update(updateObj)
    .where({id: noteId})
    .returning(['id','title','content','created'])
    .then(updateNotes => {
      res.status(201).json(updateNotes)
    })
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;
  
  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('notes')
    .insert(newItem)
    .returning(['id','created','title','content'])
    .then(knex_res => {
      res.status(201).json(knex_res[0])
    })
    .catch(next)
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .where({id: id})
    .del()
    .then(knex_res => res.status(200).json({message:'remove success'}))
    .catch(next)
});

module.exports = router;