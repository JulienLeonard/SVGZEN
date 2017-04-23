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
var positionx = 0.0;

var movedelta;
var movevector;
var movesvgdoc;

var layouttype = 'circle';

setupHandlers(root);

/**
 * Register handlers
 */
function setupHandlers(root){
	setAttributes(root, {
		// "onmouseup" : "handleMouseUp(evt)",
		// "onmousedown" : "handleMouseDown(evt)",
		// "onmousemove" : "handleMouseMove(evt)",
		//"onmouseout" : "handleMouseUp(evt)", // Decomment this to stop the pan functionality when dragging out of the SVG element
	});

	if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
		window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
	else
		window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
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

/**
 * Handle mouse wheel event.
 */
function handleMouseWheel(evt) {
	if(!enableZoom)
		return;


	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

    if (stateSlide == '') {
	stateSlide = 'active';
	movedelta = 1.0;
	var sensdelta = 1.0;
    
	if (evt.wheelDelta)
	    sensdelta = evt.wheelDelta / 360; // Chrome/Safari
	else
	    sensdelta = evt.detail / -9; // Mozilla
	if (sensdelta < 0.0) 
	    movedelta = -1.0;

	movesvgdoc = evt.target.ownerDocument;
	doslide();
	// positionx = positionx + zoomdelta * 100.0;
    // dozoom();
    // doslide();
    // var svgDoc = zoomevent.target.ownerDocument;
    // console.log("positionx " + positionx);
	// translateviewbox(svgDoc,positionx);
    }
}

function dozoom() {

	var delta = zoomdelta;

    // console.error("hello wrold" + zoomdelta);

	var z = Math.pow(1 + zoomScale, delta);

	var svgDoc = zoomevent.target.ownerDocument;

	var g = getRoot(svgDoc);
	
	var p = getEventPoint(zoomevent);

	p = p.matrixTransform(g.getCTM().inverse());

	// Compute new scale matrix in current mouse position
	// var k = root.createSVGMatrix().translate(p.x, p.y).scale(z,1).translate(-p.x, -p.y);
	var k = root.createSVGMatrix().translate(p.x, p.y).scaleNonUniform(z,1).translate(-p.x, -p.y);

	setCTM(g, g.getCTM().multiply(k));

	if(typeof(stateTf) == "undefined")
		stateTf = g.getCTM().inverse();

	stateTf = stateTf.multiply(k.inverse());

	zoomdelta = zoomdelta * 0.92;

	if (Math.abs(zoomdelta) > 0.001) {
		setTimeout(dozoom,10);
	}
}

function translateviewbox(svgDoc,delta) {
    var g = getRoot(svgDoc);
    // var stateTf = g.getCTM().inverse();
    if(typeof(stateTf) == "undefined")
	stateTf = g.getCTM().inverse();

    // movevector = root.createSVGPoint(); 
    // movevector.x = delta;
    // movevector.y = 0.0; 
    movesvgdoc = svgDoc;
		
    setCTM(g, stateTf.translate(delta, 0.0));
}


/**
 * Handle mouse move event.
 */
function handleMouseMove(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var g = getRoot(svgDoc);

	if(state == 'pan' && enablePan) {
		console.error("pan mode");
		var p = getEventPoint(evt).matrixTransform(stateTf);

	    translateviewbox(svgDoc,p.x - stateOrigin.x);

		
	} else if(state == 'drag' && enableDrag != 0) {
		console.error("drag mode");

		var p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

		setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

		stateOrigin = p;
	}
}

/**
 * Handle click event.
 */
function handleMouseDown(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var g = getRoot(svgDoc);

	if(
		evt.target.tagName == "svg" 
		|| !enableDrag // Pan anyway when drag is disabled and the user clicked on an element 
	) {
		// Pan mode
		state = 'pan';

		stateTf = g.getCTM().inverse();

		stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
	} else {
		// Drag mode
		state = 'drag';

		stateTarget = evt.target;

		stateTf = g.getCTM().inverse();

		stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
	}
}

/**
 * Handle mouse button release event.
 */
function handleMouseUp(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	if(state == 'pan' || state == 'drag') {
		// Quit pan mode
		state = '';
		movedelta = 1.0;
		// doslide();
	}
}

function doslide() {
	var g = getRoot(movesvgdoc);

	console.error("doslide " + movedelta);
    positionx = positionx + movedelta * 100.0;
    
	// setCTM(g, stateTf.inverse().translate((2.0-movedelta)*movevector.x, (2.0-movedelta)*movevector.y));

    movedelta = movedelta * 0.92;
    // setCTM(g, stateTf.translate(delta, 0.0));
    translateviewbox(movesvgdoc,positionx);

	if (Math.abs(movedelta) > 0.001) {
		setTimeout(doslide,10);
	} else {
	    stateSlide = '';
	}
}

function traceitem(event,type,ID) {
	var target = event.target;
	console.error("traceitem " + type + " " + target.getAttribute("title") + " ID arg " + ID);
		
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

function fade (targetid,opacity) {
	// create the fade animation
	var target = document.getElementById(targetid)
	var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
	animation.setAttributeNS(null, 'attributeName', 'opacity');
	animation.setAttributeNS(null, 'begin', 'indefinite');
	animation.setAttributeNS(null, 'to', opacity);
	animation.setAttributeNS(null, 'dur', 0.25);
	animation.setAttributeNS(null, 'fill', 'freeze');
	// link the animation to the target
	target.appendChild(animation);
	// start the animation
	console.error("start animation on target " + target.getAttribute("id") );
	animation.beginElement();
}

function displayinterface(interfaceid,opacity) {
	// var target = event.target.parentNode;
	fade('interfaceleft',0.0);
	fade('interfaceup',0.0);
    if (interfaceid != "none") {
		var target = document.getElementById(interfaceid);
		console.error("displayinterface  interfaceid " + interfaceid + " opacity " + opacity );
		fade(interfaceid,opacity);
	}
}

function changeclassdisplay(event) {
	var node = event.target;
	var isdisplay = node.getAttribute("display");
	var classdisplay = node.getAttribute("displayclass");
	var groupnode = node.ownerDocument.getElementById(classdisplay);
	var newopacity = isdisplay == 1 ? 0.0 : 1.0;
	var newdisplay = isdisplay == 1 ? 0 : 1;
	console.error("changeclassdisplay  event " + event + " isdisplay " + isdisplay + " classdisplay " + classdisplay + " newopacity " + newopacity );
	node.setAttribute("display",newdisplay);
	// groupnode.setAttribute("opacity",newopacity);
	fade(classdisplay,newopacity);
}

function changelayoutdisplay(event) {
	var node = event.target;
	var displaylayout = node.getAttribute("displaylayout");
	if (displaylayout != layouttype) {
		var newlayout = displaylayout;
		var oldlayout = layouttype;
		layouttype = newlayout;
		var animname = "pathanim"+oldlayout+newlayout;
		
		console.error("layoutdisplay oldlayout " + oldlayout + " newlayout " + newlayout + " animname " + animname );

		var pathnodes = document.getElementsByName(animname);
		for (var i=0;i<pathnodes.length;i++)
		{
			pathnodes[i].beginElement();
		}
	}
}