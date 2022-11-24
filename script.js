import {ModalWin} from './modalWin.js';

let notesCounter = 1;
let menu = document.querySelector('.menu');

menu.classList.add('unselectable');
// menu.style.height = document.documentElement.clientHeight + 'px';

function resizeMenu() {
  let buttonMenu = document.getElementById('menu');
  let notes = document.querySelector('.notes');
  let flag = true;
  let descriptions = menu.getElementsByClassName('description');
  let increaseTimeOut, showDescriptionId;

  menu.onmouseover = function(event) {
    if (event.relatedTarget && event.relatedTarget.closest('.menu')) return;
    increaseTimeOut = setTimeout(() => {
      increaseMenu();
    }, 200);
  }

  menu.onmouseout = function(event) {
    if (event.relatedTarget && event.relatedTarget.closest('.menu')) return;
    clearTimeout(increaseTimeOut);
    
    if (flag) {
      decreaseMenu();
    }
  }

  buttonMenu.onclick = function() {
    if (flag) {
      increaseMenu();

      flag = false;
    } else {
      decreaseMenu();

      flag = true;
    }
  }

  function increaseMenu() {
    showDescriptionId = setTimeout(() => {
      for (let description of descriptions) {
        description.style.display = 'inline';
      }
    }, 100);
    
    menu.style.boxShadow = '2px 10px 10px rgba(0, 0, 0, 0.2)';
    menu.style.width = '250px';
    notes.style.marginLeft = '280px';
    
  }

  function decreaseMenu() {
    clearTimeout(showDescriptionId);
    for (let description of descriptions) {
      description.style.display = '';
    }
    
    menu.style.boxShadow = '';
    menu.style.width = '';
    notes.style.marginLeft = '';
  }
}

resizeMenu();

class Note {
  constructor(note, notesCounter) {
    this.noteElem = note;
    this.noteImg = null;
    this.notesCounter = notesCounter;
  }

  setImg_(img) {
    if (img) {
      let noteImg = this.noteElem.querySelector('.note-img');

      if (noteImg) {
        noteImg.replaceWith(img);
      } else {
        this.noteElem.prepend(img);
      }
      
      img.className = 'note-img';
    }
  }

  setNoteContent(title, data, img) {
    let note = this.noteElem;
    let title_ = note.querySelector('.note-title');

    if (title) {
      title_.textContent = title;
    } else {
      title_.textContent = 'Заметка' + this.notesCounter;
    }

    let noteData = note.querySelector('.note-data');
    
    noteData.innerHTML = data;
    this.checkHeight(noteData);    
    this.setImg_(img);
  }

  checkHeight(elem) {
    let overflow = this.noteElem.querySelector('.note-overflow');

    if (elem.offsetHeight >= 500) {
      overflow.textContent = '...';
    } else {
      overflow.textContent = '';
    }
  }

