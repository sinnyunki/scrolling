
var useBookmark = false;
var limitWebAppToDevice = true;
var stopIFrameOnNewPage = true;
var resetSliderScrollY = true;
var useSmoothSwipeOnImageSequences = true;
var bookmarkName = 'in5_bookmark_' + location.href.substr(location.host.length);
var touchEnabled = 'ontouchstart' in document.documentElement;
var clickEv = (touchEnabled) ? 'vclick' : 'click';
var pre = (document.createElement('div').style['WebkitTransform'] != undefined) ? '-webkit-' : '';
var useSwipe = false;
var pageMode = 'csv';
var multifile = false;
var arrowNav = false;
var lazyLoad = true;
var webAppType = '';
var useTracker = false;
var shareInfo = {btns:[], align:"left"};
var webAppEmailSubject = 'Check out this Web App for {deviceName}';
var webAppEmailBody = 'Add this Web App to Your {deviceName} by visiting: ';
var sliderSettings = {}, nav = {}, in5 = {};
var uAgent = navigator.userAgent.toLowerCase();
var isIPad = uAgent.indexOf("ipad") > -1, isIPhone = uAgent.indexOf("iphone") > -1,
	isWebkit = 'WebkitAppearance' in document.documentElement.style,
	isAndroid = uAgent.indexOf('android') > -1, isChrome = uAgent.indexOf('chrome') > -1,
	isBaker = uAgent.indexOf("bakerframework") > -1, isLocal = (location.protocol === 'file:');
navigator.standalone = navigator.standalone || checkStandalone();
if(isLocal) $('html').addClass('local');
if(location.href.indexOf('OverlayResources') !== -1) $('html').addClass('dps');
if(isBaker) { useSwipe=false; $('html').addClass('baker'); }
if(isIPad || isIPhone) { $('html').addClass('ios'); }
else if(uAgent.indexOf('safari') > -1) {
if(uAgent.indexOf('windows')){$('html').addClass('win-safari')};
window.setInterval=function(f,t){var i=window.setInterval.count?++window.setInterval.count:window.setInterval.count=1;var a=arguments;window.setInterval[i]=function(){if(window.setInterval[i].active){if(typeof f=="string"){eval(f)}else if(a.length>2){f.apply(this,Array.prototype.slice.call(a,2))}else{f()}setTimeout(window.setInterval[i],t)}};window.setInterval[i].active=true;setTimeout(window.setInterval[i],t);return{intervalId:i}};window.clearInterval=function(e){window.setInterval[e.intervalId].active=false}
}

function checkStandalone(){
	if(isAndroid){
		if(uAgent.match(/chrome.(?:(3[8-9])|(?:[4-9][0-9]))/i) ){ return (screen.height-window.outerHeight<80); }
		return true; /*bypass install screen until better implementation is available*/
		/*return (screen.height-document.documentElement.clientHeight<40); old android hack*/
	}
}

function go(e, objArr, triggerEvent){
	if(objArr.length>1) {
		$(e.target).data('sequence', objArr);
		seqNext(e);
	} else {
		var data = objArr[0];
		prepAnim(e,$('[data-id=' + data.id + ']'),data);
	}	
}

function prepAnim(e,elem,data){
	switch(data.act) {
		case 'reverse': data.rev = 1;
		case 'play': playAnim(e,elem,data); break;
		case 'stop': elem.css(pre+'animation', 'none'); break;
		case 'pause': elem.css(pre+'animation-play-state','paused'); break;
		case 'resume': elem.css(pre+'animation-play-state','running'); break;
		case 'stopall': $('.activePage').find('[data-ani]').css(pre+'animation','none'); break;
	}
}

function seqNext(e) {
	if(!e || !e.target) return;
	var seqArr = $(e.target).data('sequence');
	if(!seqArr || !seqArr.length) return;
	var cAnim = seqArr.shift();
	var elem = $('[data-id=' + cAnim.id + ']');
	if(seqArr.length && !cAnim.link) elem.data('sequence', seqArr);
	prepAnim(e,elem,cAnim);
	if(cAnim.link || !elem.length) seqNext(e);
}

function triggerRollOff(e,btn){
	eval(btn.attr('data-unroll'));
	btn.removeAttr('data-unroll');
}

