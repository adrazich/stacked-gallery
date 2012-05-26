// jquery.stacked.gallery.js - Pretty stacked photos that can be clicked through
// Version: 1.0
// Author: Anna Drazich
// Website: http://www.initanna.com/stacked-gallery/
// Github: https://github.com/adrazich/stacked-gallery
//
// Copyright (c) 2012 Anna Drazich
// Dual licensed under the MIT and GPL licenses.
// MIT License: https://github.com/adrazich/stacked-gallery/blob/master/MIT-License.txt
// GPL License: https://github.com/adrazich/stacked-gallery/blob/master/GPL-License.txt

;(function($, window, document, undefined){
  $.fn.stackedGallery = function(options){  

    // Create some defaults, extending them with any options that were provided
    var settings = _defaults = $.extend({
      rotationMin:-20,
      rotationMax:20,
      rotationSpeed:300,
      transitionIn:'linear',
      transitionOut:'linear',
      width:400,
      height:400,
      controls:true,
      _selector:this.selector
    }, options);

    return this.each(function(){
      var o = this;
      var len = 0;
      init();
      
      // Use Controls
      if (settings.controls){
        // Move to the next
        $(settings._selector+' .photos .controls .next').on('click', function(e){
          e.preventDefault();
          next();
        });
        
        // Open a Fancybox
        $(settings._selector+' .photos .controls .fullview').on('click', function(e){
          e.preventDefault();
          
          var curr = $('#'+$(settings._selector+' .photos .active').attr('ref'));
          var url = curr.attr('src');
  
          // IE won't have a normal image anymore, so we have to do some tricky business to keep up with the Google Rotate plugin
          if (url == undefined){
            var tmp = curr.html();
            tmp = curr.html().match(/http:\/\/.*(\.png|\.jpg|\.jpeg|\.gif)/);
            url = tmp[0];
          }
          
          $.fancybox(url,{
            type:'image'
          });
        });
        
        // Show controls when hovered
        $(settings._selector+' .photos').on('mouseenter', function(){
          addControls();
        }).on('mouseleave', function(){
          removeControls();
        });
      // Don't use Controls
      } else {
        // Move to the next
        $(settings._selector+' .photos .active').live('click', function(e){
          e.preventDefault();
          next();
        });
      }
      
      function init(){
        $(settings._selector).addClass('stacked-gallery');
        
        initPhotos();
        
        len = $(settings._selector+' .photos .photo').length;
        
        z = len;
        $(settings._selector+' .photos .photo').each(function(i){
          // set the active class to the first one, we want the first one straight
          if (i == 0){
            $(this).addClass('active').css({zIndex:len});
            $(this).children('IMG').css({ maxWidth:settings.width+'px', maxHeight:settings.width+'px' });
          // otherwise rotate it
          } else {
            $(this).css({ zIndex:z });
            $(this).children('IMG').css({ maxWidth:settings.width+'px', maxHeight:settings.width+'px' });
            $('#'+$(this).attr('ref')).rotate(rand(settings.rotationMin, settings.rotationMax));
          }
          z--;
        });
        
        if (settings.controls) initControls();
      }
      
      function initPhotos(){
        $(settings._selector+' IMG').wrapAll('<div class="photos" />');
        
        var i = 0;
        var temp = '';
        $(settings._selector+' .photos IMG').wrap(function(){
          i++;
          temp = settings._selector.replace(/\#|\./g, '');
          this.id = temp+'-'+i;
          return '<div class="photo" ref="'+temp+'-'+i+'" />';
        });
        
        // Center photos by width
        $(settings._selector+' .photos .photo').each(function(){
          var imgWidth = $(this).width();
          var childWidth = $(this).children('IMG').width();
          if (imgWidth < settings.width && childWidth != 0){
            var offset = (settings.width - childWidth) >> 1;
            $(this).css({ left:offset+'px' });
          }
        });
      }

      function next(){
        var curr = $(settings._selector+' .photos .active'); 
        var index = curr.index();
        if (settings.controls) index = index - 1; // subtracking the controls
        var nextIndex = index + 1;
        if (nextIndex >= len) nextIndex = 0;
        var next = $(settings._selector+' .photos .photo').eq(nextIndex);
        var width = $('#'+curr.attr('ref')).width();
        var height = $('#'+curr.attr('ref')).height();
        
        if (settings.controls) removeControls();
        
        // cool transitions :D
        curr.stop().animate({ marginLeft:'+='+width+'px', marginTop:'-='+(height >> 1)+'px' }, 250, settings.transitionIn, function(){
          curr.animate({ marginLeft:'-='+width+'px', marginTop:'+='+(height >> 1)+'px' }, 150, settings.transitionOut, function(){
            $('#'+curr.attr('ref')).rotate({animateTo:rand(settings.rotationMin, settings.rotationMax), duration:settings.rotationSpeed});
            $('#'+next.attr('ref')).rotate({animateTo:0, duration:settings.rotationSpeed, callback:rotationFinished});
          });
          updateZ();
          next.css({zIndex:len}).addClass('active');
          curr.css({zIndex:1}).removeClass('active');
        });
      }
      
      function rotationFinished(){
        if (settings.controls) addControls();
      }
      
      function initControls(){
        var controls = $('<div />').addClass('controls');
        controls.append('<ul />');
        controls.children('UL').append('<a title="Next"><li class="next">Next</li></a>');
        controls.children('UL').append('<a title="Full View"><li class="fullview">Full View</li></a>');
        $(settings._selector+' .photos').prepend(controls);
      }
      
      function addControls(){
        removeControls();
        var active = $('#'+$(settings._selector+' .photos .active').attr('ref'));
        $(settings._selector+' .photos .controls').css({ width: active.width()+parseInt(active.css('border-left-width'))+
          parseInt(active.css('border-right-width')) +'px', height:active.height()+'px',
          left:$(settings._selector+' .photos .active').css('left') }).show();
        
        var padding = parseInt($(settings._selector+' .photos .controls UL LI').css('margin-right'));
        var icons = { width: ($(settings._selector+' .photos .controls UL LI').width() + padding) * $(settings._selector+' .photos .controls UL LI').length - padding,
                      height: $(settings._selector+' .photos .controls UL LI').height() };
        var overlay = { width: $(settings._selector+' .photos .controls').width(),
                        height: $(settings._selector+' .photos .controls').height() };
        var offset = { width: (overlay.width - icons.width) >> 1, height: (overlay.height - icons.height) >> 1 };
        $(settings._selector+' .photos .controls UL').css({ marginLeft: offset.width +'px', marginTop: offset.height +'px' });
      }
      
      function removeControls(){ $(settings._selector+' .photos .controls').hide(); }
      
      function updateZ(){
        $(settings._selector+' .photos .photo').each(function(i){
          $(this).css({ zIndex: parseInt($(this).css('z-index')) + 1 });
        });
      }
      
      function rand(minn, maxx){ return Math.round(minn + Math.random()*(maxx-minn)); }
    });
  };
})(jQuery, window, document);