  editNote(resolve) {
    const win = new ModalWin(0.5);
  
    win.createWindow();
    
    if (resolve) {
      win.textContent('Создать заметку');
    } else {
      win.textContent('Редактировать заметку');
    }
  
    let title = win.textInput(this.noteElem.querySelector('.note-title').textContent, 'Введите заголовок');
    let noteData = document.createElement('div');
  
    title.maxLength = '100';
    win.addElement(noteData, 1.2);
  
    let textArea = document.createElement('div');
    
    textArea.contentEditable = true;
    textArea.innerHTML = this.noteElem.querySelector('.note-data').innerHTML;
    textArea.className = 'textarea pretty-scroll';
  
    // add placeholder
    const placeholder = '<span class="placeholder">Заметка...</span>';
  
    textArea.innerHTML === '' && (textArea.innerHTML = placeholder);
  
    textArea.addEventListener('focus', function (event) {
      const value = event.target.innerHTML;
  
      value === placeholder && (event.target.innerHTML = '');
    });
  
    textArea.addEventListener('blur', function (event) {
      const value = event.target.textContent;
  
      value === '' && (event.target.innerHTML = placeholder);
    });
  
    noteData.append(textArea);
  
    let formatBar = document.createElement('div');
  
    formatBar.style.cssText = `
      margin-top: 2px;
      text-align: center;
    `;
  
    let formatBarFuncs = new FormatBar(this, textArea, 'black', 'black');
    let funcNames = {
      'bold': 'Жирный', 'italic': 'Курсив', 'underline': 'Подчеркнутый', 
      'link': 'Гиперссылка', 'code': 'Встроить код', 'image': 'Добавить изображение',
      'letterColor': 'Цвет шрифта', 'backgroundColor': 'Цвет выделения текста', 'clear': 'Очистить'
    };

    for (let name of Object.keys(funcNames)) {
      let container = document.createElement('div');
      let img = document.createElement('img');
      
      container.style.position = 'relative';
      img.setAttribute('data-prompt', funcNames[name]);
  
      img.src = 'formatIcons/' + name + '.png';
      img.classList.add('format-bar-img');
  
      img.ondragstart = function() {
        return false;
      };
  
      container.classList.add('format-bar-container');
      container.classList.add('unselectable');
      container.append(img);
  
      formatBar.append(container);
  
      container.onclick = function(event) {
        if (event.target != img && event.target != container) return;
  
        let result = formatBarFuncs[name](container);
  
        if (result) {
          wrapSelectedText(result, textArea);
        }
      }
    }
  
    let textColor = formatBar.querySelector('[src*="letterColor"]').parentElement;
    let backgroundColor = formatBar.querySelector('[src*="backgroundColor"]').parentElement;
  
    let textColPicker = document.createElement('input');
    let backgroundColPicker = document.createElement('input');
  
    let selectedTextColor = document.createElement('div');
    let selectedBackColor = document.createElement('div');
  
    selectedTextColor.className = 'selected-color';
    selectedBackColor.className = 'selected-color';
  
    selectedTextColor.onclick = function() {
      textColPicker.click();
    }
  
    selectedBackColor.onclick = function() {
      backgroundColPicker.click();
    }
  
    textColPicker.type = 'color';
    backgroundColPicker.type = 'color';
  
    textColPicker.style.position = 'absolute';
    backgroundColPicker.style.position = 'absolute';
  
    textColPicker.style.opacity = '0';
    backgroundColPicker.style.opacity = '0';
  
    textColPicker.oninput = function() {
      let value = textColPicker.value;
  
      selectedTextColor.style.backgroundColor = value;
      formatBarFuncs.changeTextColor(value);
    }
  
    backgroundColPicker.oninput = function() {
      let value = backgroundColPicker.value;
  
      selectedBackColor.style.backgroundColor = value;
      formatBarFuncs.changeBackgroundColor(value);
    }
  
    textColor.append(textColPicker);
    backgroundColor.append(backgroundColPicker);
  
    textColor.append(selectedTextColor);
    backgroundColor.append(selectedBackColor);
  
    noteData.append(formatBar);
  
    let submitButton = win.submitButton('ок', 'green', 'white', false, 2);
    let cancelButton = win.cancelButton('отмена');
    
    submitButton.style.padding = '0.7% 6% 0.7%';

    submitButton.onclick = () => {
      for (let elem of textArea.querySelectorAll('*')) {
        if (elem.innerHTML.trim() == '<br>') {
          elem.remove();
        }
      }

      this.setNoteContent(title.value.trim(), textArea.innerHTML, this.noteImg);
      win.delWindow();

      if (resolve) {
        resolve(true);
      }
    }
    
    cancelButton.onclick = () => {
      this.noteImg = this.noteElem.querySelector('.note-img');
      win.delWindow();

      if (resolve) {
        resolve(false);
      }
    }
  
    win.align();
  }

  delNote() {
    let win = new ModalWin();

    win.createWindow(30, false, 'white', true);
    win.textContent('Удалить заметку?', 2);
    win.winContent.classList.add('unselectable');

    let submitButton = win.submitButton('да');

    submitButton.style.padding = ' 0.7% 6% 0.7%';
    win.winContent.style.marginBottom = '1px';
    win.align();

    let noteElem = this.noteElem;

    submitButton.onclick = function() {
      noteElem.remove();
      notesCounter -= 1;
      win.delWindow();
    }

    win.darkLayer.onclick = function() {
      win.delWindow();
    }
  }
}


function createNote() {
  let note = document.createElement('div');
  let title = document.createElement('div');
  let data = document.createElement('div');
  let overflow = document.createElement('div');

  overflow.className = 'note-overflow';
  note.classList.add('note');
  note.style.backgroundColor = 'rgb(255,255,255)';
  title.classList.add('note-title');
  data.classList.add('note-data');

  note.append(title);
  note.append(data);

  let controlPanel = document.createElement('div');
  let important = document.createElement('img');
  let importantMark = document.createElement('img');

  important.src = 'icons/important-light.png';
  important.setAttribute('data-prompt', 'Отметить как важная');

  importantMark.src = 'icons/important.png';

  controlPanel.className = 'note-control unselectable';
  important.className = 'note-control important';
  importantMark.className = 'note-control important-mark';
  importantMark.style.display = 'none';

  note.querySelector('.note-title').before(important);
  note.append(importantMark);
  note.append(overflow);

  let editButton = document.createElement('img');

  editButton.setAttribute('data-prompt', 'Редактировать заметку');
  editButton.src = 'icons/note-edit.png';
  editButton.className = 'note-edit-button';

  controlPanel.append(editButton);

  let delNote = document.createElement('img');

  delNote.setAttribute('data-prompt', 'Удалить заметку');
  delNote.src = 'icons/delete.png';
  delNote.className = 'note-del-button';

  controlPanel.append(delNote);

  let colorPicker = document.createElement('img');

  colorPicker.setAttribute('data-prompt', 'Изменить фон');
  colorPicker.src = 'icons/color-palette.png';
  colorPicker.className = 'note-color-button';

  controlPanel.append(colorPicker);
  note.append(controlPanel);

  return note;
}

