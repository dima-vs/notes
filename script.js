import {ModalWin} from './modalWin.js';

let elemCounter = 0;
let elements = {};


function createElement(head, text, url) {
  let note = document.createElement('div');

  note.classList.add('notes');

}

let cancel = document.getElementById('cancel');
let createElem = document.getElementById('create-elem');

cancel.onclick = () => document.getElementById('search').value = '';

createElem.onclick = function() {
  const win = new ModalWin(0.5, 'visible');

  win.createWindow();
  win.textContent('Создать заметку');

  let head = win.textInput('', 'Введите заголовок');
  let noteData = document.createElement('div');

  win.addElement(noteData, 4);

  let textArea = document.createElement('div');
  
  textArea.contentEditable = true;
  textArea.className = 'textarea pretty-scroll';

  // add placeholder
  const placeholder = '<span id="placeholder">Заметка...</span>';

  textArea.innerHTML === '' && (textArea.innerHTML = placeholder);

  textArea.addEventListener('focus', function (event) {
    const value = event.target.innerHTML;

    value === placeholder && (event.target.innerHTML = '');
  });

  textArea.addEventListener('blur', function (event) {
    const value = event.target.innerHTML;

    value === '' && (event.target.innerHTML = placeholder);
  });

  noteData.append(textArea);

  let formatBar = document.createElement('div');

  formatBar.style.cssText = `
    margin-top: 2px;
    text-align: center;
  `;

  let formatBarFuncs = new FormatBar(textArea, 'black', 'black');
  let funcNames = ['bold', 'italic', 'underline', 'link', 'code', 'letterColor', 'backgroundColor', 'clear'];

  for (let name of funcNames) {
    let container = document.createElement('span');
    let img = document.createElement('img');
    
    container.style.position = 'relative';

    img.src = 'formatIcons/' + name + '.png';
    img.classList.add('formatBarImg');

    img.ondragstart = function() {
      return false;
    };

    container.classList.add('formatBar');
    container.classList.add('unselectable');
    container.append(img);

    formatBar.append(container);

    container.onmouseover = function() {
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
    }

    container.onclick = function(event) {
      if (event.target != img) return;

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

  textColPicker.type = 'color';
  backgroundColPicker.type = 'color';

  textColPicker.onchange = function() {
    formatBarFuncs.changeTextColor(textColPicker.value);
  }

  backgroundColPicker.onchange = function() {
    formatBarFuncs.changeBackgroundColor(backgroundColPicker.value);
  }

  textColor.append(textColPicker);
  backgroundColor.append(backgroundColPicker);

  noteData.append(formatBar);

  let submitButton = win.submitButton('ок', 'green', 'white', false, 2);
  let cancelButton = win.cancelButton('отмена');
  
  submitButton.style.padding = '0.7% 6% 0.7%';
  
  cancelButton.onclick = () => win.delWindow();

  win.align();
}

// text formatting
class FormatBar {
  constructor(textArea, textColor, backgroundColor) {
    this.textArea = textArea;
    this.textCol = textColor;
    this.backgroundCol = backgroundColor;
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
    let u = document.createElement('u');

    return u;
  }

  link() {
   let win = new ModalWin();

    win.createWindow(30, false, 'white', true);

    let url = win.textInput('', 'Введите url');

    let submitButton = win.submitButton('ок');

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
    let win = new ModalWin();
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

    win.changeFontSize(exclamationText, 7);

    exclamationText.style.border = 'none';
    exclamationText.style.outline = 'none';
    exclamationText.style.boxShadow = 'none';

    code.oninput = function() {
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

        if (textArea.querySelector('#placeholder')) {
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
    left: box.left + window.pageXOffset
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
      hasBannedAttrs = cleanInner.hasBannedAttrs;

      continue;
    }

    for (let attr of elem.attributes) {
      if (attr.name.startsWith('on') || bannedAttrs.includes(attr.name.toLowerCase())) {
        let cleanInner = cleanHTML(elem.innerHTML);

        hasBannedAttrs = true;
        elem.outerHTML = cleanInner.html;
        hasBannedTags = cleanInner.hasBannedTags;

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