function playAnim(e, elem, opts) {
	if(typeof elem === 'number') elem = $('[data-id=' + elem + ']');
	if(!elem.length) return;
	if(e.target != elem[0] && elem.attr('data-unroll')) return false;
	elem.css(pre+'animation','none');
	elem[0].offsetWidth = elem[0].offsetWidth;
	var ani = elem.attr('data-ani');
	if(opts.n && opts.n != 1) ani = ani.replace(/(?:\d+$)/,opts.n);
	var delay = (opts.del) ? opts.del+'s' : '0s';
	var dir = (opts.rev) ? 'reverse' : 'normal';
	if(opts.unroll) {
		opts.rev = 1;
		var btn = $(opts.unroll);
		delete opts.unroll;
		var optStr = (typeof opts.toSource == 'function') ? opts.toSource() :
			(function(){
				var arr=[],val;
				for(var prop in opts){ 
					val = opts[prop];
					if(typeof val === 'string') val="'"+val+"'";
					arr.push(prop+':'+val); 
				}
				return '{' + arr.toString() + '}';
			})();	
		btn.attr('data-unroll', 'playAnim({target:this},'+elem.attr('data-id')+','+optStr+');');
		btn.one('mouseleave', function(e) { triggerRollOff(e,btn); });
	}
	elem.css({animation:ani, '-webkit-animation':ani, 
	'animation-delay':delay, '-webkit-animation-delay':delay, 
	'animation-direction':dir, '-webkit-animation-direction':dir}).removeClass('hidden');
}
function toggleAudio(btn){
	var elem = $(btn).siblings('audio')[0];
	if(elem == undefined) elem = $(btn).siblings().find('audio')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem, media = player.media || elem;
	if(media.paused) player.play();
	else player.pause();
	} catch(e){}
}

function playMedia(dataID, from) {
	var elem = $('audio,video').filter('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
		var player = elem.player || elem;
		player.play();
		if(from != undefined && from != -1) try{ setTimeout(function(){player.setCurrentTime(from);}, 500); }catch(e){}
	} catch(e){console.log(e);}
}

function stopMedia(dataID){ pauseMedia(dataID,true); }
function pauseMedia(dataID, rewind) {
	var elem = $('audio,video').filter('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player || elem;
	player.pause();
	if(rewind) elem.currentTime = 0;
	} catch(e){}
}

function stopAllMedia(targ) {
	if(!targ) targ = document;
	$(targ).find('audio,video').each(function() {
		var media = $(this)[0], player = media.player || media;
		try{player.pause(); media.currentTime = 0;}catch(e){}
	});
}

function stopIframe(targ){
	$(targ).find('iframe').each(function(index,elem){
		var j = $(elem), src = j.attr('src');
		j.attr('src', '');
		if(j.attr('data-src')) j.siblings('.cover').show();
		else j.attr('src', src);
	});
}

function autoPlayMedia(i,elem) {
	if($(elem).parents('.state').not('.active').length) return; /*skip hidden video in MSOs*/
	var delay = parseFloat($(elem).attr('data-autodelay'))* 1000 || 250+i;
	try{ setTimeout(function(){var player = elem.player || elem; player.play();}, delay); }catch(e){}
}	

function onNewPage(e, data){
	seqPos = 0;
	if(!multifile) stopAllMedia();
	if(data == undefined || data.index == undefined) return;
	if(!multifile) {
		if(data.slider && data.slider.scrollAdjust){
			data.slider.scrollAdjust();
			delete data.slider.scrollAdjust;
		} else if(resetSliderScrollY && sliderSettings.useSlider && $(window).scrollTop()>2){$(window).scrollTop(0);}
		$('.page [data-hidestart]').addClass('hidden');
		if(stopIFrameOnNewPage && nav.previousPageIndex != undefined) { stopIframe($('.page').eq(nav.previousPageIndex)); };
		nav.current = data.index+1;
		nav.previousPageIndex = data.index;
		if(useBookmark && localStorage) localStorage[bookmarkName] = nav.current;
		if(lazyLoad) loadImages(data.index);
	}
	$('.page').removeClass('activePage').eq(data.index).addClass('activePage').show().find('audio,video').filter('[data-autoplay]').each(function(i,elem){autoPlayMedia(i, elem)});
	var aniLoad = $('.activePage').attr('data-ani-load');
	if(aniLoad && aniLoad.length) eval(aniLoad);
	$('.activePage .cover').filter('[data-delay]').each(function(index,el){
		setTimeout(function(){ $(el).trigger(clickEv); }, parseFloat($(el).attr('data-delay'))*1000 );
		return false;
	});
	$('.activePage .mso > .state.active').trigger('newState');
}