function showNote(note) {
  let title = note.querySelector('.note-title');
  let data = note.querySelector('.note-data');
  let img = note.querySelector('.note-img');
  let background = note.style.backgroundColor;

  let win = new ModalWin();
  let modalWin = win.createWindow(80, false, background);
  let shadow = win.darkLayer;

  note.style.visibility = 'hidden';

  modalWin.style.overflow = 'auto';
  modalWin.style.maxHeight = window.innerHeight * 0.9 + 'px';
  modalWin.classList.add('show-note');
  modalWin.classList.add('unselectable');

  let title_ = win.textContent(title.textContent);
  title_.textContent = title.textContent;

  if (img) {
    let cloneImg = img.cloneNode(true);
    let container = document.createElement('div');

    // cloneImg.removeAttribute('data-uploaded');
    container.className = 'show-note-container';
    container.style.height = img.offsetHeight;
    container.append(cloneImg);
    container.append(title_);
    modalWin.prepend(container);
  }

  let cloneData = data.cloneNode(true);

  win.winContent.style.overflowX = 'hidden';
  cloneData.style.maxHeight = 'none';
  win.addElement(cloneData, 1.7);

  shadow.onclick = function() {
    win.delWindow();
    note.style.visibility = '';
  }

  win.align();
}

let cancel = document.getElementById('cancel');
let createElem = document.getElementById('create-elem');

let search = document.getElementById('search');
let notes = document.querySelector('.notes');

search.onfocus = function() {
  for (let note of notes.children) {
    note.style.display = 'none';
  }
}

search.oninput = function() {
  let value = search.value;

  for (let note of notes.children) {
    let title = note.querySelector('.note-title');

    if (title.textContent.toLowerCase().includes(value.toLowerCase().trim()) && value.trim()) {
      note.style.display = '';
    } else {
      note.style.display = 'none';
    }
  }
}

search.onblur = function() {
  if (!search.value.trim()) {
    search.value = '';

    for (let note of notes.children) {
      note.style.display = '';
    }
  }
}

cancel.addEventListener('click', function() {
  search.value = '';

  for (let note of notes.children) {
    note.style.display = '';
  }
});

createElem.onclick = function() {
  let noteElem = createNote();
  let note = new Note(noteElem, notesCounter);
  let promise = new Promise((resolve) => note.editNote(resolve));

  noteElem.setAttribute('data-important', false);
  noteElem.noteControl = note;

  promise.then(
    result => {
      if (result) {
        notesCounter += 1;
        document.querySelector('.notes').append(noteElem);
        note.checkHeight(noteElem.querySelector('.note-data'));
      }
    }
  );
}

notesEventHandler();

function notesEventHandler() {
  let notes = document.querySelector('.notes');

  notes.addEventListener('click', function(event) {
    let elem = event.target;
    let note = elem.closest('.note');

    if (!note) {
      return;
    }
    if (elem.classList.contains('important')) {
      let important = note.querySelector('.important');

      if (note.getAttribute('data-important') == 'true') {
        note.setAttribute('data-important', false);

        important.src = 'icons/important-light.png';
        important.setAttribute('data-prompt', 'Отметить как важная');
      } else {
        note.setAttribute('data-important', true);

        important.src = 'icons/important-dark.png';
        important.setAttribute('data-prompt', 'Убрать отметку');
      }
    } else if (elem.classList.contains('note-edit-button')) {
      note.noteControl.editNote();
    } else if (elem.classList.contains('note-del-button')) {
      note.noteControl.delNote();
    } else if (elem.classList.contains('note-color-button')) {
      colorPickerPanel(note);
    } else if (elem.closest('.note')) {
      showNote(elem.closest('.note'));
    }
  })

  notes.addEventListener('mouseover', function(event) {
    let elem = event.target;
    let note = elem.closest('.note');

    if (!note) {
      return;
    }

    let importantMark = note.querySelector('.important-mark');

    if (note.dataset.important === 'true') {
      importantMark.style.display = 'none';
    }
    importantMark.style.opacity = '0';

    for (let elem of note.querySelectorAll('.note-control:not(.important-mark)')) {
      elem.style.opacity = '1';
    }
  })

  notes.addEventListener('mouseout', function(event) {
    let elem = event.target;
    let note = elem.closest('.note');

    if (!note) {
      return;
    }

    let importantMark = note.querySelector('.important-mark');

    if (note.dataset.important === 'true') {
      importantMark.style.display = '';
    }
    importantMark.style.opacity = '';

    for (let elem of note.querySelectorAll('.note-control:not(.important-mark)')) {
      elem.style.opacity = '0';
    }
  })

  function colorPickerPanel(note) {
    let panel = document.createElement('div');
    let colors = {
      'rgb(255,255,255)': 'Белый', 'rgb(255,112,112)': 'Красный', 'rgb(251,188,4)': 'Оранжевый', 
      'rgb(254,251,122)': 'Желтый', 'rgb(158,255,150)': 'Зеленый', 'rgb(168,188,255)': 'Синий',
      'rgb(175,153,255)': 'Фиолетовый', 'rgb(255,179,255)': 'Розовый', 'rgb(220,179,121)': 'Коричневый',
      'rgb(220,220,220)': 'Серый',
    }

    panel.className = 'note-color-picker';
    
    window.addEventListener('resize', onResize);
    onResize();

    function onResize() {
      let coords = getCoords(note);
      
      panel.style.top = coords.bottom + 'px';
      panel.style.left = coords.left + coords.width / 2 + 'px';
    }

    for (let color of Object.keys(colors)) {
      let colorElem = document.createElement('div');

      if (color == note.style.backgroundColor.replaceAll(' ', '')) {
        colorElem.classList.add('selected');
      }
      colorElem.classList.add('note-color');
      colorElem.style.backgroundColor = color;
      colorElem.setAttribute('data-prompt', colors[color]);
      panel.append(colorElem);
    }

    notes.append(panel);
    panel.onclick = function(event) {
      let elem = event.target;

      if (elem.classList.contains('note-color')) {
        let selectedElem = panel.querySelector('.note-color.selected');

        selectedElem.classList.remove('selected');
        elem.classList.add('selected');
        note.style.backgroundColor = elem.style.backgroundColor;
      }
    }

    setTimeout(() => {
      document.addEventListener('click', onClick);
    }, 0);

    function onClick(event) {
      if (!event.target.closest('.note-color-picker')) {
        panel.remove();
        document.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
      }
    }
  }
}

