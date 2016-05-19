// I needed the opposite function today, so adding here too:
function htmlEncode(value){
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

var RUN_TYPE = {
  GROUP: 'group',
  JS_NATIVE: 'native:js',
  HTML_NATIVE: 'native:html',
  REMOTE: 'remote',
  UNKNOWN: 'unknown'
};

Polymer({
  is: 'super-code-runnable',

  properties: {
    noSandbox: Boolean,
    displayResults: Boolean,
    runRemote: String,
    runType: String
  },

  created: function() {
    console.log(this.localName + '#' + this.id + ' was created');
  },

  ready: function() {
    console.log(this.localName + '#' + this.id + ' has local DOM initialized');

    this.runType = this.detectRunType();

    if (this.runType === RUN_TYPE.UNKNOWN) {
      this.$.runButton.disabled = true;
    }
  },

  detectRunType: function() {
    let singleEl = Polymer.dom(this.$.superCodeContent).getDistributedNodes()[0];
    let groupEl = Polymer.dom(this.$.superCodeGroupContent).getDistributedNodes()[0];

    if (this.runRemote) {
      return RUN_TYPE.REMOTE;
    }
    if (groupEl) {
      return RUN_TYPE.GROUP;
    }

    let language = singleEl.getAttribute('language');
    if (language === "js" || language === "javascript") {
      return RUN_TYPE.JS_NATIVE;
    }
    if (language === "html") {
      return RUN_TYPE.HTML_NATIVE;
    }

    return RUN_TYPE.UNKNOWN;
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

  listeners: {
    'runButton.tap': 'specialTap'
  },

  generateJSOutput: function() {
    let codeOutput = '';
    let codeResult;
    let codeToEval = Polymer.dom(this.$.superCodeContent).getDistributedNodes()[0].innerHTML;


    if (this.noSandbox) {
      let _log = console.log;
      let _warn = console.warn;
      let _error = console.error;

      console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output">' + args.join(' ') + '</div>';
      };
      console.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output level-warn">[warn] ' + args.join(' ') + '</div></br>';
      };
      console.error = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output level-error">[error] ' + args.join(' ') + '</div></br>';
      };

      codeResult = eval(codeToEval);

      console.log = _log;
      console.warn = _warn;
      console.error = _error;
    } else {
      let sandboxIFrame = document.createElement('iframe');
      this.appendChild(sandboxIFrame);

      let _log = sandboxIFrame.contentWindow.console.log;
      let _warn = sandboxIFrame.contentWindow.console.warn;
      let _error = sandboxIFrame.contentWindow.console.error;

      sandboxIFrame.contentWindow.console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output">' + args.join(' ') + '</div>';
      };
      sandboxIFrame.contentWindow.console.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output level-warn">[warn] ' + args.join(' ') + '</div>';
      };
      sandboxIFrame.contentWindow.console.error = function() {
        var args = Array.prototype.slice.call(arguments);
        codeOutput += '<div class="console-output level-error">[error] ' + args.join(' ') + '</div>';
      };

      codeResult = sandboxIFrame.contentWindow.eval(codeToEval);

      sandboxIFrame.contentWindow.console.log = _log;
      sandboxIFrame.contentWindow.console.warn = _warn;
      sandboxIFrame.contentWindow.console.error = _error;
    }


    let displayPanelEl = document.createElement('div');
    displayPanelEl.id = 'displayPanel';
    displayPanelEl.className = 'panel console';
    displayPanelEl.style.height = this.clientHeight + 'px';
    displayPanelEl.innerHTML = codeOutput;

    if (this.displayResults) {
      displayPanelEl.innerHTML += '<div class="console-result"><span style="font-size: .7em; font-weight: bold;">></span> ' + codeResult + '</div>';
    }

    this.root.appendChild(displayPanelEl);

    setTimeout(() => {
      displayPanelEl.scrollTo( 0, 999999 );
    }, 1);
  },

  generateGroupOutput: function() {
    let codeElement = Polymer.dom(this.$.superCodeGroupContent).getDistributedNodes()[0];
    let codeGrouped = {};
    for (panel of codeElement._panels) {
      codeGrouped[panel.language] = codeGrouped[panel.language] || [];
      codeGrouped[panel.language].push(panel.code);
    }
    let htmlToDisplay = '<html><head><style>' + codeGrouped.css.join(' ') + '</style><head><body>' + codeGrouped.html.join(' ') + '<script>' + codeGrouped.js.join(' ') + '\<\/script\></body></html>';

    let displayPanelIFrame = document.createElement('iframe');
    displayPanelIFrame.id = 'displayPanel';
    displayPanelIFrame.className = 'panel';
    displayPanelIFrame.height = this.clientHeight;
    this.root.appendChild(displayPanelIFrame);

    displayPanelIFrame.contentWindow.document.open();
    displayPanelIFrame.contentWindow.document.write(htmlToDisplay);
    displayPanelIFrame.contentWindow.document.close();
  },

  generateHTMLOutput: function() {
    let codeElement = Polymer.dom(this.$.superCodeContent).getDistributedNodes()[0];
    let htmlToDisplay = codeElement.code;

    let displayPanelIFrame = document.createElement('iframe');
    displayPanelIFrame.id = 'displayPanel';
    displayPanelIFrame.className = 'panel';
    displayPanelIFrame.height = this.clientHeight;
    this.root.appendChild(displayPanelIFrame);

    displayPanelIFrame.contentWindow.document.open();
    displayPanelIFrame.contentWindow.document.write(htmlToDisplay);
    displayPanelIFrame.contentWindow.document.close();
  },

  generateSpecialOutput: function() {
    let displayPanelEl = document.createElement('div');
    displayPanelEl.id = 'displayPanel';
    displayPanelEl.className = 'panel console';
    displayPanelEl.style.height = this.clientHeight + 'px';
    displayPanelEl.textContent = 'Loading...';
    this.root.appendChild(displayPanelEl);

    let xhr = new XMLHttpRequest();
    let codeElement = Polymer.dom(this.$.superCodeContent).getDistributedNodes()[0];
    let codeToRun = codeElement.innerHTML || codeElement.getAttribute('code');
    let runUrl = this.runRemote;
    xhr.open('POST', runUrl, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {

        if (xhr.status < 400 && xhr.responseText) {
          displayPanelEl.textContent = xhr.responseText;
        }
        else if (xhr.status >= 400) {
          code.textContent = '✖ Error ' + xhr.status + ' while running file: ' + xhr.statusText;
        }
        else {
          code.textContent = '✖ Error: File does not exist or is empty';
        }
      }
    };

    xhr.send(codeToRun);
  },

  specialTap: function(e) {
    switch (this.runType) {
      case RUN_TYPE.REMOTE:
        this.generateSpecialOutput();
        break;

      case RUN_TYPE.GROUP:
        this.generateGroupOutput();
        break;

      case RUN_TYPE.JS_NATIVE:
        this.generateJSOutput();
        break;

      case RUN_TYPE.HTML_NATIVE:
        this.generateHTMLOutput();
        break;

      case RUN_TYPE.UNKNOWN:
      default:
        return;
    }

    setTimeout(() => {
      this.toggleClass('activated', true);
    }, 0);

  },

});
