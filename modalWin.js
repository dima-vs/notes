export class ModalWin {
  constructor(opacity=0.5, overflow='hidden', priority=true) {
    if (ModalWin.zIndex === undefined) {
      ModalWin.zIndex = 2;
    } else {
      if (priority) ModalWin.zIndex += 2;
    }

    this.shadow(opacity, overflow);
    // список функций для обработки изменения размера окна браузера
    this.functionsOnResize = [];

    // вызов всех функций массива
    this.OnResize = () => {
      for (let func of this.functionsOnResize) {
        func();
      }
    }
    window.addEventListener('resize', this.OnResize);

    // содержимое окна
    let winContent = document.createElement('div');

    winContent.className = 'win-content';
    this.winContent = winContent;
  }

  // добавить темный слой
  shadow(opacity, overflow) {
    let darkLayer = document.createElement('div');
    darkLayer.className = 'win-shadow_';
    darkLayer.style.zIndex = ModalWin.zIndex - 1;
    this.darkLayer = darkLayer;

    document.body.style.overflow = overflow;
    document.body.prepend(darkLayer);
    
    let i = 0;
    // анимация затемнения
    let timerId = setInterval(() => {
      i += 0.02;
      if (i > opacity) clearInterval(timerId);
      
      darkLayer.style.opacity = i;
    }, 15);
  }

  // создать пустое всплывающее окно
  createWindow(width=50, height=false, background='white', dragAndDrop=false) {
    let win = document.createElement('div');

    win.style.zIndex = ModalWin.zIndex;
    win.className = 'win-modalWin_';
    win.style.backgroundColor = background;
    
    document.body.append(win);
    win.append(this.winContent);

    // запретить выделение всех елементов за пределами окна
    document.body.classList.add('win-unselectable_');
    win.classList.add('win-selectable_');
    
    win.style.width = width + '%';
    if (height) win.style.height = height + '%';

    this.win = win;
    
    // центрирование модального окна при изменении размера окна браузера
    let centerAlign = () => {
      let winHeight = document.documentElement.clientHeight;
      let winWidth = document.documentElement.clientWidth;
      
      this.win.style.left = Math.round(winWidth / 2 - win.offsetWidth / 2) + 'px';
      this.win.style.top = Math.round(winHeight / 2 - win.offsetHeight / 2) + 'px';
    }

    this.functionsOnResize.push(centerAlign);

    // перемещение мышью
    if (dragAndDrop) {
      let mouseDown = false;

      win.onmousedown = function(event) {
        // если мышь нажата на содержимом окна, отменяем перетаскивание
        if (event.target != win) return;

        mouseDown = true;
        
        document.body.style.cursor = 'grabbing';

        let shiftX = event.clientX - win.getBoundingClientRect().left;
        let shiftY = event.clientY - win.getBoundingClientRect().top;
      
        moveAt(event.pageX, event.pageY);
      
        function moveAt(pageX, pageY) {
          win.style.left = pageX - shiftX + 'px';
          win.style.top = pageY - shiftY + 'px';
        }
      
        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }
        
        // перенос окна по движению мыши
        document.addEventListener('mousemove', onMouseMove);

        // отпустить окно и удалить обработчики
        document.addEventListener("mouseup", onMouseUp);

        function onMouseUp() {
          document.body.style.cursor = 'default';
          document.removeEventListener('mousemove', onMouseMove);

          mouseDown = false;
          win.onmouseup = null;

          adjustBallCoords();
          document.removeEventListener("mousemove", moveAt);
          document.removeEventListener("mouseup", onMouseUp);

          function adjustBallCoords() {
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
      
      // удалить браузерный dragAndDrop
      win.ondragstart = function() {
        return false;
      };
    }

    return win;
  }

  // удалить окно
  delWindow() {
    ModalWin.zIndex -= 2;
    document.body.style.overflow = 'visible';
    document.body.classList.remove('win-unselectable_');
    window.removeEventListener('resize', this.OnResize);
    this.darkLayer.remove();
    this.win.remove();
  }

  // текстовый блок
  textContent(text, index=1.5) {
    let textMessage = document.createElement('div');

    textMessage.textContent = text;
    textMessage.className = 'win-textMessage';
    
    this.winContent.append(textMessage);
    this.changeFontSize(textMessage, index);

    return textMessage;
  }

  // добавить запрос ввода текста
  textInput(defaultValue='', placeholder='', index=2.9) {
    let entryField = document.createElement('input');
    entryField.className = 'win-entryField';
    entryField.type = 'text';
    entryField.value = defaultValue;
    entryField.placeholder = placeholder;

    this.winContent.append(entryField);

    // добавить анимации при событиях мыши
    let anim = new MouseEventAnimation(entryField);
    anim.onMouseOver();
    anim.onMouseOut();
    anim.onFocus();
    anim.onBlur();

    this.changeFontSize(entryField, index);

    return entryField;
  }

  // создать кнопку
  createButton(text, background, textColor, newContainer, index) {
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

    this.changeFontSize(button, index);
    return button;
  }

  // создать кнопку подтверждения действия
  submitButton(text='submit', background='green', textColor='white', newContainer=false, index=2) {
    return this.createButton(text, background, textColor, newContainer, index);
  }

  // создать кнопку отмены действия
  cancelButton(text='cancel', background='red', textColor='white', newContainer=false, index=2) {
    return this.createButton(text, background, textColor, newContainer, index);
  }

  // добавить пользовательский элемент, применив к нему формулу масштабирования
  addElement(elem, index=2) {
    elem.addEventListener('input', this.OnResize);
    
    this.winContent.append(elem);
    this.changeFontSize(elem, index);
  }

  // формула масштабирования текста
  changeFontSize(elem, index) {
    let func = () => {
      elem.style.fontSize = Math.round(
        Math.cbrt(this.win.offsetWidth * this.win.offsetHeight) / index
      ) + 'px';
    }

    func();
    this.functionsOnResize.push(func);
  }
  
  // выровнять окно и масштабировать все текстовые блоки в конце
  align() {
    this.OnResize();
  }
}

// анимации событий мыши
export class MouseEventAnimation {
  constructor(elem, startDelay=0, delay=25, minOpacity=0.04, maxOpacity=0.07) {
    this.minOpacity = this.opacityIndex = minOpacity;
    this.maxOpacity = maxOpacity;
    this.focused = false;

    this.elem = elem;
    this.delay = delay;
    this.startDelay = startDelay;

    let color = getComputedStyle(this.elem).backgroundColor;
    color = color.slice(color.indexOf('(') + 1, color.length - 1);
    color = color.split(', ');
    this.color = color;
  }

  onMouseOver() {
    let elem = this.elem;
    
    elem.onmouseover = () => {
      if (!this.focused) {
        clearTimeout(this.startTimerIdOut);
        clearInterval(this.timerIdOut);
        
        let color = getComputedStyle(elem).backgroundColor;
        color = color.slice(color.indexOf('(') + 1, color.length - 1);
        color = color.split(', ');
        if (color.length == 3) color.push(this.minOpacity);
  
        this.opacityIndex = +color[3];

        this.startTimerIdOver = setTimeout(() => {
          this.timerIdOver = setInterval(() => {
            if (this.opacityIndex >= this.maxOpacity) {
              clearInterval(this.timerIdOver);
            }
            elem.style.backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacityIndex})`;
            this.opacityIndex += 0.01;
          }, this.delay);
        }, this.startDelay);
      }
    };
  }

  onMouseOut() {
    let elem = this.elem;

    elem.onmouseout = () => {
      if (!this.focused) {
        clearTimeout(this.startTimerIdOver);
        clearInterval(this.timerIdOver);
        
        let color = getComputedStyle(elem).backgroundColor;
        color = color.slice(color.indexOf('(') + 1, color.length - 1);
        color = color.split(', ');
        if (color.length == 3) color.push(this.maxOpacity);

        this.opacityIndex = +color[3];

        this.startTimerIdOut = setTimeout(() => {
          this.timerIdOut = setInterval(() => {
            if (this.opacityIndex <= this.minOpacity) {
              clearInterval(this.timerIdOut);
            }
            elem.style.backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacityIndex})`;
            this.opacityIndex -= 0.01;
          }, this.delay);
        }, this.startDelay);
      };
    }
  }

  onMouseDown(startDelay=10, delay=25, addOpacity=0.05) {
    let elem = this.elem;
    
    elem.onmousedown = () => {
      if (!this.focused) {
        clearTimeout(this.startTimerIdOver);
        clearInterval(this.timerIdOver);
        clearTimeout(this.startTimerIdOver);
        clearInterval(this.timerIdOver);

        clearTimeout(this.startTimerIdMouseUp);
        clearInterval(this.timerIdMouseUp);

        let color = getComputedStyle(elem).backgroundColor;
        color = color.slice(color.indexOf('(') + 1, color.length - 1);
        color = color.split(', ');
        if (color.length == 3) color.push(this.maxOpacity);

        this.opacityIndex = +color[3];
        let maxOpacity = this.maxOpacity + addOpacity;

        this.startTimerIdMouseDown = setTimeout(() => {
          this.timerIdMouseDown = setInterval(() => {
            if (this.opacityIndex >= maxOpacity) {
              clearInterval(this.timerIdMouseDown);
            }
            elem.style.backgroundColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacityIndex})`;

            this.opacityIndex += 0.01;

          }, delay);
        }, startDelay);
      };
    }
  }

  onMouseUp(startDelay=10, delay=25) {
    let elem = this.elem;
    
    elem.onmouseup = () => {
      if (!this.focused) {
        clearTimeout(this.startTimerIdOver);
        clearInterval(this.timerIdOver);
        clearTimeout(this.startTimerIdOver);
        clearInterval(this.timerIdOver);

        clearTimeout(this.startTimerIdMouseDown);
        clearInterval(this.timerIdMouseDown);

        let color = getComputedStyle(elem).backgroundColor;
        color = color.slice(color.indexOf('(') + 1, color.length - 1);
        color = color.split(', ');
        if (color.length == 3) color.push(this.maxOpacity);

        this.opacityIndex = +color[3];

        this.startTimerIdMouseUp = setTimeout(() => {
          this.timerIdMouseUp = setInterval(() => {
            if (this.maxOpacity >= this.opacityIndex + 0.001) {
              clearInterval(this.timerIdMouseUp);
            }
            elem.style.backgroundColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacityIndex})`;

            this.opacityIndex -= 0.01;

          }, delay);
        }, startDelay);
      };
    }
  }

  onFocus(style=false) {
    let elem = this.elem;
    
    elem.onfocus = () => {
      this.focused = true;
      clearTimeout(this.startTimerIdOver);
      clearTimeout(this.startTimerIdOut);
      clearInterval(this.timerIdOver);
      clearInterval(this.timerIdOut);

      if (style) {
        for (let prop of Object.keys(style)) {
          elem.style[prop] = style[prop];
        }
      } else {
        elem.style.backgroundColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.1)`;
      };
    }
  }

  onBlur() {
    let elem = this.elem;

    elem.onblur = () => {
      this.focused = false;
      elem.style.backgroundColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.minOpacity})`;
    }
  };
}