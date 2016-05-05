(function() {
  var importDoc = document.currentScript.ownerDocument; // importee

  // Define and register <shadow-element>
  // that uses Shadow DOM and a template.
  var SuperCodeElement = Object.create(HTMLElement.prototype);

  // http://therelentlessfrontend.com/2010/05/10/javascript-trim-left-trim-right-trim-functions/
  function rtrim(stringToTrim) {
      return stringToTrim.replace(/\s+$/,'');
  }

  function loadCodeAjax(pre, callback) {

    var Extensions = {
      'js': 'javascript',
      'html': 'markup',
      'svg': 'markup',
      'xml': 'markup',
      'py': 'python',
      'rb': 'ruby',
      'ps1': 'powershell',
      'psm1': 'powershell'
    };

    var src = pre.getAttribute('data-src');
    var code = pre.querySelector('code');

    var language, parent = pre;
    var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
    while (parent && !lang.test(parent.className)) {
      parent = parent.parentNode;
    }

    if (parent) {
      language = (pre.className.match(lang) || [, ''])[1];
    }

    if (!language) {
      var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
      language = Extensions[extension] || extension;
    }

    code.className = 'language-' + language;

    code.textContent = 'Loading...';

    var xhr = new XMLHttpRequest();

    xhr.open('GET', src, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {

        if (xhr.status < 400 && xhr.responseText) {
          code.textContent = xhr.responseText;

          callback();
        }
        else if (xhr.status >= 400) {
          code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
        }
        else {
          code.textContent = '✖ Error: File does not exist or is empty';
        }
      }
    };

    xhr.send(null);
  }

  // var languages = ['javascript', 'css', 'markup'];
  // var basePrototype = Object.create(HTMLPreElement.prototype);
  // var importDoc = (document._currentScript || document.currentScript).ownerDocument;
  // var shadowDomSupported = !!Element.prototype.createShadowRoot;
  // // if (!shadowDomSupported) {
  // //   var templateLight = importDoc.querySelector('#template-light');
  // //   var templateLightContent = document.importNode(templateLight.content, true);
  // //   document.querySelector('head').appendChild(templateLightContent);
  // // }
  // languages.forEach(registerLanguage);
  // function registerLanguage(alias) {
  //     var prototype = Object.create(basePrototype);
  //     prototype.createdCallback = function() {
  //         var codeElement = createCodeElement.call(this, alias);
  //         if (shadowDomSupported) {
  //           createShadowRoot.call(this).appendChild(codeElement)
  //         } else {
  //           this.innerHTML = "";
  //           this.appendChild(codeElement);
  //         }
  //         Prism.highlightElement(codeElement, false);
  //     };
  //     document.registerElement("lang-" + alias, {
  //         prototype: prototype,
  //         extends: 'pre'
  //     });
  // }
  // function createCodeElement(alias) {
  //     var codeElement = document.createElement('code');
  //     codeElement.innerHTML = rtrim(this.innerHTML);
  //     codeElement.classList.add('language-' + alias);
  //     return codeElement;
  // }
  // function createShadowRoot() {
  //     var preElement = document.createElement('pre');
  //     var templateId = this.getAttribute("theme") === "dark" ? "#template-dark" : "#template-light";
  //     var template = importDoc.querySelector(templateId);
  //     var templateContent = document.importNode(template.content, true);
  //     templateContent.appendChild(preElement);
  //     this.createShadowRoot().appendChild(templateContent);
  //     return preElement;
  // }




  SuperCodeElement.createdCallback = function() {
    console.log('created', arguments);
    console.log(this);
    // get template in import
    var template = importDoc.querySelector('#t');

    // import template into
    var clone = document.importNode(template.content, true);
    var root = this.attachShadow({mode: 'open'});

    root.appendChild(clone);
    var myCodeEl = root.querySelector('#mycode');
    var myPreEl = root.querySelector('#mycodepre');
    var headerEl = root.querySelector('.header');

    myCodeEl.className += ' language-' + this.getAttribute('language');

    if (this.getAttribute('line-numbers')) {
      myPreEl.className += ' line-numbers';
    }

    if (this.getAttribute('highlight-lines')) {
      myPreEl.dataset.line = this.getAttribute('highlight-lines');
    }

    if (this.getAttribute('title')) {
      headerEl.style.display = 'block';
      headerEl.textContent = this.getAttribute('title');
    }

    if (this.getAttribute('header-color')) {
      headerEl.style.backgroundColor = this.getAttribute('header-color');
    }

    function paintElement() {
      Prism.highlightElement(myCodeEl, false);
    }

    if (this.getAttribute('code-src')) {
      myPreEl.dataset.src = this.getAttribute('code-src');
      loadCodeAjax(myPreEl, paintElement);
      return;
    }

    if (this.getAttribute('code')) {
      myCodeEl.innerHTML = this.getAttribute('code');
    } else {
      myCodeEl.innerHTML = this.innerHTML;
    }

    setTimeout(paintElement, 0);
  };

  SuperCodeElement.attachedCallback = () => console.log('attached', arguments);
  SuperCodeElement.detachedCallback = () => console.log('detached', arguments);
  SuperCodeElement.attributeChangedCallback = () => console.log('attributeChanged', arguments);

  document.registerElement('super-code', {
    prototype: SuperCodeElement
  });

})();

