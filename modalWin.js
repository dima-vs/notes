export class ModalWin {
  constructor(opacity=0.5, priority=true, overflowAfter='auto') {
    if (ModalWin.zIndex === undefined) {
      ModalWin.zIndex = 6;
    } else {
      if (priority) ModalWin.zIndex += 2;
    }

    this.shadow(opacity);
    // list of functions to handle resizing of the browser window
    this.functionsOnResize = [];

    // calling all array functions
    this.OnResize = () => {
      for (let func of this.functionsOnResize) {
        func();
      }
    }
    window.addEventListener('resize', this.OnResize);

    // window content
    let winContent = document.createElement('div');

    winContent.className = 'win-content';
    this.winContent = winContent;

    this.overflowAfter = overflowAfter;
  }

  // add dark layer
  shadow(opacity) {
    let darkLayer = document.createElement('div');
    darkLayer.className = 'win-shadow_';
    darkLayer.style.zIndex = ModalWin.zIndex - 1;
    this.darkLayer = darkLayer;

    document.body.style.overflow = 'hidden';
    document.body.prepend(darkLayer);
    
    let i = 0;
    // fade animation
    let timerId = setInterval(() => {
      i += 0.02;
      if (i > opacity) clearInterval(timerId);
      
      darkLayer.style.opacity = i;
    }, 15);
  }

  // create empty popup
  createWindow(width=50, height=false, background='white', dragAndDrop=false) {
    let win = document.createElement('div');

    win.style.zIndex = ModalWin.zIndex;
    win.className = 'win-modalWin_';
    win.style.backgroundColor = background;
    
    document.body.append(win);
    win.append(this.winContent);

    // prevent selection of all elements outside the window
    document.body.classList.add('win-unselectable_');
    win.classList.add('win-selectable_');
    
    win.style.width = width + '%';
    if (height) win.style.height = height + '%';

    this.win = win;
    
    // center modal window when browser window is resized
    let centerAlign = () => {
      let winHeight = document.documentElement.clientHeight;
      let winWidth = document.documentElement.clientWidth;
      
      this.win.style.left = Math.round(winWidth / 2 - win.offsetWidth / 2) + 'px';
      this.win.style.top = Math.round(winHeight / 2 - win.offsetHeight / 2) + 'px';
    }

    this.functionsOnResize.push(centerAlign);

    // remove browser drag and drop
    win.ondragstart = function() {
      return false;
    };

    // drag and drop
    if (dragAndDrop) {
      let mouseDown = false;

      win.onmousedown = function(event) {
        // if the mouse is pressed on the contents of the window, cancel the drag
        if (event.target != win) return;

        mouseDown = true;
        
        document.body.style.cursor = 'grabbing';

        let shiftX = event.clientX - win.getBoundingClientRect().left;
        let shiftY = event.clientY - win.getBoundingClientRect().top;
      
        moveAt(event.pageX, event.pageY);
      
        function moveAt(pageX, pageY) {
          win.style.left = pageX - shiftX - window.pageXOffset + 'px';
          win.style.top = pageY - shiftY - window.pageYOffset + 'px';
        }
      
        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        // move window by mouse movement
        document.addEventListener('mousemove', onMouseMove);

        // release window and remove handlers
        document.addEventListener("mouseup", onMouseUp);

        function onMouseUp() {
          document.body.style.cursor = 'default';
          document.removeEventListener('mousemove', onMouseMove);

          mouseDown = false;
          win.onmouseup = null;

          adjustWinCoords();
          document.removeEventListener("mousemove", moveAt);
          document.removeEventListener("mouseup", onMouseUp);

          function adjustWinCoords() {
            let coords = win.getBoundingClientRect();
            let left;
            let top;
            let clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;

            if (coords.left < 0) {
              left = 0;
            } else if (coords.right > clientWidth) {
              left = clientWidth - coords.width;
            }

            if (coords.top < 0) {
              top = 0;
            } else if (coords.bottom > clientHeight) {
              top = clientHeight - coords.height;
            }

            win.style.left = left + "px";
            win.style.top = top + "px";
          }
        }
      };

      win.onmouseout = function() {
        if (mouseDown) return;

        document.body.style.cursor = 'default';
      }

      win.onmousemove = function(event) {
        if (mouseDown) return;

        if (event.target == win) {
          document.body.style.cursor = 'grab';
        } else {
          document.body.style.cursor = 'default';
        }
      }
    }

    return win;
  }

  // remove popup
  delWindow() {
    ModalWin.zIndex -= 2;
    document.body.style.overflow = this.overflowAfter;
    document.body.classList.remove('win-unselectable_');
    window.removeEventListener('resize', this.OnResize);
    this.darkLayer.remove();
    this.win.remove();
  }

  // text block
  textContent(text, size=3.5) {
    let textMessage = document.createElement('div');

    textMessage.textContent = text;
    textMessage.className = 'win-textMessage';
    
    this.winContent.append(textMessage);
    textMessage.style.fontSize = size + 'vw';

    return textMessage;
  }

  // add text input prompt
  textInput(defaultValue='', placeholder='', size=1.8) {
    let entryField = document.createElement('input');
    entryField.className = 'win-entryField';
    entryField.type = 'text';
    entryField.value = defaultValue;
    entryField.placeholder = placeholder;

    this.winContent.append(entryField);

    // this.changeFontSize(entryField, index);
    entryField.style.fontSize = size + 'vw';

    return entryField;
  }

  // create button
  createButton(text, background, textColor, newContainer, size) {
    if (newContainer || !this.buttonsContainer) {
      let buttonsContainer = document.createElement('div');
      
      buttonsContainer.style.marginBottom = '5%';
      this.winContent.append(buttonsContainer);
      this.buttonsContainer = buttonsContainer;
    }
    
    let button = document.createElement('button');
    button.className = 'win-button';
    
    button.textContent = text;
    button.style.backgroundColor = background;
    button.style.color = textColor;
    
    this.buttonsContainer.append(button);

    // this.changeFontSize(button, index);
    button.style.fontSize = size + 'vw';
    return button;
  }

  // create a submit button
  submitButton(text='submit', background='green', textColor='white', newContainer=false, index=2) {
    return this.createButton(text, background, textColor, newContainer, index);
  }

  // create a cancel button
  cancelButton(text='cancel', background='red', textColor='white', newContainer=false, index=2) {
    return this.createButton(text, background, textColor, newContainer, index);
  }

  // add a custom element by applying a scaling formula to it
  addElement(elem, size) {
    elem.addEventListener('input', this.OnResize);
    
    this.winContent.append(elem);
    // this.changeFontSize(elem, index);
    elem.style.fontSize = size + 'vw';
  }

  // text scaling formula
  // changeFontSize(elem, index) {
  //   let func = () => {
  //     elem.style.fontSize = Math.round(
  //       Math.cbrt(this.win.offsetWidth * this.win.offsetHeight) / index
  //     ) + 'px';
  //   }

  //   func();
  //   this.functionsOnResize.push(func);
  // }
  
  // align window and scale all textblocks at the end
  align() {
    this.OnResize();
  }
}