function loadImages(pageIndex) {
	var pages = $('.page');
	loadPageImages(pages.eq(pageIndex));
	loadPageImages(pages.eq(pageIndex+1));
	if(pageIndex > 0){ loadPageImages(pages.eq(pageIndex-1)); }
}

function loadPageImages(targPage){
	if(!targPage.data('loaded')){
		targPage.find('img').filter('[data-src]').each(function(index,el){ 
			var $el = $(el);
			if((!isWebkit || !isLocal) && $el.hasClass('svg-img')){
				$el.parent().load($el.attr('data-src')+' svg',function(resp,status,xhr){
					if(status==='error'){$el.attr('src', $el.attr('data-src'));}
				});
			} else{$el.attr('src', $el.attr('data-src'));}
		});
		targPage.data('loaded', true);
	}
}

/*to do:check for when multiple pages are visible*/
function checkScroll(e, mode){
	if(window.scrolling) return;
	var docMin, docMax, docSpan, elemSpan, elemMin, elemMax, elemCenter;
	var vertMode = (mode === 'v');
	docMin = (vertMode) ? $(window).scrollTop() : $(window).scrollLeft();
	docMax = (vertMode) ? docMin + $(window).height(): docMin + $(window).width();
	docSpan = docMax - docMin;
    $('.pages .page').not('.activePage').each(function(index,elem) {
    	elemMin = (vertMode) ? $(elem).offset().top : $(elem).offset().left;
    	elemMax = (vertMode) ? elemMin + $(elem).height() : elemMin + $(elem).width();
    	elemSpan = elemMax - elemMin;
    	if(docSpan <= elemSpan) {
    		elemCenter = elemMin + elemSpan*.5;
    		if(elemCenter < docMax && elemCenter > docMin){
    			$(document).trigger('newPage', {index:$(elem).index()});
				return;
    		}
    	}else if((elemMax <= docMax) && (elemMin >= docMin)) {
    		$(document).trigger('newPage', {index:$(elem).index()});
    		return;
		}
    });
}

function onNewState(e){
	var targState = $(e.target).show();
	var aniLoad = targState.attr('data-ani-load');
	if(aniLoad && aniLoad.length) eval(aniLoad);
	stopAllMedia(targState.siblings('.state'));
	targState.find('audio,video').each(function(i,elem){autoPlayMedia(i, elem)});
	targState.find('[data-autostart="1"]').each(function(i,el){toFirstState(el); startSlideShowDelayed(el); });
	targState.siblings('.state').find('[data-hidestart]').addClass('hidden');
}

function nextState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current+1 < states.length) {
		mso.each(function(index,elem) {
			if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade, function(){$(this).removeClass('transition')});
				el.children('.state').eq(current+1).addClass('active').hide().fadeIn(elem.crossfade, function(e) { last.hide(); $(this).trigger('newState'); });
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current+1).addClass('active').trigger('newState');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade, function(){$(this).removeClass('transition')});
				el.children('.state').first().addClass('active').hide().fadeIn(elem.crossfade, function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').first().addClass('active').trigger('newState');
	 	});
	}
}

function prevState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current-1 > -1) {
		mso.each(function(index,elem) {
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade,function(){$(this).removeClass('transition')});
				el.children('.state').eq(current-1).addClass('active').hide().fadeIn(elem.crossfade,function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current-1).addClass('active').trigger('newState');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				var last = el.children('.state.active').removeClass('active').addClass('transition').show().fadeOut(elem.crossfade,function(){$(this).removeClass('transition')});
				el.children('.state').last().addClass('active').hide().fadeIn(elem.crossfade,function(e) { last.hide(); $(this).trigger('newState');});
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').last().addClass('active').trigger('newState');
	 	});
	}
}

