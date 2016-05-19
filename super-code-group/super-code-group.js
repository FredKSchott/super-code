Polymer({

  is: 'super-code-group',

  properties: {
    selected: {
      type: Number,
      value: 0,
    }
  },

  attached: function() {
    this._panels = Polymer.dom(this.$.contentPanels).getDistributedNodes();
    for (let panel of this._panels) {
      panel.hideHeader();
    }
  },

  _getTabNameForPanel: function(panel) {
    return panel.title || panel.language.toUpperCase();
  }

});