showPrompt();

function showPrompt() {
  let promptElem = document.createElement('div');
  let timerId;
  let delayId;
  let flagDelay = true;

  promptElem.id = 'prompt';
  promptElem.style.display = 'none';

  function onMouseDown(event) {
    promptElem.style.display = 'none';
    event.target.removeEventListener('mousedown', onMouseDown);
  }

  document.body.append(promptElem);
  document.addEventListener('mouseover', function(event) {
    let elem = event.target;

    if (elem.hasAttribute('data-prompt')) {
      function showPrompt_() {
        promptElem.style.display = '';
        elem.addEventListener('mousedown', onMouseDown);

        let coords = elem.getBoundingClientRect();
        let coordsRelToDocument = getCoords(elem);

        promptElem.style.top = coordsRelToDocument.bottom + 10 + 'px';
        promptElem.style.left = coordsRelToDocument.left + 'px';
        promptElem.style.transform = 'translate(0px, 0px)';

        if (coords.top > document.documentElement.clientHeight - coords.height - 30) {
          promptElem.style.top = coordsRelToDocument.top - coords.height - 10 + 'px';
        }

        if (coords.left > promptElem.offsetWidth / 2 - 30) {
          promptElem.style.left = coordsRelToDocument.left + coords.width / 2 + 'px';
          promptElem.style.transform = 'translate(-50%, 0px)';
        }
        
        if (coords.left > document.documentElement.clientWidth - promptElem.offsetWidth - 30) {
          promptElem.style.left = coordsRelToDocument.right + 'px';
          promptElem.style.transform = 'translate(-100%, 0px)';
        }
        promptElem.textContent = elem.getAttribute('data-prompt');
      }

      if (flagDelay) {
        showPrompt_();

        setTimeout(() => {
          clearTimeout(delayId);
          flagDelay = true;
        }, 0);
      } else {
        timerId = setTimeout(() => {
          showPrompt_();

          setTimeout(() => {
            clearTimeout(delayId);
            flagDelay = true;
          }, 0);
        }, 400);
      }
    }
  });

  document.addEventListener('mouseout', function(event) {
    let elem = event.relatedTarget;

    clearTimeout(timerId);
    promptElem.style.display = 'none';
    if (elem && elem.removeEventListener) {
      elem.removeEventListener('mousedown', onMouseDown);
    }

    clearTimeout(delayId);
    delayId = setTimeout(() => {
      flagDelay = false;
    }, 200);
  });
}


document.addEventListener('paste', function(event) {
  event.preventDefault();
  document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
});

window.addEventListener('scroll', function() {
  // document.getElementById('showScroll').innerHTML = pageYOffset + 'px';
  let searchPanel = this.document.querySelector('.search-container');
  let panelHeight = searchPanel.offsetHeight;

  if (pageYOffset >= panelHeight) {
    searchPanel.style.position = 'fixed';
    searchPanel.style.boxShadow = `0px 2px 4px rgba(0, 0, 0, 0.2)`;

    if (pageYOffset >= panelHeight + 40) {
      searchPanel.style.transition = 'transform .2s';
      searchPanel.style.transform = `translateY(0px)`;
    } else {
      searchPanel.style.transform = `translateY(-${panelHeight}px)`;
    }
  } else {
    searchPanel.style.transition = 'transform .2s';
    searchPanel.style.transform = `translateY(-${panelHeight}px)`;
    
    setTimeout(() => {
      searchPanel.style.position = '';
      searchPanel.style.transition = 'transform 0s';
      searchPanel.style.transform = '';
      searchPanel.style.boxShadow = '';
    }, 20);
  }
});