function toState(dataID, stateIndex, restoreOnRollOut, restoreTarg){
	if(restoreOnRollOut) {
		var current = $('[data-id=' + dataID + ']').children('.state.active').first().index();
		$(restoreTarg).mouseout(function() { toState(dataID, current); });
	}
	$('[data-id=' + dataID + ']').each(function(index,elem) {
		if(elem.playing) stopSlideShow(elem);
		$(elem).children('.state').removeClass('active').eq(stateIndex).addClass('active').trigger('newState').parent('.mso').removeClass('hidden');
	});
}

function toFirstState(el) { var f = (el.reverse) ? $(el).children('.state').length-1 : 0; toState($(el).attr('data-id'), f); }

function startSlideShowDelayed(el) { 
	var mso=$(el); 
	setTimeout(function(){ startSlideShow(el); }, parseFloat(mso.attr('data-autostartdelay'))*1000 + (mso.is(':visible')?el.duration*1000:0)); 
}

function startSlideShow(el){
	if(el.playing || $(el).is(':hidden')) return;
	el.playing = true;
	el.loopcount = 0;
	var func = (el.reverse) ? prevState : nextState;
	func($(el).attr('data-id'), true );
	el.playint = setInterval(function(){ func($(el).attr('data-id'), true ); }, el.duration*1000);
}

function stopSlideShow(elem) {
	elem.playing = false;
	if(elem.hasOwnProperty('playint')) clearInterval(elem.playint);
	$(elem).find('.state').css('display','').css('opacity','1');
}

function hide(dataID) { $('[data-id=' + dataID + ']').addClass('hidden'); }
function show(dataID) { $('[data-id=' + dataID + ']').removeClass('hidden'); }
function loadFrame(iframe){ iframe.src = $(iframe).attr('data-src'); }
function animateImageSeq(dir,rev,amt,threshold,msoID,loopSwipe,init){
	if(init) {
		in5.swipeStartTime = new Date().getTime()-20, 
		in5.swipePosVal = 0, amt /= threshold, threshold *= .001;
	}
	var lastPos = in5.swipePosVal;
	in5.swipeTimeElapsed = new Date().getTime()-in5.swipeStartTime;
	in5.swipePosVal = imageSeqEase(in5.swipeTimeElapsed,0,amt,360);
	if(init || (in5.swipePosVal-lastPos) >= threshold) {
		switch(dir){
			case "left":
				if(rev) prevState(msoID, loopSwipe);
				else nextState(msoID, loopSwipe);
				break;
			case "right":
				if(rev) nextState(msoID, loopSwipe);
				else prevState(msoID, loopSwipe);
				break;
		}
	}
	if(in5.swipeTimeElapsed < 300 || Math.ceil(in5.swipePosVal)<amt){ setTimeout(function(){ 
		animateImageSeq(dir,rev,amt,threshold,msoID,loopSwipe); },20); }
}
function imageSeqEase(t,b,c,d){return c*((t=t/d-1)*t*t+1)+b; }
function initWebApp(){
	var isDevice, deviceName, nameForNonDeviceFile = webAppType, nameForDeviceFile = webAppType;
	switch(webAppType){
		case 'ipad': deviceName2 = deviceName = 'iPad'; isDevice = isIPad; break;
		case 'iphone': deviceName2 = deviceName = 'iPhone'; isDevice = isIPhone; break;
		case 'android': deviceName2 = deviceName = 'Android'; isDevice = isAndroid; break;
		default:
			deviceName = 'Mobile'; deviceName2 = 'Mobile Device';
			isDevice = (isAndroid || isIPad || isIPhone);
			nameForDeviceFile = (isAndroid) ? 'android' : ((isIPad) ? 'ipad' : 'iphone');
	}
	if(isDevice){
		if(!navigator.standalone) {
			$('#container').hide();
			if(window.stop && !$('html').is('[manifest]')/*does not have app cache*/){
				window.stop();
				$('body').addClass('loaded');
			}
		$('body').css('background','#fff)').append('<img src="assets/images/add_to_home_'+nameForDeviceFile+'.png" />');
			return true;
		}
	} else if(limitWebAppToDevice) {
		$('#container').hide();
		if(window.stop){
			$('body').addClass('loaded').find('#toloadIndicator').hide();
			window.stop();
		}
		var sendLinkURL = 'mailto:?subject=' + escape(webAppEmailSubject.split('{deviceName}').join(deviceName)) +'&amp;body=' + escape(webAppEmailBody.split('{deviceName}').join(deviceName2)) +
		(location.protocol == 'file:' ? '%28Post%20to%20a%20web%20server%20to%20show%20URL%29' : location.href) +'"><img src="assets/images/non_'+nameForNonDeviceFile+'.png';
		$('body').css('background','#fff').append('<a href="'+sendLinkURL+'" /></a>');
		return true;
	}
	return false;
}

