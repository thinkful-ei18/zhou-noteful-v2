/* global $ store api moment*/
'use strict';

const noteful = (function () {

  function render() {    
    const notesList = generateNotesList(store.notes, store.currentNote);
    $('.js-notes-list').html(notesList);
    const folderList = generateFolderList(store.folders, store.currentQuery);
    $('.js-folders-list').html(folderList);
    const folderSelect = generateFolderSelect(store.folders);
    $('.js-note-folder-entry').html(folderSelect);

    const editForm = $('.js-note-edit-form');
    editForm.find('.js-note-title-entry').val(store.currentNote.title);
    editForm.find('.js-note-content-entry').val(store.currentNote.content)
    editForm.find('.js-note-folder-entry').val(store.currentNote.folder_id);
  }

  /**
   * GENERATE HTML FUNCTIONS
   */
  function generateFolderList(list, currQuery) {
    const showAllItem = `
      <li data-id="" class="js-folder-item ${!currQuery.folderId ? 'active' : ''}">
        <a href="#" class="name js-folder-link">All</a>
      </li>`;

    const listItems = list.map(item => `
      <li data-id="${item.id}" class="js-folder-item ${currQuery.folderId === item.id ? 'active' : ''}">
        <a href="#" class="name js-folder-link">${item.name}</a>
        <button class="removeBtn js-folder-delete">X</button>
      </li>`);

    return [showAllItem, listItems].join('');
  }

  function generateFolderSelect(list) {
    const notes = list.map(item => `<option value="${item.id}">${item.name}</option>`);
    return '<option value="">Select Folder:</option>' + notes.join('');
  }

  function generateNotesList(list, currNote) {
    const listItems = list.map(item => `
      <li data-id="${item.id}" class="js-note-element ${currNote.id === item.id ? 'active' : ''}">
        <a href="#" class="name js-note-link">${item.title}</a>
        <button class="removeBtn js-note-delete-button">X</button>
        <div class="metadata">
            <div class="date">${moment(item.created).calendar()}</div>
          </div>
      </li>`);
    return listItems.join('');
  }
  
  /**
   * HELPERS
   */
  function getNoteIdFromElement(item) {
    const id = $(item).closest('.js-note-element').data('id');
    return id;
  }

  /**
   * NOTES EVENT LISTENERS AND HANDLERS
   */

  function handleFolderClick() {
    $('.js-folders-list').on('click', '.js-folder-link', event => {
      event.preventDefault();

      const folderId = getFolderIdFromElement(event.currentTarget);
      store.currentQuery.folderId = folderId;
      if (folderId !== store.currentNote.folder_id) {
        store.currentNote = {};
      }

      api.search('/v2/notes', store.currentQuery)
        .then(response => {
          store.notes = response;
          render();
        });
    });
  }
  
  function handleNoteItemClick() {
    $('.js-notes-list').on('click', '.js-note-link', event => {
      event.preventDefault();

      const noteId = getNoteIdFromElement(event.currentTarget);

      api.details(`/v2/notes/${noteId}`)
        .then((response) => {
          store.currentNote = response;
          render();
        });
    });
  }

  function handleNoteSearchSubmit() {
    $('.js-notes-search-form').on('submit', event => {
      event.preventDefault();

      store.currentQuery.searchTerm = $(event.currentTarget).find('input').val();

      api.search('/v2/notes', store.currentQuery)
        .then(response => {
          store.notes = response;
          render();
        });
    });
  }


  function handleNoteFormSubmit() {
    $('.js-note-edit-form').on('submit', function (event) {
      event.preventDefault();

      const editForm = $(event.currentTarget);
      const noteObj = {
        id: store.currentNote.id,
        title: editForm.find('.js-note-title-entry').val(),
        content: editForm.find('.js-note-content-entry').val(),
      };

      if (store.currentNote.id) {
        api.update(`/v2/notes/${noteObj.id}`, noteObj)
          .then(updateResponse => {
            store.currentNote = updateResponse;
            return api.search('/v2/notes', store.currentQuery);
          })
          .then(response => {
            store.notes = response;
            render();
          });
      } else {
        api.create('/v2/notes', noteObj)
          .then(createResponse => {
            store.currentNote = createResponse;
            return api.search('/v2/notes', store.currentQuery);
          })
          .then(response => {
            store.notes = response;
            render();
          });
      }
    });
  }

  function handleNoteStartNewSubmit() {
    $('.js-start-new-note-form').on('submit', event => {
      event.preventDefault();
      store.currentNote = {};
      render();
    });
  }

  function handleNoteDeleteClick() {
    $('.js-notes-list').on('click', '.js-note-delete-button', event => {
      event.preventDefault();
      const noteId = getNoteIdFromElement(event.currentTarget);

      if (noteId === store.currentNote.id) {
        store.currentNote = {};
      }
      api.remove(`/v2/notes/${noteId}`)
        .then(() => api.search('/v2/notes', store.currentQuery))
        .then(response => {
          store.notes = response;
          render();
        });
    });
  }

  function bindEventListeners() {
    handleNoteItemClick();
    handleNoteSearchSubmit();

    handleNoteFormSubmit();
    handleNoteStartNewSubmit();
    handleNoteDeleteClick();
  }

  // This object contains the only exposed methods from this module:
  return {
    render: render,
    bindEventListeners: bindEventListeners,
  };

}());