class FormatBar {
  constructor(note, textArea, textColor, backgroundColor) {
    this.textArea = textArea;
    this.textCol = textColor;
    this.backgroundCol = backgroundColor;

    this.note = note;
    this.imgData = {
      img: null,
      panelValues: {},
      formatingString: '',
      src: '',
    }
  }

  bold() {
    let b = document.createElement('b');

    return b;
  }

  italic() {
    let i = document.createElement('i');

    return i;
  }

  underline() {
    let u = document.createElement('span');

    u.style.cssText = `
      text-decoration-line: underline;
      text-decoration-color: ${this.textCol};
    `;

    return u;
  }

  link() {
   let win = new ModalWin(0.5, true, 'hidden');

    win.createWindow(30, false, 'white', true);

    let url = win.textInput('', 'Введите url', 1.3);
    let submitButton = win.submitButton('ок');

    url.style.borderRadius = '25px';
    submitButton.style.padding = ' 0.7% 6% 0.7%';
    win.winContent.style.marginBottom = '1px';

    win.align();

    let a = document.createElement('a');

    a.target = '_blank';
    wrapSelectedText(a, this.textArea);

    submitButton.addEventListener('click', function() {
      if (url.value) {
        win.delWindow();
        a.href = url.value;
        submitButton.callEvent = true;
      } else {
        url.classList.add('shake');
        url.style.borderColor = 'rgba(255, 0, 0, 0.6)';
        url.style.backgroundColor = 'white';

        setTimeout(() => {
          url.classList.remove('shake');
          url.style.borderColor = '';
          url.style.backgroundColor = '';
        }, 200);
      }
    });

    win.darkLayer.onclick = () => {
      win.delWindow();
      a.replaceWith(a.textContent);
    }

    return false;
  }

  code() {
    let win = new ModalWin(0.5, true, 'hidden');
    let textArea = this.textArea;

    win.createWindow(60, false, 'white', true);

    let code = document.createElement('div');
    let result = document.createElement('div');
    let codeContainer = document.createElement('div');

    codeContainer.className = 'code-container';
    code.contentEditable = true;

    code.style.marginBottom = '0px';
    code.style.float = 'left';

    let exclamation = document.createElement('img');
    let exclamationText = document.createElement('span');

    exclamationText.className = 'exclamation-text';

    exclamation.hidden = true;
    exclamation.className = 'exclamation';
    exclamation.src = 'icons/warning.png';

    codeContainer.append(exclamation);
    codeContainer.append(exclamationText);

    exclamationText.style.fontSize = '0.7vw';

    exclamationText.style.border = 'none';
    exclamationText.style.outline = 'none';
    exclamationText.style.boxShadow = 'none';

    code.onpaste =  function(event) {
      event.preventDefault();
      document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
    };

    code.oninput = onInput;

    onInput();

    function onInput() {
      let cleanResult = cleanHTML(code.textContent);

      result.innerHTML = cleanResult.html;
      
      if (cleanResult.hasBannedTags || cleanResult.hasBannedAttrs) {
        if (exclamation.hidden) {
          exclamation.hidden = false;
          exclamation.classList.add('shake');

          setTimeout(() => {
            exclamation.classList.remove('shake');
          }, 200);
        }

        if (cleanResult.hasBannedTags && !cleanResult.hasBannedAttrs) {
          animateText(exclamation, exclamationText, 'Вы используете запрещенный тег! Такие теги игнорируются');
        } else if (!cleanResult.hasBannedTags && cleanResult.hasBannedAttrs) {
          animateText(exclamation, exclamationText, 'Вы используете тег с запрещенным атрибутом! Такие теги игнорируются');
        } else {
          animateText(exclamation, exclamationText, 'Вы используете запрещенный тег и тег с запрещенным атрибутом! Такие теги игнорируются', 5);
        }
      } else {
        exclamation.hidden = true;
      }
    }

    code.className = 'code pretty-scroll';
    result.className = 'code pretty-scroll';

    result.style.float = 'right';

    codeContainer.append(code);
    codeContainer.append(result);

    win.addElement(codeContainer, 4);

    let submitButton = win.submitButton('ок');

    submitButton.style.padding = ' 0.7% 6% 0.7%';
    win.winContent.style.marginBottom = '1px';

    win.align();

    submitButton.addEventListener('click', function() {
      if (code.textContent) {
        let codeElem = document.createElement('div');

        if (textArea.querySelector('.placeholder')) {
          textArea.innerHTML = '';
        }

        codeElem.innerHTML = result.innerHTML;
        textArea.append(codeElem);

        win.delWindow();
      } else {
        code.classList.add('shake');
        code.style.boxShadow = `1px 1px 2px rgba(255, 0, 0, 0.366),
        -1px 1px 2px rgba(255, 0, 0, 0.366),
        1px -1px 2px rgba(255, 0, 0, 0.366),
        -1px -1px 2px rgba(255, 0, 0, 0.366)`;

        setTimeout(() => {
          code.classList.remove('shake');
          code.style.boxShadow = '';
        }, 200);
      }
    });

    win.darkLayer.onclick = () => {
      win.delWindow();
    }

    return false;
  }

