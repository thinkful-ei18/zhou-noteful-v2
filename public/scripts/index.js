/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();
  api.search('/v2/notes')
    .then(notes => {
      store.notes = notes
    })
    .then( ()=> {api.search('/v2/folders'})
    .then(folders => {
      store.folders = folders
      noteful.render();
    });
});

