(function() {
  var importDoc = document.currentScript.ownerDocument; // importee

  // Define and register <shadow-element>
  // that uses Shadow DOM and a template.
  var SuperCodeGroupElement = Object.create(HTMLElement.prototype);

  // http://therelentlessfrontend.com/2010/05/10/javascript-trim-left-trim-right-trim-functions/
  function rtrim(stringToTrim) {
      return stringToTrim.replace(/\s+$/,'');
  }



  SuperCodeGroupElement.createdCallback = function() {
    console.log('created', arguments);
    console.log(this);
    // get template in import
    var template = importDoc.querySelector('#x');

    // import template into
    var clone = document.importNode(template.content, true);
    var root = this.attachShadow({mode: 'open'});

    console.log(this.children);

    root.appendChild(clone);

    let superCodeEls = Array.prototype.slice.call(this.children);
    for (let i = 0, l = superCodeEls.length; i < l; i++) {
      let superCodeEl = superCodeEls[i];
      // create a new tab
      let newTab = document.createElement('li');
      newTab.className = 'tab col s1';
      newTab.innerHTML = '<a href="#" class="tab">HTML</a>';
      root.querySelector('.tabs').appendChild(newTab);
      // link tab to super-code
      // root.querySelector('.tabs').children[i].textHTML = superCodeEl.getAttribute('language');
      // root.querySelector('#test'+i).appendChild
      root.appendChild(superCodeEl);
    }
  };

  SuperCodeGroupElement.attachedCallback = () => console.log('attached', arguments);
  SuperCodeGroupElement.detachedCallback = () => console.log('detached', arguments);
  SuperCodeGroupElement.attributeChangedCallback = () => console.log('attributeChanged', arguments);

  document.registerElement('super-code-group', {
    prototype: SuperCodeGroupElement
  });

})();

