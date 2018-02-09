'use strict';
const knex = require('../knex.js')
const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//get all folders

router.get('/folders', (req, res, next) => {
  const {searchTerm} = req.query
  knex
    .select()
    .from('folders')
    .where( () => {
      if(searchTerm){
        this.where('name','like',`%${searchTerm}%`)
      }
    })
    .then(knex_res => res.status(200).json(knex_res))
    .catch(err => next(err))
})

router.get('/folders/:id', (req,res,next) => {
  const folderId = req.params.id
  knex
    .select()
    .from('folders')
    .where({id: folderId})
    .then(folder => {
      if(folder.length > 0){
        res.status(200).json(folder[0])
      }else{
        const err = new Error('Can not found folder id')
        err.status = 400
        err.id = folderId
        next(err)
      }
    })
    .catch(err =>{
      next(err)
    })
})

router.put('/folders/:id', (req,res,next) => {
  const updateData = req.body
  knex('folders')
    .update(updateData)
    .where({id:req.params.id})
    .returning(['id','name'])
    .then(folders => {
      res.status(201).json(folders[0])
    })
    .catch(err => next(err))
})

router.post('/folders', (req,res,next) => {
  const newItem = req.body
  knex('folders')
    .insert(newItem)
    .returning(['id','name'])
    .then(folders => {
      res.status(201).json(folders[0])
    })
    .catch(err => next(err))
})

router.delete('/folders/:id', (req,res,next) => {
  const folderId = req.params.id
  knex('folders')
    .where('id', folderId)
    .del()
    .then(knex_res => {
      res.status(204).end()
    })
    .catch(err => next(err))
})
module.exports = router