  image() {
    let win = new ModalWin(0.5, true, 'hidden');

    win.winContent.classList.add('unselectable');
    win.createWindow(30, false, 'white', true);

    let url = win.textInput('', 'Введите url', 1.4);

    url.style.width = '70%';
    url.style.padding = '1.5% 5%';
    url.style.borderRadius = '15px';

    win.textContent('ИЛИ', 2);

    let file = document.createElement('input');

    file.type = 'file';
    file.className = 'upload-button';
    file.style.display = 'none';
    file.accept = "image/*";

    win.addElement(file);

    let img = document.createElement('img');
    let imgContainer = document.createElement('div');

    imgContainer.className = 'img-container unselectable';

    img.src = 'icons/uploadImg.png';
    img.className = 'upload-img';

    imgContainer.onmouseover = () => img.style.width = '30%';
    imgContainer.onmouseout = () => img.style.width = '';

    imgContainer.append(img);
    win.addElement(imgContainer);

    let uploadedImg = document.createElement('div');
    
    uploadedImg.className = 'uploaded-img-container';
    uploadedImg.style.position = 'relative';
    win.addElement(uploadedImg);

    imgContainer.onclick = function() {
      file.click();
    }

    function createEditButton() {
      let editButton = document.createElement('img');

      editButton.src = 'icons/edit.png';
      editButton.setAttribute('data-prompt', 'Редактировать изображение');
      editButton.className = 'edit-button';

      return editButton;
    }

    function editPanel(img) {
      let editImg = new EditImg(img);
      let panel = document.createElement('div');
      // let funcs = ['opacity', 'brightness', 'blur', 'invert', 'shadow'];
      let funcs = {'opacity': 'Прозрачность', 'brightness': 'Яркость',
      'blur': 'Размытие', 'invert': 'Инверсия цветов', 'shadow': 'Тень'};

      panel.className = 'edit-panel';

      for (let func of Object.keys(funcs)) {
        let container = document.createElement('div');
        let icon = document.createElement('img');
        let range = editImg[func]();

        let panelValues = JSON.parse(img.getAttribute('panel-values'));
        if (panelValues) {
          range.value = panelValues[func];
          editImg.values[func] = panelValues[func];
        }

        icon.setAttribute('data-prompt', funcs[func]);
        icon.src =  'editImgIcons/' + func + '.png';
        icon.style.width = '5%';
        container.append(icon);

        container.append(range);
        panel.append(container);
      }

      let showValue = document.createElement('div');

      showValue.className = 'show-range-value';
      showValue.hidden = true;
      showValue.style.opacity = 0;

      document.body.append(showValue);

      panel.oninput = function(event) {
        let elem = event.target;

        if (elem.type === 'range') {
          editImg.values[elem.id] = elem.value;

          img.style.filter = editImg.formatString();
          // img.panelValues = editImg.values;
          img.setAttribute('panel-values', JSON.stringify(editImg.values));
        }
      }

      panel.onmousedown = function(event) {
        let elem = event.target;

        if (elem.type === 'range') {
          editImg.values[elem.id] = elem.value;
          img.style.filter = editImg.formatString();

          showValue.hidden = false;
          showValue.style.opacity = 1;
          onMouseMove();

          document.addEventListener('mouseup', onMouseUp);
          document.addEventListener('mousemove', onMouseMove);

          function onMouseMove() {
            showValue.textContent = elem.value;
          }

          function onMouseUp() {
            showValue.style.opacity = 0;

            setTimeout(() => {
              showValue.hidden = true;
            }, 200);

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
        }
      }

      let shadowElem = panel.lastChild;
      let colorPicker = document.createElement('input');
      let selectedColor = document.createElement('div');

      selectedColor.className = 'selected-color';

      colorPicker.type = 'color';
      colorPicker.style.cssText = `
        opacity: 0;
        position: absolute;
        bottom: 28%;
        left: 12%;
        width: 1px;
        height: 1px;
      `;

      colorPicker.oninput = function() {
        let value = colorPicker.value;

        editImg.shadowColor = value;
        selectedColor.style.backgroundColor = value;
        img.style.filter = editImg.formatString();
        img.shadowColor = value;
      }

      if (img.shadowColor) {
        colorPicker.value = img.shadowColor;
        colorPicker.oninput();
      }

      shadowElem.style.position = 'relative';
      selectedColor.onclick = () => colorPicker.click();
      shadowElem.append(colorPicker);
      shadowElem.append(selectedColor);

      setTimeout(() => {
        win.win.addEventListener('click', onClick);

        function onClick(event) {
          if (uploadedImg.querySelector('.edit-panel') && !event.target.closest('.edit-panel')) {
            panel.remove();
            showValue.remove();

            win.win.removeEventListener('click', onClick);
          }
        }
      }, 0);

      uploadedImg.append(panel);
    }

    file.onchange = function() {
      let img = document.createElement('img');
      let imgFile = file.files[0];

      img.className = 'img';
      img.src = URL.createObjectURL(imgFile);
      img.style.maxWidth = '90%';
      img.style.maxHeight = '290px';

      img.setAttribute('data-uploaded', true);

      uploadedImg.innerHTML = '';
      uploadedImg.style.padding = '2%';
      uploadedImg.append(img);

      let editButton = createEditButton();

      editButton.onclick = function() {
        editPanel(img);
      }

      uploadedImg.append(editButton);
    }

    url.oninput = function() {
      file.value = null;

      if (!(url.value.startsWith('https://') || url.value.startsWith('http://'))) {
        if (!(uploadedImg.querySelector('#url-text-message'))) {
          let textMessage = win.textContent('URL недействителен! Убедитесь, что он начинается с http:// или https://.', 5);

          textMessage.style.cssText = `
            padding: 8%;
            color: red;
          `
          textMessage.id = 'url-text-message';

          uploadedImg.innerHTML = '';
          uploadedImg.append(textMessage);

          return;
        }
        if (!url.value) {
          uploadedImg.style.padding = '';
          uploadedImg.innerHTML = '';
        }

        return;
      }

      let img = document.createElement('img');
      let messageLoading = document.createElement('div');

      img.className = 'img';

      messageLoading.textContent = 'Загрузка...';
      messageLoading.style.cssText = `
            padding: 8%;
            color: #aaa;
            font-size: 2vw;
      `;

      uploadedImg.innerHTML = '';
      uploadedImg.append(messageLoading);

      uploadedImg.style.padding = '2%';

      img.onload = function() {
        if (this.width + this.height <= 4) {
          this.onerror();
          return;
        }

        img.style.maxWidth = '90%';
        img.style.maxHeight = '290px';

        uploadedImg.innerHTML = '';
        uploadedImg.style.padding = '2%';
        uploadedImg.append(img);

        let editButton = createEditButton();

        editButton.onclick = function() {
          editPanel(img);
        }

        uploadedImg.append(editButton);
        img.onload = null;
      }

      img.onerror = function(){
        if (!(uploadedImg.querySelector('#url-text-message-error'))) {
          let textMessage = win.textContent('Не удается найти изображение по указанному URL.', 5);

          textMessage.style.cssText = `
            padding: 8%;
            color: red;
          `;

          textMessage.id = 'url-text-message-error';

          uploadedImg.innerHTML = '';
          uploadedImg.append(textMessage);

          return;
        }
      }

      img.src = url.value;
    }

    let submitButton = win.submitButton('ок', 'green', 'white', true);

    submitButton.style.padding = ' 0.7% 6% 0.7%';
    win.winContent.style.marginBottom = '1px';

    let note = this.note;

    submitButton.addEventListener('click', function() {
      let img = uploadedImg.querySelector('.img');

      if (img) {
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        note.noteImg = img;
        
        win.delWindow();
      } else {
        imgContainer.classList.add('shake');

        url.classList.add('shake');
        url.style.borderColor = 'rgba(255, 0, 0, 0.6)';
        url.style.backgroundColor = 'white';

        setTimeout(() => {
          imgContainer.classList.remove('shake');

          url.classList.remove('shake');
          url.style.borderColor = '';
          url.style.backgroundColor = '';
        }, 200);
      }
    });

    win.darkLayer.onclick = () => {
      win.delWindow();
    }

    win.align();

    let savedImg = note.noteImg;
    
    if (savedImg) {
      savedImg = savedImg.cloneNode(true);
      if (!savedImg.getAttribute('data-uploaded')) {
        url.value = savedImg.src;
      }

      savedImg.classList.add('img');
      savedImg.style.maxWidth = '90%';
      savedImg.style.maxHeight = '290px';
      
      uploadedImg.innerHTML = '';
      uploadedImg.style.padding = '2%';
      uploadedImg.append(savedImg);

      let editButton = createEditButton();

      editButton.onclick = function() {
        editPanel(savedImg);
      }

      uploadedImg.append(editButton);
    }

    return false;
  }

  letterColor() {
    let elem = document.createElement('span');
    
    elem.style.color = this.textCol;

    return elem;
  }

  backgroundColor() {
    let elem = document.createElement('span');

    elem.style.backgroundColor = this.backgroundCol;

    return elem;
  }

  clear() {
    clearWrap(this.textArea)
  }

  changeTextColor(color) {
    this.textCol = color;
  }

  changeBackgroundColor(color) {
    this.backgroundCol = color;
  }
}


function findAncestor(elem, parentElement) {
  while (true) {
    elem = elem.parentElement;

    if (!elem) break;
    if (elem == parentElement) return true;
  }

  return false;
}

function wrapSelectedText(elem, parentElement) {
  let selection = window.getSelection();

  if (selection == '') {
    return false;
  }

  if (!findAncestor(selection.anchorNode, parentElement) || !findAncestor(selection.focusNode, parentElement)) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const selectionContents = range.extractContents();

  let firstEl = selection.anchorNode.parentElement;

  for (let child of selectionContents.children) {
    if (child != firstEl) {
      child.replaceWith(child.textContent);
    }
  }

  elem.append(selectionContents);
  range.insertNode(elem);
}

function clearWrap(parentElement) {
  let selection = window.getSelection();

  if (selection == '') {
    return false;
  }

  if (!findAncestor(selection.anchorNode, parentElement) || !findAncestor(selection.focusNode, parentElement)) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const selectionContents = range.extractContents();

  for (let elem of selectionContents.children) {
    elem.replaceWith(elem.textContent);
  }

  range.insertNode(selectionContents);
}

// get coordinates relative to document
function getCoords(elem) {
  let box = elem.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset,
    right: box.right + window.pageXOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset,
    width: box.width,
    height: box.height,
  };
}

