import {ModalWin, MouseEventAnimation} from './modalWin.js';

let elemCounter = 0;
let elements = {};


let anim = new MouseEventAnimation(document.getElementById('search'), 40, 90);

anim.onMouseOver();
anim.onMouseOut();
anim.onFocus();
anim.onBlur();

function createElement(head, text, url) {
  let note = document.createElement('div');

  note.classList.add('notes');

}


let search = document.querySelectorAll('.search i');

for (let el of search) {
  let anim = new MouseEventAnimation(el, 20, 25, 0, 0.08);

  anim.onMouseOver();
  anim.onMouseOut();

  anim.onMouseDown();
  anim.onMouseUp();
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
  textArea.classList.add('textarea');

  textArea.style.marginBottom = '0px';
  textArea.style.maxHeight = '200px';
  textArea.style.overflow = 'auto';
  textArea.classList.add('pretty-scroll');

  // добавить заполнитель
  const placeholder = 'Заметка...';

  textArea.textContent === '' && (textArea.textContent = placeholder);

  textArea.addEventListener('focus', function (event) {
      const value = event.target.textContent;
      value === placeholder && (event.target.textContent = '');
  });

  textArea.addEventListener('blur', function (event) {
      const value = event.target.textContent;
      value === '' && (event.target.textContent = placeholder);
  });

  noteData.append(textArea);

  let formatBar = document.createElement('div');

  formatBar.style.cssText = `
    margin-top: 2px;
    text-align: center;
  `;

  let formatBarFuncs = new FormatBar(textArea, 'black', 'black');
  let funcNames = ['bold', 'italic', 'underline', 'link', 'letterColor', 'backgroundColor', 'clear'];

  for (let name of funcNames) {
    let container = document.createElement('span');
    container.style.position = 'relative';

    let img = document.createElement('img');

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

      let elem = formatBarFuncs[name](container);

      if (elem) {
        if (elem instanceof Promise) {
          elem.then(result => {
            if (!result) {
              let removeElem = textArea.querySelector(('[data-del]'));
              
              removeElem.replaceWith(removeElem.textContent);
              return;
            }

            for (let prop of Object.keys(result[1])){
              result[0][prop] = result[1][prop];
            }

            result[0].removeAttribute('data-del');
          })
        } else {
          wrapSelectedText(elem, textArea);
        }
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

// форматирование текста
class FormatBar {
  constructor(textArea, textColor, backgroundColor) {
    this.textArea = textArea;
    this.textCol = textColor;
    this.backgroundCol = backgroundColor;
    this.arr;
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
    let promise = this.getUrl_().then(result => {
      if (result) {
        this.arr[1] = {
          href: result
        }
        return this.arr;
      } else {
        return false;
      }
    });
  
   return promise;
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

  getUrl_() {
    let win = new ModalWin();

    win.createWindow(30, false, 'white', true);

    let url = win.textInput('', 'Введите url');

    let submitButton = win.submitButton('ок');

    submitButton.style.padding = ' 0.7% 6% 0.7%';
    win.winContent.style.marginBottom = '1px';

    win.align();

    let a = document.createElement('a');

    a.target = '_blank';
    a.setAttribute('data-del', true);

    wrapSelectedText(a, this.textArea);
    this.arr = [a, {}];

    return new Promise(function(resolve) {
      submitButton.onclick = () => {
        if (url.value) {
          win.delWindow();
  
          resolve(url.value);
        }
  
        url.classList.add('shake');
        url.style.borderColor = 'rgba(255, 0, 0, 0.6)';
        url.style.backgroundColor = 'white';
  
        setTimeout(() => {
          url.classList.remove('shake');
          url.style.borderColor = '';
          url.style.backgroundColor = '';
        }, 200);
      };
  
      win.darkLayer.onclick = () => {
        win.delWindow();
  
        resolve(false);
      }
    })
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

// получить координаты относительно документа
function getCoords(elem) {
  let box = elem.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset,
    right: box.right + window.pageXOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset
  };
}