function initClickEvents(){
	$('#container').find('*').each(function(index,el){
		var clickArr=[],$el=$(el),args,postArr=[];
		$.each(el.attributes,function(ind,attrib){
			var at=attrib.name, aval=attrib.value;
			switch(at){
				case 'onclick': postArr.push(function(){$el.attr('data-onclick',aval).removeAttr(at);}); clickArr.push(function(event){eval($el.attr('data-onclick'));/*name must be 'event'*/ }); break;
				case 'data-ani-click': clickArr.push(function(e){		if($(e.target).closest('a,button,input,select,textarea,.mejs-overlay-button,map,[onclick],[data-useswipe="1"],[data-tapstart="1"],.panzoom',$el).length>0)return; /*exclude clicks on these*/
			if($el.hasClass('activePage')) eval(aval); }); break;
				case 'data-click-show': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ show(val); }); }); break;
				case 'data-click-hide': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ hide(val); }); $el.parent('a').trigger(clickEv); }); break;
				case 'data-click-next':clickArr.push(function(e){ args=($el.attr('data-loop')=='1'); $.each(aval.split(','), function(i,val){ nextState(val,args); }); }); break;				
				case 'data-click-prev': clickArr.push(function(e){ args=($el.attr('data-loop')=='1'); $.each(aval.split(','), function(i,val){ prevState(val,args); }); }); break;
				case 'data-click-state': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ args=val.split(':'); toState(args[0],args[1]); }); }); break;
				case 'data-click-play': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ args=val.split(':'); playMedia(args[0],args[1]); }) });	break;
				case 'data-click-pause': clickArr.push(function(e){$.each(aval.split(','), function(i,val){ pauseMedia(val); }) }); break;
				case 'data-click-stop': clickArr.push(function(e){ $.each(aval.split(','), function(i,val){ pauseMedia(val,true);}) }); break;
				case 'data-click-stopall': clickArr.push(function(e){stopAllMedia();}); break;
			}
		});
		$.each(postArr,function(i,func){func();});
		var pd = touchEnabled || clickArr.length===1;
		if(clickArr.length) { $el.on(clickEv,function(e){$.each(clickArr,function(i,func){func(e);}); if(pd){return false;} e.stopPropagation();  }); }
	});
}

$(window).on('hashchange', function(e){ checkHashData(); });
function checkHashData(){
	if(multifile){
		var hash = location.hash.split('#').join('');
		if(hash.length){
			var pie = hash.split('&'), plen = pie.length, piece, parts;
			var offset = $('#container').offset();
			while(plen--){
				piece = pie[plen], parts = piece.split('=');
				switch(parts[0]){
					case 'refy':$(document).scrollTop(parseInt(parts[1]) + offset.top); break;
				}
			}
		}
	}
}

