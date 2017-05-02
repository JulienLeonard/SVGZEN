/** 
 *  SVGPan library 1.2.2
 * ======================
 *
 * Given an unique existing element with id "viewport" (or when missing, the 
 * first g-element), including the the library into any SVG adds the following 
 * capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag with the variables
 * listed in the CONFIGURATION section of this file.
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2.2, Tue Aug 30 17:21:56 CEST 2011, Andrea Leofreddi
 *	- Fixed viewBox on root tag (#7)
 *	- Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *	- Fixed a regression with mouse wheel (now working on Firefox 5)
 *	- Working with viewBox attribute (#4)
 *	- Added "use strict;" and fixed resulting warnings (#5)
 *	- Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *	Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *	Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *	First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

"use strict";

/// CONFIGURATION 
/// ====>

var enablePan = 1; // 1 or 0: enable or disable panning (default enabled)
var enableZoom = 1; // 1 or 0: enable or disable zooming (default enabled)
var enableDrag = 0; // 1 or 0: enable or disable dragging (default disabled)
var zoomScale = 0.2; // Zoom sensitivity

/// <====
/// END OF CONFIGURATION 

var root = document.documentElement;

var state = 'none', svgRoot = null, stateTarget, stateOrigin, stateTf;
var stateSlide = '';

var zoomdelta = 0.0;
var zoomevent;
var positiondelta = 0.0;
var touchstarty = 0.0;

var movedelta = 0.0;
var movevector;
var movesvgdoc;

var layouttype = 'circle';

setupHandlers(root);

function getviewportwidth () {
    // return $(window).width();
    return window.innerWidth;
    // return 1000;
}

function getviewportheight () {
    // return $(window).height();
    return window.innerHeight;

    // return 2000;
}

function getdirection () {
    // return (getviewportwidth() > getviewportheight());
    return false;
}


/**
 * Register handlers
 */
function setupHandlers(root){

    if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
    	window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
    else
     	window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others

    window.addEventListener('touchstart',  handleTouchStart, false); // Others
    window.addEventListener('touchmove',  handleTouchMove, false); // Others
}

/**
 * Retrieves the root element for SVG manipulation. The element is then cached into the svgRoot global variable.
 */
function getRoot(root) {
    if(svgRoot == null) {
	var r = root.getElementById("viewport") ? root.getElementById("viewport") : root.documentElement, t = r;

	while(t != root) {
	    if(t.getAttribute("viewBox")) {
		setCTM(r, t.getCTM());

		t.removeAttribute("viewBox");
	    }

	    t = t.parentNode;
	}

	svgRoot = r;
    }

    return svgRoot;
}

/**
 * Instance an SVGPoint object with given event coordinates.
 */
function getEventPoint(evt) {
    var p = root.createSVGPoint();
    
    p.x = evt.clientX;
    p.y = evt.clientY;

    return p;
}

/**
 * Sets the current transform matrix of an element.
 */
function setCTM(element, matrix) {
    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

    element.setAttribute("transform", s);
}

/**
 * Dumps a matrix to a string (useful for debug).
 */
function dumpMatrix(matrix) {
    var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "\n  0, 0, 1 ]";

    return s;
}

/**
 * Sets attributes of an element.
 */
function setAttributes(element, attributes){
    for (var i in attributes)
	element.setAttributeNS(null, i, attributes[i]);
}

function sensWheelDelta(evt) {
    if (evt.wheelDelta)
	return evt.wheelDelta / 360; // Chrome/Safari
    else
	return evt.detail / -9; // Mozilla
}

/**
 * Handle mouse wheel event.
 */
function handleMouseWheel(evt) {

    if(evt.preventDefault)
	evt.preventDefault();

    evt.returnValue = false;

    if (stateSlide == '') {
	stateSlide = 'active';

	movedelta = 1.0;
	if (sensWheelDelta(evt) < 0.0) 
	    movedelta = -1.0;

	movesvgdoc = evt.target.ownerDocument;
	doslide();
    }
}

/**
 * Handle touch start event.
 */
function handleTouchStart(evt) {

    console.log("handleTouchMove");

    if(evt.preventDefault)
	evt.preventDefault();

    evt.returnValue = false;

    var touchobj = evt.changedTouches[0];
    touchstarty = touchobj.clientY;
}


/**
 * Handle touch move event.
 */
function handleTouchMove(evt) {

    console.log("handleTouchMove");

    if(evt.preventDefault)
	evt.preventDefault();

    evt.returnValue = false;

    if (stateSlide == '') {
	stateSlide = 'active';

	movedelta = 1.0;
	var touchobj = evt.changedTouches[0];
	var newtouchstarty = touchobj.clientY;
	if (touchstarty - newtouchstarty > 0.0) 
	    movedelta = -1.0;

	movesvgdoc = evt.target.ownerDocument;
	doslide();
    }
}


function getscrollvector (delta) {
    if (getdirection())
	return [delta,0.0];
    else
	return [0.0,delta];
    
}

function translateviewbox(svgDoc,delta) {
    var g = getRoot(svgDoc);
    // var stateTf = g.getCTM().inverse();
    if(typeof(stateTf) == "undefined")
	stateTf = g.getCTM().inverse();

    var v = getscrollvector(delta);
    console.log("translateviewbox " + v);
    setCTM(g, stateTf.translate(v[0],v[1]));
}



function doslide() {
    var g = getRoot(movesvgdoc);

    positiondelta = positiondelta + movedelta * 60.0;
    var circle = document.getElementById("onepage");
    
    console.log("doslide positiondelta " + positiondelta + " DOTSART circle position " + getposition(circle));
    movedelta = movedelta * 0.92;
    translateviewbox(movesvgdoc,positiondelta);

    if (Math.abs(movedelta) > 0.1) {
	setTimeout(doslide,10);
    } else {
	stateSlide = '';
    }
}

function traceitem(event,type,ID) {
    var target = event.target;
    console.log("traceitem " + type + " " + target.getAttribute("title") + " ID arg " + ID);
		
}

function openlink( ID ) {
    window.location = ID + ".html";
}

function getTarget (event) {
    var target = event.target;
    while (target.parentNode !== event.currentTarget) {
        target = target.parentNode;
    }
    return target;
}

