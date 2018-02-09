const express = require('express')
const router = express.Router()
const knex = require('../knex')
const {UNIQUE_VIOLATION} = require('pg-error-constants')

router.get('/tags', (req, res, next) => {
  knex
    .select()
    .from('tags')
    .then(results => {
      results? res.status(200).json(results) : next()
    })
    .catch(err => next(err))
})

router.get('/tags/:id', (req,res,next)=> {
  knex
    .select()
    .from('tags')
    .where('tags.id', req.params.id)
    .then(result => {    
      result[0]? res.status(200).json(result) : next()
    })
    .catch(next)
})

router.post('/tags', (req, res, next) => {
  const {name} = req.body
  if(!name){
    const err = new Error('missing name from tags')
    err.status(400)
    return next(err)
  }
  const newItem = {name}
  knex
    .insert(newItem)
    .into('tags')
    .returning(['id','name'])
    .then(results => {
      res.status(201).json(results[0])
    })
    .catch(err =>{
      if(err.code === UNIQUE_VIOLATION && err.constraint === 'tags_name_key'){
        err = new Error('Tags name is already taken')
        err.status = 409;
      }
      next(err)
    })
})

router.delete('/tags/:id', (req,res,next) => {
  knex
    .del()
    .from('tags')
    .where('id', req.params.id)
    .then(result => {
      if(!result[0]){
        res.status(400).json({message:'item is already deleted'})
      }
      res.status(202).json({message:'delete success'})
    })
    .catch(err => next(err))
})

router.put('/tags/:id', (req,res,next) => {
  const {name} = req.body
  if(!name){
    const err = new Error('name cant be empty')
    err.status = 404;
    return next(err)
  }
  const updateData = {name}
  knex
    .update(updateData)
    .into('tags')
    .where('id',req.params.id)
    .returning(['id','name'])
    .then(result => {
      res.status(201).json(result[0])
    })
    .catch(err => next(err))
})

module.exports  = router