$(function(){
	if(webAppType.length && initWebApp()) return false;
	$(document).on('newPage', function(e, data) { onNewPage(e, data); });
	checkHashData();
	if(!multifile && pageMode.substr(0,2) === 'cs') $(document).on('scroll', function(e){ checkScroll(e, pageMode.substr(2)); });
	if($('ul.thumbs').length) $('#in5footer').hide();
	initClickEvents();
	$('.scroll-horiz > *').each(function(index,elem){
		var left = parseFloat($(elem).css('left'));
		if(left < 0){ $(elem).css({left:'auto',right:left+'px'}).attr('style', $(elem).attr('style').replace(/( \!important)*;/g,' !important;')).parent('.scroll-horiz').addClass('pulltab-left'); }
	});
	$('.scroll-vert > *').each(function(index,elem){
		var top = parseFloat($(elem).css('top'));
		if(top < 0){ $(elem).css({top:'auto',bottom:top+'px'}).attr('style', $(elem).attr('style').replace(/( \!important)*;/g,' !important;')).parent('.scroll-vert').addClass('pulltab-top'); }
	});
	$('[data-ani]').on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', 
		function(e){
		var jel = $(this);
		if((jel.attr('style')||'').indexOf('reverse')<0) {
			if(jel.attr('data-hideend')=='1') jel.addClass('hidden');
		}else { 
			jel.css(pre+'animation', 'none'); 
			if(jel.attr('data-hidestart')=='1') jel.addClass('hidden');
		}
        seqNext(e);
        return false;
	}).each(function(index,el){
		var $el = $(el),hs=($el.attr('data-hidestart')=='1'),he=($el.attr('data-hideend')=='1');
		if(!multifile && (hs || he)){
		$(document).on('newPage',function(e,data){
			var onpage = $.contains($('.page').eq(data.index)[0],el),style=$el.attr('style')||'';
			if(!onpage){
				if(he) $el.removeClass('hidden');
				if(hs) $el.addClass('hidden');
				$el.attr('style',style.replace(/(?:animation[^;]+;*\s*)/,'')); 
			}
		}); }
	});
	$('.mso > .state').on('newState', function(e){ onNewState(e); });
	$('.mso.slideshow').each(function(index,el) {
		var mso = $(el), msoID = mso.attr('data-id'), loopSwipe = (mso.attr('data-loopswipe') == '1');
		var msoSwipe = (mso.attr('data-useswipe') == '1');
		el.duration = parseFloat(mso.attr('data-duration'));
		el.loopmax = parseInt(mso.attr('data-loopmax'));
		el.crossfade = parseFloat(mso.attr('data-crossfade')) * 1000;
		el.reverse = mso.attr('data-reverse') == '1';
		el.pageIndex = mso.parents('.page').index();
		if(mso.attr('data-tapstart') == '1' && !msoSwipe) {
			mso.on(clickEv, function(e) {
			if(!this.playing) startSlideShow(this);
			else stopSlideShow(this);
			return false;
			});
		}
		if(mso.attr('data-autostart') == '1') {
			$(document).on('newPage', function(e, data) {
				if(data.index == el.pageIndex) startSlideShowDelayed(el);
				else if (el.playing) stopSlideShow(el);
			});
		}
		if(msoSwipe) {
			if(useSmoothSwipeOnImageSequences && mso.hasClass('seq')){
				var triggerDist, lastPos,rev = el.reverse;
				mso.swipe({
					allowPageScroll:'vertical',fingers:1,maxTimeThreshold:9999,triggerOnTouchLeave:true,
					swipeStatus:function(evt,phase,dir,dist,dur,fingers,fingerData,currentDir) {
						switch(phase){
							case 'move':
								stepDist = Math.abs(dist - lastPos);
								if(stepDist < triggerDist) return;
								switch(currentDir){
									case "left":
										if(rev) prevState(msoID, loopSwipe);
										else nextState(msoID, loopSwipe);
										lastPos = dist;	
										break;
									case "right":
										if(rev) nextState(msoID, loopSwipe);
										else prevState(msoID, loopSwipe);
										lastPos = dist;	
										break;
								}
								break;
							case 'start': lastPos = 0; triggerDist = mso.width()/mso.find('.state').length*.5; break;
							case 'end':animateImageSeq(currentDir,rev,stepDist,triggerDist,msoID,loopSwipe,true); break;
						}
					},
				});
			} else {
				mso.swipe({
				allowPageScroll:'vertical', fingers:1, triggerOnTouchEnd:false, triggerOnTouchLeave:true,
				swipe:function(event, direction, distance, duration, fingerCount) {
					switch(direction) {
						case "left":
							if(el.reverse) prevState(msoID, loopSwipe);
							else nextState(msoID, loopSwipe);
							break;
						case "right":
							if(el.reverse) nextState(msoID, loopSwipe);
							else prevState(msoID, loopSwipe);
							break;		
					}
				} });
			}
		}
	});
	if($('.panzoom').length) initPanZoom();
	$('[target=_app]').each(function(){var jel=$(this); jel.on(clickEv,function(){location=jel.attr('href');return false;}) });
	if($.colorbox) {
		$('.lightbox').filter(':not(svg *)').filter(':not([href*=lightbox\\=0])').filter(isBaker?':not([href*=referrer\\=Baker])':'*').colorbox({iframe:true, width:"80%", height:"80%"});
		$('svg .lightbox').each(function(index,el){
			var jel = $(el);
			var xref = jel.attr('xlink:href');
			if(xref.indexOf('lightbox=0') != -1) return;
			if(!isBaker || xref.indexOf('referrer=Baker') != -1){
				jel.on(clickEv, function(){
				$.colorbox({iframe:true, width:"80%", height:"80%", href:$(this).attr('xlink:href')});
				return false;
				});
			}
		});
		$('.thumb').colorbox({maxWidth:"85%", maxHeight:"85%"});
		$(window).on('orientationchange', function(e){ if($('#cboxWrapper:visible').length) $.colorbox.resize(); });
	}
	$('img').on('dragstart', function(event) { event.preventDefault(); });
	$('.cover').on(clickEv, function() { loadFrame($(this).hide().siblings('iframe')[0]); return false; });
	if(multifile){
		if(!lazyLoad){ $('.svg-img').each(function(){ $(this).parent().load($(this).attr('src')+' svg'); }); }
		$('#prefooter').css('min-height', $('.page').height());
		nav = { numPages:1,
		previousPageIndex:nav?nav.previousPageIndex:undefined,
		current:parseInt(location.href.split('/').pop().split('.html').join('')),
		back:function(ref){nav.to(nav.current-1);},
		next:function(ref){nav.to(nav.current+1);},
		to:function(n,coords){
			if(n <= 0 || n > nav.numPages) return;
			var targPage = (n*.0001).toFixed(4).substr(2) + '.html';
			if(coords && coords.length) targPage += '#refx='+coords[0]+'&refy='+coords[1];
			if(targPage == location.href.split('/').pop()) $(window).trigger('hashchange');
			else location.assign(targPage);
		} };
		$('nav #nextBtn').on(clickEv, function(){ nav.next(); return false; });
		$('nav #backBtn').on(clickEv, function(){ nav.back(); return false; });
		if(arrowNav && $('.page').length){
			$('nav:hidden, nav #backBtn, nav #nextBtn').show();
			if(nav.current == 1) $('nav #backBtn').hide();
			if(nav.current == nav.numPages) $('nav #nextBtn').hide();
		}
	} else if(pageMode.indexOf('liquid') != -1) {
		if(!lazyLoad){ $('.svg-img').each(function(){ $(this).parent().load($(this).attr('src')+' svg'); }); }
		nav = { numPages:$('.pages .page').length,
		current:1,
		previousPageIndex:nav?nav.previousPageIndex:undefined,
		back:function(ref){nav.to(nav.current-1);},
		next:function(ref){nav.to(nav.current+1);},
		first:function(){nav.to(1);},
		last:function(){nav.to(nav.numPages);},
		to:function(n){
			if(n < 1 || n > nav.numPages) return;
			$(document).trigger('newPage', {index:n-1});
			if(n < 2) $('nav #backBtn:visible').hide();
			else $('nav #backBtn:hidden').show();
			if(n >= nav.numPages) $('nav #nextBtn:visible').hide();
			else $('nav #nextBtn:hidden').show();
		} };
		$('nav #nextBtn').on(clickEv, function(){ nav.next(); return false; });
		$('nav #backBtn').on(clickEv, function(){ nav.back(); return false; });
		if(arrowNav) $('nav:hidden').show();
		nav.to(getStartPage()); /*init*/
	} else if($.hasOwnProperty('scrollTo')){
		var dir = (pageMode[2] == 'h') ? 'x' : 'y';
		nav = { numPages:$('.pages .page').length,
			previousPageIndex:nav?nav.previousPageIndex:undefined,
			back:function(ref){var ind=$(ref).parent('.page').prev().index(); if(ind!=-1) nav.to(ind+1);},
			next:function(ref){var ind=$(ref).parent('.page').next().index(); if(ind!=-1) nav.to(ind+1);},
			first:function(){nav.to(1)},
			last:function(){nav.to(nav.numPages)},
			to:function(n,c){
				window.scrolling = true;
				var scrollTarg;
				if(c){ 
					var offset = $('.page').eq(n-1).offset();
					scrollTarg = {left:offset.left+c[0],top:offset.top+c[1]};					
				} else { scrollTarg = $('.page').eq(n-1)[0]; }
				$.scrollTo(scrollTarg, 500, {axis:dir, onAfter:function(){window.scrolling=false}});
				$(document).trigger('newPage', {index:n-1});} };
			nav.to(getStartPage());
	}
	if(useSwipe && !$('#container > ul.thumbs').length) {
		var container = $('#container'), scrollStart, scrollFunc = vertMode ? 'scrollLeft':'scrollTop';
		var vertMode = (pageMode.substr(0,1) == "v");
		if(vertMode) $.fn.swipe.defaults.excludedElements+=",.scroll";
		container.swipe({
			allowPageScroll: (vertMode ? 'horizontal' : 'vertical'),
			preventDefaultEvents:false,
			fingers:1, threshold:150,
			excludedElements:$.fn.swipe.defaults.excludedElements+',.mejs-overlay-button,map,[onclick],[data-useswipe="1"],[data-tapstart="1"],.panzoom,.scroll-horiz',
			swipeStatus:function(event, phase) {
				switch(phase){ case 'start': scrollStart = $(window)[scrollFunc](); break; }
			},swipe:function(event, direction, distance, duration, fingerCount) {
				if(Math.abs($(window)[scrollFunc]()-scrollStart)>distance) return;
				switch(direction) {
					case "left": if(!vertMode) nav.next(); break;
					case "right": if(!vertMode) nav.back(); break;
					case "up": if(vertMode) nav.next(); break;
					case "down": if(vertMode) nav.back(); break;		
				}
			}
		});
	}
});

