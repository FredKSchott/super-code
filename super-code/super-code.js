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

  var src = pre.dataset.src;
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




Polymer({
  is: 'super-code',

  properties: {
    'language': String,
    'lineNumbers': Boolean,
    'highlightLines': String,
    'title': String,
    'code': String,
    'codeSrc': String,
    'height': {
      type: String,
      observer: '_heightChanged'
    }
  },

  created: function() {
    console.log(this.localName + '#' + this.id + ' was created');
  },

  ready: function() {
    console.log(this.localName + '#' + this.id + ' has local DOM initialized');
    console.log(this);
    var self = this;
    var myPreEl = this.$$('pre');
    var myCodeEl = myPreEl.querySelector('code');
    var headerEl = this.$$('.header');
    console.log(myPreEl, myCodeEl, headerEl);

    myCodeEl.className += ' language-' + this.language;

    if (this.lineNumbers) {
      myPreEl.className += ' line-numbers';
    }

    if (this.highlightLines) {
      myPreEl.dataset.line = this.highlightLines;
    }

    if (this.title) {
      headerEl.style.display = 'block';
      headerEl.textContent = this.title;
    }

    this.hideHeader = () => headerEl.style.display = 'none';

    function paintElement() {
      self.code = htmlEncode(myCodeEl.innerHTML);
      Prism.highlightElement(myCodeEl, false);
    }

    if (this.codeSrc) {
      myPreEl.dataset.src = this.codeSrc;
      loadCodeAjax(myPreEl, paintElement);
      return;
    }

    if (this.code) {
      myCodeEl.innerHTML = this.code;
    } else if (this.children[0] instanceof HTMLTemplateElement) {
      let templateFragment = this.children[0].content;
      if (templateFragment.children.length === 0) {
        templateFragment = this.children[0]._content;
      }
      let templateContent = templateFragment.children[0].outerHTML;
      myCodeEl.textContent = templateContent;
    } else {
      myCodeEl.innerHTML = this.innerHTML;
    }

    setTimeout(paintElement, 0);
  },

  attached: function() {
    console.log(this.localName + '#' + this.id + ' was attached');
  },

  detached: function() {
    console.log(this.localName + '#' + this.id + ' was detached');
  },

  attributeChanged: function(name, type) {
    console.log(this.localName + '#' + this.id + ' attribute ' + name +
      ' was changed to ' + this.getAttribute(name));
  },

  _heightChanged: function(newHeight) {
    var myPreEl = this.$$('pre');
    console.log('AHH', newHeight);
    myPreEl.style.height = newHeight;
  }

});
