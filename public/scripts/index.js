/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();
  api.search('/v2/notes')
    .then(notes => {
      store.notes = notes
    })
    .then( ()=>api.search('/v2/folders'))
    .then(folders => {
      store.folders = folders
    })
    .then(()=>api.search('/v2/tags'))
    .then(tags => {
      store.tags = tags
      noteful.render()
    })
});