$(window).load(function(){
	$('body').addClass('loaded');
	if(arrowNav && pageMode.indexOf('liquid') != -1) $('nav:hidden').show();
	
	initMedia(sliderSettings != undefined);
});

function initMedia(hasSlider){
	if(isBaker) return;
	if(!$('video,audio').length) {
		if(multifile) $(document).trigger('newPage', {index:0});
	 	return;
	}
	if(!window.mejs || $('video,audio').mediaelementplayer == undefined) {
		setTimeout(function(){initMedia(hasSlider);}, 50);
		return;
	 }
	var playerMode = (uAgent.indexOf('firefox') > -1 
		&& isLocal && parseInt(jQuery.browser.version)<22) ? 'shim' : 'auto';
	if((isIPad || isIPhone) && $('audio,video').filter('[data-autoplay]').length) {
		$('.page').one('touchstart', function(e){
			$(e.currentTarget).next().find('audio,video').filter('[data-autoplay]').each(function(){ if(this.load) this.load(); });
		});
	}
	if(hasSlider && (isIPad || isIPhone)) $('video,audio').mediaelementplayer({success:onMediaLoadSuccess});
	else { $('video,audio').mediaelementplayer({pluginPath:'assets/media/',iPadUseNativeControls:true, iPhoneUseNativeControls:true, mode:playerMode,
		AndroidUseNativeControls:true, enableKeyboard:false, success:onMediaLoadSuccess});
	}
}