function cleanHTML(html) {
  let newDocument = document.implementation.createHTMLDocument('New Document');
  let container = newDocument.createElement('div');
  let bannedTags = ['link', 'style', 'script', 'dialog'];
  let bannedAttrs = ['id', 'class', 'style'];
  let hasBannedTags = false;
  let hasBannedAttrs = false;

  container.innerHTML = html;
  newDocument.body.append(container);

  let allNested = newDocument.querySelectorAll('*');

  for (let elem of allNested) {
    if (bannedTags.includes(elem.tagName.toLowerCase())) {
      let cleanInner = cleanHTML(elem.innerHTML);

      hasBannedTags = true;
      elem.outerHTML = cleanInner.html;

      if (cleanInner.hasBannedAttrs) {
        hasBannedAttrs = cleanInner.hasBannedAttrs;
      }

      continue;
    }

    for (let attr of elem.attributes) {
      if (attr.name.startsWith('data') || attr.name.startsWith('on') || bannedAttrs.includes(attr.name.toLowerCase())) {
        let cleanInner = cleanHTML(elem.innerHTML);

        hasBannedAttrs = true;
        elem.outerHTML = cleanInner.html;
        
        if (cleanInner.hasBannedTags) {
          hasBannedAttrs = cleanInner.hasBannedTags;
        }

        break;
      }
    }
  }

  return {
    html: container.innerHTML,
    hasBannedTags: hasBannedTags,
    hasBannedAttrs: hasBannedAttrs
  };
}

