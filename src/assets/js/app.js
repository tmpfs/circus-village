/* global history */

import {Scroll} from './scroll'

var $ = require('air')
var HOME = ''
var PHOTOS = '#photos'

$.plugin([
  require('air/append'),
  require('air/attr'),
  require('air/class'),
  require('air/create'),
  require('air/css'),
  require('air/data'),
  require('air/event'),
  require('air/find'),
  require('air/hidden'),
  require('air/parent'),
  require('air/prepend'),
  require('air/remove')
])

class Application {

  constructor () {
    const navigate = this.navigate.bind(this)
    const Slideshow = require('./slideshow')
    const Gallery = require('./image-gallery')

    this.scroller = new Scroll({
      navigate: navigate,
      popstate: (evt) => {
        let id = HOME
        if (evt.state && evt.state.id) {
          id = '#' + evt.state.id
        // allow hash changes to navigate to named anchors
        // when there are no state items in the history
        } else if (document.location.hash) {
          id = document.location.hash
        }
        this.navigate(id)
      }})

    this.slideshow = new Slideshow()
    this.gallery = new Gallery({navigate: navigate})

    this.body = $('body').get(0)
    this.menu = $('.menu')
    this.leader = $('.leader')
    this.info = $('.accomodation > div')
    // make the entire info div click to the gallery image
    this.info.on('click', function (e) {
      var el = $(e.currentTarget)
      var href = $(el.find('a[href]').get(0)).attr('href')
      document.location.hash = href
    })
  }

  navigate (href, replace) {
    if (replace) {
      history.replaceState({hash: href}, null, href)
      return
    }

    var id = href.replace(/^#/, '')
    var target = $('#' + id)
    var hash = document.location.hash

    // handle home navigation
    if (href === HOME || id === 'top') {
      this.gallery.close()
      if (this.body.scrollTop !== 0) {
        this.scroller.scrollToTop(0)
      }
    // handle navigation to `id` on the page
    } else if (target.length) {
      this.scroller.scrollToId(id)
    // show photo gallery
    } else if (href === PHOTOS) {
      this.gallery.start(null, hash)
    // handle deep-link to specific photo in the gallery
    } else {
      var item = this.gallery.find(id)
      if (item) {
        this.gallery.start(item, hash)
      }
    }
  }

  onScroll () {
    var val = this.body.scrollTop
    if (!val) {
      this.menu.removeClass('transparent')
      this.leader.removeClass('transparent')
    } else {
      this.menu.addClass('transparent')
      this.leader.addClass('transparent')
      this.slideshow.stop()
    }
  }

  start () {
    var blurPlaying

    // allow animated scroll on page load
    this.body.scrollTop = 0

    // check for hash on load
    function onLoad (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      var hash = document.location.hash
      if (hash) {
        this.navigate(hash)
      } else {
        this.navigate(HOME, true)
      }
    }

    // stop slideshow on blur
    function blur () {
      blurPlaying = this.slideshow.playing
      this.slideshow.stop()
    }

    // restart slideshow on focus
    function focus () {
      if (blurPlaying) {
        this.slideshow.start()
      }
    }

    window.addEventListener('scroll', this.onScroll.bind(this))

    this.scroller.start()

    $(window).on('blur', blur.bind(this))
    $(window).on('focus', focus.bind(this))
    $(window).on('load', onLoad.bind(this))
  }
}

module.exports = Application