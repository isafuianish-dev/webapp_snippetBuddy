(function () {
  'use strict';

  var BOOKS_KEY = 'snippetBuddy.books.v1';
  var SNIPPETS_KEY = 'snippetBuddy.snippets.v1';
  var APP_KEY = 'webapp_snippetBuddy';
  var APP_VERSION = '001.001';

  var LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'Bash', 'PowerShell', 'JSON', 'YAML', 'Markdown'];

  var ICONS = Buddy.ICONS;

  var dom = {};
  var state = {
    books: [],
    snippets: [],
    activeBookId: null,
    view: 'active',
    search: '',
    bookSearch: '',
    languageFilter: ''
  };

  function escapeHtml(str) {
    return Buddy.escapeHtml(str);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function formatDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function hashLangIndex(lang) {
    var str = (lang || '').trim().toLowerCase();
    if (!str) return 7;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % 8;
  }

  function parseTags(str) {
    return str.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }

  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      var original = btn.innerHTML;
      btn.innerHTML = ICONS.check;
      setTimeout(function () { btn.innerHTML = original; }, 1200);
    }).catch(function () {});
  }



  function loadBooks() {
    try {
      var raw = localStorage.getItem(BOOKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBooks() {
    try { localStorage.setItem(BOOKS_KEY, JSON.stringify(state.books)); } catch (e) {}
  }

  function loadSnippets() {
    try {
      var raw = localStorage.getItem(SNIPPETS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSnippets() {
    try { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(state.snippets)); } catch (e) {}
  }

  function findSnippet(id) {
    return state.snippets.find(function (s) { return s.id === id; });
  }

  function findBook(id) {
    return state.books.find(function (b) { return b.id === id; });
  }






  function ensureDefaultBookAndMigrate() {
    if (!state.books.length && state.snippets.length) {
      state.books.push({ id: generateId(), name: 'My Snippets', createdAt: Date.now() });
      saveBooks();
    }
    var validIds = {};
    state.books.forEach(function (b) { validIds[b.id] = true; });
    var fallbackId = null;
    var changed = false;
    state.snippets.forEach(function (s) {
      if (!s.bookId || !validIds[s.bookId]) {
        if (!fallbackId) fallbackId = state.books[0].id;
        s.bookId = fallbackId;
        changed = true;
      }
    });
    if (changed) saveSnippets();
  }

  function ensureActiveBookId() {
    if (!state.books.some(function (b) { return b.id === state.activeBookId; })) {
      state.activeBookId = state.books[0] ? state.books[0].id : null;
    }
  }



  function applyTheme(theme) {
    Buddy.theme.applyTheme(APP_KEY, theme);
  }

  function applyAccent(accent) {
    Buddy.theme.applyAccent(APP_KEY, accent);
  }

  function openSettingsModal() {
    Buddy.settings.open(APP_KEY, openModal, closeModal, { appVersion: APP_VERSION });
  }



  function updateArchiveButtonVisual() {
    var isArchived = state.view === 'archived';
    dom.btnArchiveView.classList.toggle('active', isArchived);
    dom.btnArchiveView.title = isArchived ? 'Back to active snippets' : 'View archive';
    dom.btnArchiveView.setAttribute('aria-label', dom.btnArchiveView.title);
  }

  function updateActiveBookHeader() {
    var book = findBook(state.activeBookId);
    dom.activeBookTitle.textContent = book ? book.name : '';
  }

  function selectBook(id) {
    state.activeBookId = id;
    state.view = 'active';
    state.search = '';
    state.languageFilter = '';
    dom.snippetSearch.value = '';
    updateArchiveButtonVisual();
    updateActiveBookHeader();
    renderBookList();
    renderLanguageFilterOptions();
    renderGrid();
  }

  function renderBookList() {
    var q = state.bookSearch.trim().toLowerCase();
    var filteredBooks = state.books.filter(function (b) { return !q || b.name.toLowerCase().indexOf(q) !== -1; });

    dom.sidebarLoadSampleHint.hidden = state.books.length !== 0;

    var html;
    if (!filteredBooks.length && q) {
      html = '<p class="empty-hint">No books match your search.</p>';
    } else {
      html = filteredBooks.map(function (b) {
        var count = state.snippets.filter(function (s) { return s.bookId === b.id && !s.archived; }).length;
        var active = b.id === state.activeBookId ? ' active' : '';
        return '<li class="book-item' + active + '" data-id="' + b.id + '" tabindex="0">' +
          '<span class="book-item-icon">' + ICONS.book + '</span>' +
          '<span class="book-item-body">' +
          '<span class="book-item-name">' + escapeHtml(b.name) + '</span>' +
          '<span class="book-item-count">' + count + ' snippet' + (count === 1 ? '' : 's') + '</span>' +
          '</span>' +
          '<span class="book-item-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm btn-icon book-edit" title="Rename" aria-label="Rename book">' + ICONS.edit + '</button>' +
          '<button type="button" class="btn btn-ghost btn-sm btn-icon book-delete" title="Delete" aria-label="Delete book">' + ICONS.trash + '</button>' +
          '</span>' +
          '</li>';
      }).join('');
    }

    dom.bookList.innerHTML = html;
  }

  function openNewBookModal() {
    openNameModal('Create Snippet Book', '', function (name) {
      var book = { id: generateId(), name: name, createdAt: Date.now() };
      state.books.push(book);
      saveBooks();
      selectBook(book.id);
      updateBooksVisibility();
    });
  }



  function updateBooksVisibility() {
    var hasBooks = state.books.length > 0;
    dom.noBooksState.hidden = hasBooks;
    dom.mainContent.hidden = !hasBooks;
  }

  function renameBook(id) {
    var book = findBook(id);
    if (!book) return;
    openNameModal('Rename Book', book.name, function (name) {
      book.name = name;
      saveBooks();
      renderBookList();
      updateActiveBookHeader();
    });
  }

  function deleteBook(id) {
    var book = findBook(id);
    if (!book) return;
    var count = state.snippets.filter(function (s) { return s.bookId === id; }).length;
    var message = count > 0
      ? 'Delete "' + book.name + '"? This will also delete ' + count + ' snippet' + (count === 1 ? '' : 's') + ' in it. This cannot be undone.'
      : 'Delete "' + book.name + '"? This cannot be undone.';

    openConfirmModal('Delete Book', message, 'Delete', function () {
      state.books = state.books.filter(function (b) { return b.id !== id; });
      state.snippets = state.snippets.filter(function (s) { return s.bookId !== id; });
      saveBooks();
      saveSnippets();
      if (state.activeBookId === id) {
        state.activeBookId = state.books.length ? state.books[0].id : null;
        state.view = 'active';
        updateArchiveButtonVisual();
        updateActiveBookHeader();
      }
      renderLanguageFilterOptions();
      renderBookList();
      renderGrid();
      updateBooksVisibility();
    }, { danger: true });
  }



  function computeFilteredList() {
    var archived = state.view === 'archived';
    var q = state.search.trim().toLowerCase();
    var langFilter = state.languageFilter;
    var bookId = state.activeBookId;
    return state.snippets.filter(function (s) {
      if (!!s.archived !== archived) return false;
      if (s.bookId !== bookId) return false;
      if (langFilter && (s.language || '').toLowerCase() !== langFilter.toLowerCase()) return false;
      if (q) {
        var hay = [s.title, s.code, s.notes, s.language].concat(s.tags || []).join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderCardHtml(snip) {
    var langBadge = snip.language ? '<span class="lang-badge lang-' + hashLangIndex(snip.language) + '">' + escapeHtml(snip.language) + '</span>' : '';
    var tags = (snip.tags || []).slice(0, 4).map(function (t) { return '<span class="tag-chip">' + escapeHtml(t) + '</span>'; }).join('');
    var codePreview = snip.code ? '<pre class="card-code-preview">' + escapeHtml(snip.code) + '</pre>' : '';
    var notes = snip.notes ? '<p class="card-notes">' + escapeHtml(snip.notes) + '</p>' : '';
    var archiveAction = snip.archived
      ? '<button type="button" class="card-action-btn" data-action="archive" title="Restore" aria-label="Restore">' + ICONS.restore + '</button>'
      : '<button type="button" class="card-action-btn" data-action="archive" title="Archive" aria-label="Archive">' + ICONS.archive + '</button>';

    return '<div class="snippet-card" data-id="' + snip.id + '">' +
      '<button type="button" class="card-pin-btn' + (snip.pinned ? ' pinned' : '') + '" data-action="pin" title="' + (snip.pinned ? 'Unpin' : 'Pin') + '" aria-label="' + (snip.pinned ? 'Unpin' : 'Pin') + '">' + (snip.pinned ? ICONS.pinFilled : ICONS.pin) + '</button>' +
      '<div class="card-body">' +
      '<h3 class="card-title">' + escapeHtml(snip.title || 'Untitled snippet') + '</h3>' +
      (langBadge || tags ? '<div class="card-badges">' + langBadge + tags + '</div>' : '') +
      codePreview +
      notes +
      '<div class="card-meta">Updated ' + formatDate(snip.updatedAt) + '</div>' +
      '</div>' +
      '<div class="card-actions">' +
      '<button type="button" class="card-action-btn" data-action="copy" title="Copy code" aria-label="Copy code">' + ICONS.copy + '</button>' +
      archiveAction +
      '<button type="button" class="card-action-btn danger" data-action="delete" title="Delete" aria-label="Delete">' + ICONS.trash + '</button>' +
      '</div>' +
      '</div>';
  }

  function renderGrid() {
    var list = computeFilteredList();
    var pinned = state.view === 'active' ? list.filter(function (s) { return s.pinned; }) : [];
    var others = state.view === 'active' ? list.filter(function (s) { return !s.pinned; }) : list;

    function byUpdated(a, b) { return b.updatedAt - a.updatedAt; }
    pinned.sort(byUpdated);
    others.sort(byUpdated);

    dom.pinnedSection.hidden = pinned.length === 0;
    dom.pinnedGrid.innerHTML = pinned.map(renderCardHtml).join('');

    dom.othersTitle.textContent = pinned.length ? 'Others' : (state.view === 'archived' ? 'Archive' : 'Snippets');
    dom.othersGrid.innerHTML = others.map(renderCardHtml).join('');

    var totalInView = state.snippets.filter(function (s) {
      if (!!s.archived !== (state.view === 'archived')) return false;
      if (s.bookId !== state.activeBookId) return false;
      return true;
    }).length;

    if (list.length === 0) {
      dom.emptyState.hidden = false;
      if (totalInView === 0) {
        dom.emptyState.textContent = state.view === 'archived'
          ? 'Archive is empty.'
          : 'This book is empty. Click "New Snippet" to add one.';
      } else {
        dom.emptyState.textContent = 'No snippets match your search.';
      }
    } else {
      dom.emptyState.hidden = true;
    }
  }

  function renderLanguageFilterOptions() {
    var archived = state.view === 'archived';
    var bookId = state.activeBookId;
    var langs = [];
    state.snippets.forEach(function (s) {
      if (!!s.archived !== archived) return;
      if (s.bookId !== bookId) return;
      var l = (s.language || '').trim();
      if (l && langs.indexOf(l) === -1) langs.push(l);
    });
    langs.sort(function (a, b) { return a.localeCompare(b); });
    if (langs.indexOf(state.languageFilter) === -1) {
      state.languageFilter = '';
    }

    var items = [{ value: '', label: 'All languages' }].concat(langs.map(function (l) { return { value: l, label: l }; }));
    renderDropdown(dom.languageFilterContainer, {
      items: items,
      value: state.languageFilter,
      ariaLabel: 'Filter by language',
      onChange: function (value) {
        state.languageFilter = value;
        renderGrid();
      }
    });
  }



  function togglePin(id) {
    var snip = findSnippet(id);
    if (!snip) return;
    snip.pinned = !snip.pinned;
    saveSnippets();
    renderGrid();
  }

  function toggleArchive(id) {
    var snip = findSnippet(id);
    if (!snip) return;
    snip.archived = !snip.archived;
    if (snip.archived) snip.pinned = false;
    saveSnippets();
    renderLanguageFilterOptions();
    renderGrid();
  }

  function confirmDeleteSnippet(id) {
    var snip = findSnippet(id);
    if (!snip) return;
    openConfirmModal('Delete Snippet', 'Delete "' + (snip.title || 'Untitled snippet') + '"? This cannot be undone.', 'Delete', function () {
      state.snippets = state.snippets.filter(function (s) { return s.id !== id; });
      saveSnippets();
      renderLanguageFilterOptions();
      renderBookList();
      renderGrid();
    }, { danger: true });
  }



  function openNewSnippetModal() {
    var defaultBookId = state.activeBookId || (state.books[0] ? state.books[0].id : null);
    renderSnippetForm(null, defaultBookId);
  }

  function renderSnippetForm(existing, defaultBookId) {
    var isEdit = !!existing;
    var snip = existing || { title: '', language: '', code: '', notes: '', tags: [], bookId: defaultBookId };

    var html =
      '<form id="snippetForm">' +
      '<div class="form-group"><label for="snipTitle">Title</label><input type="text" id="snipTitle" class="form-control" placeholder="Untitled snippet" value="' + escapeHtml(snip.title) + '"></div>' +
      '<div class="form-group"><label>Book</label><div id="snipBookContainer"></div></div>' +
      '<div class="form-group"><label>Language</label><div id="snipLanguageContainer"></div></div>' +
      '<div class="form-group"><label for="snipCode">Code</label><textarea id="snipCode" class="composer-code" style="min-height:180px;" spellcheck="false">' + escapeHtml(snip.code) + '</textarea></div>' +
      '<div class="form-group"><label for="snipNotes">Notes</label><textarea id="snipNotes" class="form-control composer-notes">' + escapeHtml(snip.notes) + '</textarea></div>' +
      '<div class="form-group"><label for="snipTags">Tags</label><input type="text" id="snipTags" class="form-control" placeholder="Comma separated" autocomplete="off" value="' + escapeHtml((snip.tags || []).join(', ')) + '"></div>' +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-ghost" id="btnSnipCancel">Cancel</button>' +
      '<button type="submit" class="btn btn-primary" id="btnSnipSave">' + (isEdit ? 'Save' : 'Add Snippet') + '</button>' +
      '</div>' +
      '</form>';

    openModal(isEdit ? 'Edit Snippet' : 'New Snippet', html, function (body) {
      var selectedBookId = snip.bookId;
      var bookItems = state.books.map(function (b) { return { value: b.id, label: b.name, icon: ICONS.book }; });
      renderDropdown(body.querySelector('#snipBookContainer'), {
        items: bookItems,
        value: selectedBookId,
        ariaLabel: 'Book',
        onChange: function (value) { selectedBookId = value; }
      });

      var selectedLanguage = snip.language;
      var languageItems = LANGUAGES.map(function (lang) { return { value: lang, label: lang }; });
      renderDropdown(body.querySelector('#snipLanguageContainer'), {
        items: languageItems,
        value: selectedLanguage,
        placeholder: 'Select language',
        ariaLabel: 'Language',
        onChange: function (value) { selectedLanguage = value; }
      });

      body.querySelector('#btnSnipCancel').addEventListener('click', function () {
        if (isEdit) renderDetailView(existing); else closeModal();
      });

      body.querySelector('#snipTitle').focus();

      body.querySelector('#snippetForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var title = body.querySelector('#snipTitle').value.trim();
        var bookId = selectedBookId;
        var language = (selectedLanguage || '').trim();
        var code = body.querySelector('#snipCode').value;
        var notes = body.querySelector('#snipNotes').value.trim();
        var tags = parseTags(body.querySelector('#snipTags').value);

        if (isEdit) {
          existing.title = title || 'Untitled snippet';
          existing.bookId = bookId;
          existing.language = language;
          existing.code = code;
          existing.notes = notes;
          existing.tags = tags;
          existing.updatedAt = Date.now();
          saveSnippets();
          renderLanguageFilterOptions();
          renderBookList();
          renderGrid();
          renderDetailView(existing);
        } else {
          var now = Date.now();
          var newSnip = {
            id: generateId(),
            bookId: bookId,
            title: title || 'Untitled snippet',
            language: language,
            code: code,
            notes: notes,
            tags: tags,
            pinned: false,
            archived: false,
            createdAt: now,
            updatedAt: now
          };
          state.snippets.unshift(newSnip);
          saveSnippets();
          state.activeBookId = bookId;
          state.view = 'active';
          updateArchiveButtonVisual();
          updateActiveBookHeader();
          renderLanguageFilterOptions();
          renderBookList();
          renderGrid();
          closeModal();
        }
      });
    });
  }

  function openSnippetDetail(id) {
    var snip = findSnippet(id);
    if (!snip) return;
    renderDetailView(snip);
  }

  function renderDetailView(snip) {
    var langBadge = snip.language ? '<span class="lang-badge lang-' + hashLangIndex(snip.language) + '">' + escapeHtml(snip.language) + '</span>' : '';
    var tagsHtml = (snip.tags || []).map(function (t) { return '<span class="tag-chip">' + escapeHtml(t) + '</span>'; }).join('');
    var book = findBook(snip.bookId);

    var html =
      (langBadge ? '<div class="detail-badges">' + langBadge + '</div>' : '') +
      '<div class="detail-code-wrap">' +
      '<pre class="detail-code">' + escapeHtml(snip.code || '(no code)') + '</pre>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-icon detail-copy" id="btnDetailCopy" title="Copy code" aria-label="Copy code">' + ICONS.copy + '</button>' +
      '</div>' +
      (snip.notes ? '<p class="detail-notes">' + escapeHtml(snip.notes) + '</p>' : '') +
      (tagsHtml ? '<div class="detail-tags">' + tagsHtml + '</div>' : '') +
      '<div class="detail-meta">Book ' + escapeHtml(book ? book.name : 'Unfiled') + ' &middot; Created ' + formatDate(snip.createdAt) + ' &middot; Updated ' + formatDate(snip.updatedAt) + '</div>' +
      '<div class="modal-actions-split">' +
      '<button type="button" class="btn btn-danger btn-sm" id="btnDetailDelete">Delete</button>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnDetailPin">' + (snip.pinned ? 'Unpin' : 'Pin') + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnDetailArchive">' + (snip.archived ? 'Restore' : 'Archive') + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnDetailEdit">Edit</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnDetailClose">Close</button>' +
      '</div>' +
      '</div>';

    openModal(snip.title || 'Untitled snippet', html, function (body) {
      body.querySelector('#btnDetailCopy').addEventListener('click', function () {
        copyText(snip.code, body.querySelector('#btnDetailCopy'));
      });
      body.querySelector('#btnDetailPin').addEventListener('click', function () {
        snip.pinned = !snip.pinned;
        saveSnippets();
        renderGrid();
        renderDetailView(snip);
      });
      body.querySelector('#btnDetailArchive').addEventListener('click', function () {
        snip.archived = !snip.archived;
        if (snip.archived) snip.pinned = false;
        saveSnippets();
        renderLanguageFilterOptions();
        renderBookList();
        renderGrid();
        closeModal();
      });
      body.querySelector('#btnDetailEdit').addEventListener('click', function () { renderSnippetForm(snip, snip.bookId); });
      body.querySelector('#btnDetailDelete').addEventListener('click', function () { confirmDeleteSnippet(snip.id); });
      body.querySelector('#btnDetailClose').addEventListener('click', closeModal);
    });
  }



  function exportAllData() {
    var payload = { books: state.books, snippets: state.snippets };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'snippetbuddy-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function showImportError() {
    openModal('Import Failed', '<p class="modal-message">Could not import that file. Make sure it is a SnippetBuddy JSON export.</p>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="btnImportErrOk">OK</button></div>', function (body) {
      body.querySelector('#btnImportErrOk').addEventListener('click', closeModal);
    });
  }

  function openImportConflictModal(onReplace, onAppend) {
    var html =
      '<p class="modal-message">You already have books or snippets saved. Append the imported data to what you have, ' +
      'or clean up and replace everything with the imported file?</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnImportAppend">Append</button>' +
      '<button class="btn btn-danger" id="btnImportReplace">Cleanup &amp; Replace</button>' +
      '</div>';
    openModal('Import Data', html, function (body) {
      body.querySelector('#btnImportAppend').addEventListener('click', function () {
        closeModal();
        onAppend();
      });
      body.querySelector('#btnImportReplace').addEventListener('click', function () {
        closeModal();
        onReplace();
      });
    }, { autoSize: true });
  }

  function applyImportedData(newBooks, newSnippets, replaceExisting) {
    if (replaceExisting) {
      state.books = newBooks;
      state.snippets = newSnippets;
    } else {
      state.books = state.books.concat(newBooks);
      state.snippets = state.snippets.concat(newSnippets);
    }
    ensureDefaultBookAndMigrate();
    ensureActiveBookId();
    saveBooks();
    saveSnippets();
    updateActiveBookHeader();
    renderLanguageFilterOptions();
    renderBookList();
    renderGrid();
    updateBooksVisibility();
  }






  function remapImportedBooksAndSnippets(incomingBooks, incomingSnippets) {
    var idMap = {};
    var newBooks = incomingBooks.map(function (b) {
      var nb = { id: generateId(), name: (b.name ? String(b.name).trim() : '') || 'Imported Book', createdAt: b.createdAt || Date.now() };
      idMap[b.id] = nb.id;
      return nb;
    });

    var fallbackBook = null;
    function resolveBookId(oldId) {
      if (oldId && idMap[oldId]) return idMap[oldId];
      if (!fallbackBook) {
        fallbackBook = { id: generateId(), name: 'Imported', createdAt: Date.now() };
        newBooks.push(fallbackBook);
      }
      return fallbackBook.id;
    }

    var newSnippets = incomingSnippets.map(function (item) {
      return {
        id: generateId(),
        bookId: resolveBookId(item.bookId),
        title: (item.title ? String(item.title).trim() : '') || 'Untitled snippet',
        language: item.language ? String(item.language).trim() : '',
        code: item.code != null ? String(item.code) : '',
        notes: item.notes ? String(item.notes).trim() : '',
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        pinned: !!item.pinned,
        archived: !!item.archived,
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now()
      };
    });

    return { books: newBooks, snippets: newSnippets };
  }

  function importDataFromFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try {
        data = JSON.parse(reader.result);
      } catch (e) {
        showImportError();
        return;
      }

      var incomingBooks, incomingSnippets;
      if (Array.isArray(data)) {
        incomingBooks = [];
        incomingSnippets = data;
      } else if (data && Array.isArray(data.snippets)) {
        incomingBooks = Array.isArray(data.books) ? data.books : [];
        incomingSnippets = data.snippets;
      } else {
        showImportError();
        return;
      }

      var remapped = remapImportedBooksAndSnippets(incomingBooks, incomingSnippets);

      var hasExistingData = state.snippets.length > 0 || state.books.length > 0;
      if (hasExistingData) {
        openImportConflictModal(
          function () { applyImportedData(remapped.books, remapped.snippets, true); },
          function () { applyImportedData(remapped.books, remapped.snippets, false); }
        );
      } else {
        applyImportedData(remapped.books, remapped.snippets, false);
      }
    };
    reader.readAsText(file);
  }




  function handleLoadSample(e) {
    e.preventDefault();
    if (window.location.protocol === 'file:') {
      openConfirmModal(
        'Server Required',
        'Loading the sample snippets needs the app to be served from a local or remote server — it can’t read local files when index.html is opened directly from your file system. Instead, download snippetBuddy_sample.json from cdnBuddy/samples and use the Import button (top-left) to load it.',
        'OK', function () {});
      return;
    }
    fetch('https://isafuianish-dev.github.io/webapp_cdnBuddy/samples/snippetBuddy_sample.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(function (parsed) {
        if (!parsed || !Array.isArray(parsed.books) || !Array.isArray(parsed.snippets)) throw new Error('Invalid data');
        var remapped = remapImportedBooksAndSnippets(parsed.books, parsed.snippets);
        applyImportedData(remapped.books, remapped.snippets, false);
      })
      .catch(function () {
        openConfirmModal('Load Failed', 'Could not load the sample snippets.', 'OK', function () {});
      });
  }



  function renderDropdown(container, config) {
    var items = config.items || [];
    var selectedItem = items.find(function (i) { return i.value === config.value; });

    var selectedHtml = selectedItem
      ? (selectedItem.icon || '') + '<span>' + escapeHtml(selectedItem.label) + '</span>'
      : '<span class="dropdown-placeholder">' + escapeHtml(config.placeholder || 'Select') + '</span>';

    var optionsHtml = items.map(function (item) {
      var activeClass = item.value === config.value ? ' active' : '';
      return '<button type="button" class="dropdown-option' + activeClass + '" data-value="' + escapeHtml(item.value) + '">' +
        (item.icon || '') + '<span>' + escapeHtml(item.label) + '</span></button>';
    }).join('');

    container.innerHTML =
      '<div class="dropdown">' +
      '<button type="button" class="form-control dropdown-toggle" aria-haspopup="listbox" aria-expanded="false"' +
      (config.ariaLabel ? ' aria-label="' + escapeHtml(config.ariaLabel) + '"' : '') + '>' +
      '<span class="dropdown-selected">' + selectedHtml + '</span>' +
      ICONS.chevronDown +
      '</button>' +
      '<div class="dropdown-menu" role="listbox" hidden>' + optionsHtml + '</div>' +
      '</div>';

    var dropdown = container.querySelector('.dropdown');
    var toggle = dropdown.querySelector('.dropdown-toggle');
    var menu = dropdown.querySelector('.dropdown-menu');
    var selectedDisplay = dropdown.querySelector('.dropdown-selected');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        dropdown.classList.remove('open');
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        dropdown.classList.add('open');
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    menu.querySelectorAll('.dropdown-option').forEach(function (option) {
      option.addEventListener('click', function () {
        var value = option.getAttribute('data-value');
        var item = items.find(function (i) { return i.value === value; });
        config.value = value;
        selectedDisplay.innerHTML = item ? (item.icon || '') + '<span>' + escapeHtml(item.label) + '</span>' : '';
        menu.querySelectorAll('.dropdown-option').forEach(function (o) {
          o.classList.toggle('active', o === option);
        });
        dropdown.classList.remove('open');
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        if (typeof config.onChange === 'function') config.onChange(value);
      });
    });
  }



  var modalApi = Buddy.modal.init();
  var openModal = modalApi.open;
  var closeModal = modalApi.close;

  function openConfirmModal(title, message, confirmLabel, onConfirm, opts) {
    opts = opts || {};
    var danger = opts.danger ? 'btn-danger' : 'btn-primary';
    var html =
      '<p class="modal-message">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnConfirmNo">' + escapeHtml(opts.cancelLabel || 'Cancel') + '</button>' +
      '<button class="btn ' + danger + '" id="btnConfirmYes">' + escapeHtml(confirmLabel) + '</button>' +
      '</div>';
    openModal(title, html, function (body) {
      body.querySelector('#btnConfirmNo').addEventListener('click', closeModal);
      body.querySelector('#btnConfirmYes').addEventListener('click', function () {
        closeModal();
        onConfirm();
      });
    }, { autoSize: true });
  }

  function openNameModal(title, defaultValue, onSave) {
    var html =
      '<div class="form-group"><label for="nameInput">Name</label>' +
      '<input type="text" id="nameInput" class="form-control" placeholder="e.g. Work Snippets"></div>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" id="btnNameCancel">Cancel</button>' +
      '<button class="btn btn-primary" id="btnNameSave">Save</button>' +
      '</div>';
    openModal(title, html, function (body) {
      var input = body.querySelector('#nameInput');
      input.value = defaultValue || '';
      input.focus();
      input.select();
      body.querySelector('#btnNameCancel').addEventListener('click', closeModal);
      body.querySelector('#btnNameSave').addEventListener('click', submit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
      function submit() {
        var val = input.value.trim();
        if (!val) { input.focus(); return; }
        closeModal();
        onSave(val);
      }
    }, { autoSize: true });
  }



  function cacheDom() {
    dom.btnSettings = document.getElementById('btnSettings');

    dom.bookSearch = document.getElementById('bookSearch');
    dom.btnNewBook = document.getElementById('btnNewBook');
    dom.btnExportAll = document.getElementById('btnExportAll');
    dom.fileImportData = document.getElementById('fileImportData');
    dom.fileBtnIcon = document.getElementById('fileBtnIcon');
    dom.bookList = document.getElementById('bookList');

    dom.activeBookTitle = document.getElementById('activeBookTitle');
    dom.btnNewSnippet = document.getElementById('btnNewSnippet');
    dom.snippetSearch = document.getElementById('snippetSearch');
    dom.languageFilterContainer = document.getElementById('languageFilterContainer');
    dom.btnArchiveView = document.getElementById('btnArchiveView');

    dom.gridWrap = document.getElementById('gridWrap');
    dom.pinnedSection = document.getElementById('pinnedSection');
    dom.pinnedGrid = document.getElementById('pinnedGrid');
    dom.othersSection = document.getElementById('othersSection');
    dom.othersTitle = document.getElementById('othersTitle');
    dom.othersGrid = document.getElementById('othersGrid');
    dom.emptyState = document.getElementById('emptyState');

    dom.noBooksState = document.getElementById('noBooksState');
    dom.mainContent = document.getElementById('mainContent');
    dom.sidebarLoadSampleHint = document.getElementById('sidebarLoadSampleHint');
    dom.linkLoadSampleSidebar = document.getElementById('linkLoadSampleSidebar');
  }

  function wireEvents() {
    dom.btnSettings.addEventListener('click', openSettingsModal);

    dom.bookSearch.addEventListener('input', function () {
      state.bookSearch = dom.bookSearch.value;
      renderBookList();
    });
    dom.btnNewBook.addEventListener('click', openNewBookModal);
    dom.linkLoadSampleSidebar.addEventListener('click', handleLoadSample);
    dom.btnExportAll.addEventListener('click', exportAllData);
    dom.fileImportData.addEventListener('change', function () {
      var file = this.files[0];
      if (file) importDataFromFile(file);
      this.value = '';
    });

    dom.bookList.addEventListener('click', function (e) {
      var item = e.target.closest('.book-item');
      if (!item) return;
      var id = item.getAttribute('data-id');

      if (e.target.closest('.book-edit')) { renameBook(id); return; }
      if (e.target.closest('.book-delete')) { deleteBook(id); return; }

      selectBook(id);
    });

    dom.btnNewSnippet.addEventListener('click', openNewSnippetModal);
    dom.snippetSearch.addEventListener('input', function () {
      state.search = dom.snippetSearch.value;
      renderGrid();
    });
    dom.btnArchiveView.addEventListener('click', function () {
      state.view = state.view === 'active' ? 'archived' : 'active';
      updateArchiveButtonVisual();
      renderLanguageFilterOptions();
      renderGrid();
    });

    dom.gridWrap.addEventListener('click', function (e) {
      var card = e.target.closest('.snippet-card');
      if (!card) return;
      var id = card.getAttribute('data-id');

      var actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        var action = actionBtn.getAttribute('data-action');
        if (action === 'pin') { togglePin(id); return; }
        if (action === 'copy') {
          var s = findSnippet(id);
          if (s) copyText(s.code, actionBtn);
          return;
        }
        if (action === 'archive') { toggleArchive(id); return; }
        if (action === 'delete') { confirmDeleteSnippet(id); return; }
        return;
      }

      if (e.target.closest('.card-body')) {
        openSnippetDetail(id);
      }
    });


    document.addEventListener('click', function (e) {
      document.querySelectorAll('.dropdown.open').forEach(function (dd) {
        if (dd.contains(e.target)) return;
        dd.classList.remove('open');
        var menu = dd.querySelector('.dropdown-menu');
        if (menu) menu.hidden = true;
        var toggle = dd.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });

  }

  function init() {
    cacheDom();
    dom.btnSettings.innerHTML = ICONS.settings;
    dom.btnExportAll.innerHTML = ICONS.download;
    dom.fileBtnIcon.innerHTML = ICONS.upload;
    dom.btnArchiveView.innerHTML = ICONS.archive;

    state.books = loadBooks();
    state.snippets = loadSnippets();
    ensureDefaultBookAndMigrate();
    ensureActiveBookId();

    updateArchiveButtonVisual();
    updateActiveBookHeader();
    renderBookList();
    renderLanguageFilterOptions();
    renderGrid();
    updateBooksVisibility();

    wireEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
