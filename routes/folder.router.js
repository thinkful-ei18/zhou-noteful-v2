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
module.exports = router

