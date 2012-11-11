module.exports = function (el) {
    $('body').append($('<div class="dialog-overlay"></div>'))
    el = $(el)
    $('body').append(el)
    el.css('left', window.innerWidth/2 - el.width()/2)
      .css('top', window.innerHeight/2 - el.height()/2)

    var ret =  {
      remove: function() {
        el.remove()
        $('.dialog-overlay').remove()
      }
    }
    $('.dialog-overlay').on('click', ret.remove)
    return ret
    
  }