function onMediaLoadSuccess (me, domObj) {
	if(multifile) $(document).trigger('newPage', {index:0});
	else if(pageMode.indexOf('liquid') != -1 && me.pluginType) $(document).trigger('newPage', {index:$('.activePage').index()});
	if($(domObj).hasClass('mejs-fsonly')) {me.addEventListener('play',function(){ try{domObj.player.enterFullScreen(); me.enterFullScreen();}catch(e){} }) };
	if($(domObj).attr('data-stoplast') == '1') { if(domObj.hasOwnProperty('player')) domObj.player.options.autoRewind = false; };
	me.addEventListener('play',function(){ $(document).trigger('mediaPlayback', {me:me,domObj:domObj}); });
	if(me.pluginType == 'flash' && $(domObj).attr('loop') == 'loop') { me.addEventListener('ended', function() { domObj.player.play(); }); }
}

if(isBaker){
	$(window).on('blur', function(e){
		stopAllMedia(this.document);
		$(window).scrollTop(0);
		$('.page [data-hidestart]').addClass('hidden');
		$(window).data('focused', false);
	}).on('focus', function(e) {
		if(!$(window).data('focused')) $(document).trigger('newPage', {index:0});
		$(window).data('focused', true);
	});
}

function getStartPage(){
	if(multifile || !useBookmark || !localStorage) return 1;
	if(!localStorage[bookmarkName]) return 1;
	return localStorage[bookmarkName];
}