function animateText(hoverElem, textElem, text, delay=10) {
  let typingId;
  let backspacingId;
  let index;

  hoverElem.onmouseover = function() {
    clearInterval(backspacingId);
    index = textElem.textContent.length;

    textElem.style.border = '';
    textElem.style.outline = '';
    textElem.style.boxShadow = '';

    typingId = setInterval(() => {
      let content = text[index];
      
      if (content) {
        textElem.textContent += content;
      }
      
      index++;
      if (index == text.length) {
        clearInterval(typingId);
      }
    }, delay);
  }

  hoverElem.onmouseout = function() {
    clearInterval(typingId);
    
    backspacingId = setInterval(() => {
      if (!textElem.textContent.length) {
        textElem.style.border = 'none';
        textElem.style.outline = 'none';
        textElem.style.boxShadow = 'none';

        clearInterval(backspacingId);
      }

      textElem.textContent = textElem.textContent.slice(0, textElem.textContent.length - 1);
    }, delay);
  }
}

class EditImg {
  constructor(img) {
    this.img = img;
    this.shadowColor = 'black';
    this.values = {
      opacity: 1,
      brightness: 100,
      blur: 0,
      shadow: 0,
      invert: 0,
    };
  }

  opacity() {
    let range = this.createElem_(0, 1, 0.01, 1, 'rtl');
    
    range.id = 'opacity';
    return range;
  }

  brightness() {
    let range = this.createElem_(0, 600, 0.5, 100);
    
    range.id = 'brightness';
    return range;
  }

  blur() {
    let range = this.createElem_(0, 45, 0.1, 0.1);

    range.id = 'blur';
    return range;
  }

  shadow() {
    let range = this.createElem_(0, 30, 0.1, 0.1);
    
    range.id = 'shadow';
    return range;
  }

  invert() {
    let range = this.createElem_(0, 100, 0.1, 0.1);
    
    range.id = 'invert';
    return range;
  }

  formatString() {
    return `
      opacity(${this.values.opacity}) brightness(${this.values.brightness}%) blur(${this.values.blur}px)
      drop-shadow(0 0 ${this.values.shadow}px ${this.shadowColor}) invert(${this.values.invert}%)
    `;
  }

  createElem_(min, max, step, value=false, direction='ltr') {
    let elem = document.createElement('input');

    elem.type = 'range';
    elem.className = 'img-params';
    elem.ondragstart = () => false;

    elem.min = min;
    elem.max = max;
    elem.step = step;

    elem.style.direction = direction;

    if (value) {
      elem.value = value;
    }

    return elem;
  }
}