(function() {
  var importDoc = document.currentScript.ownerDocument; // importee

  // Define and register <shadow-element>
  // that uses Shadow DOM and a template.
  var SuperCodeElement = Object.create(HTMLElement.prototype);

  // http://therelentlessfrontend.com/2010/05/10/javascript-trim-left-trim-right-trim-functions/
  function rtrim(stringToTrim) {
      return stringToTrim.replace(/\s+$/,'');
  }

  // I needed the opposite function today, so adding here too:
  function htmlEncode(value){
      return String(value)
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
  }

  // I needed the opposite function today, so adding here too:
  function htmlDecode(value){
      return String(value)
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
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


  SuperCodeElement.createdCallback = function() {
    console.log('created', arguments);
    console.log(this);
    // get template in import
    var template = importDoc.querySelector('#t');

    // import template into
    var clone = document.importNode(template.content, true);
    var self = this;
    var root = this.attachShadow({mode: 'closed'});

    root.appendChild(clone);
    var myPreEl = root.querySelector('pre');
    var myCodeEl = myPreEl.querySelector('code');
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

    this.hideHeader = () => headerEl.style.display = 'none';

    function paintElement() {
      self.code = htmlEncode(myCodeEl.innerHTML);
      Prism.highlightElement(myCodeEl, false);
    }

    if (this.getAttribute('code-src')) {
      myPreEl.dataset.src = this.getAttribute('code-src');
      loadCodeAjax(myPreEl, paintElement);
      return;
    }

    if (this.getAttribute('code')) {
      myCodeEl.innerHTML = this.getAttribute('code');
    } else if (this.children[0] instanceof HTMLTemplateElement) {
      myCodeEl.textContent = this.children[0].innerHTML;
    } else {
      myCodeEl.innerHTML = this.innerHTML;
    }

    setTimeout(paintElement, 0);
  };

  SuperCodeElement.attachedCallback = () => console.log('attached', arguments);
  SuperCodeElement.detachedCallback = () => console.log('detached', arguments);
  SuperCodeElement.attributeChangedCallback = function(attr, oldVal, newVal) {
    console.log('attributeChanged', this, arguments);
    if (attr === 'hide-header' && newVal) {
      this.hideHeader();
    }
  };

  document.registerElement('super-code', {
    prototype: SuperCodeElement
  });

})();

