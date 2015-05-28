/***********************************************/
/*             DATASTORY D3 UTILS              */
/***********************************************/

//Requires d3.js !

//Define namespace ds with an initially empty list of properties
//see http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
var ds = (function() {
	var properties = {};
	return properties;
})();

/************ Adding util - example prototype *****************/
/*
(function() {

	function util() {
		var height    = 10,
			container = d3.select("body"),
			that      = container.append("div"); //private
		
		my.container = function (value) {
			if (!arguments.length) return container;
	    	container = value;
	    	return my;
		}

		my.height = function (value) {
			if (!arguments.length) return height;
	    	height = value;
	    	return my;
		}
		
		function my() {
			//Create item, using 'height'
			if(that == null) {
				that = container.append("div");
			}
			that.attr("height");
		}
	}

	ds.util = util;

})();
*/

/***************** Tooltip *********************//*

1. Easiest use: create the tooltip by binding to a selection, 
an set onShow for content change:

	var tt = ds.ttip(selection).onShow(function(d){tt.html(d.Nom)});

2. Without binding to selection, you have to manually call listeners : 
attach the display of the tooltip to a selection of D3 elements 
by just setting the .html(). Warning: without binding a selection but
nevertheless using relative .x and .y, the call to show needs to provide the
"this" context of the element as third argument !

	var tt = ds.ttip();
  	selection
    	.on("mouseover", function(d,i) { tt.html(d.Something).show(d,i,this); })
    	.on("mouseout", tt.hide);

3. More complex example, building the structure of the tooltip beforehand, and setting
it to display on specific x,y positions relative to the SVG container's coordinate system
and not on event d3.event.pageX and d3.event.pageY (default) :

	function attachTooltip(selection) {
  
	  // Initialize tooltip and set variables for dynamic content
	  var tt    = ds.ttip(selection),
	      nom   = tt.content().append("div").attr("class","title"),
	      par   = tt.content().append("div").attr("class","parti"),
	      parI  = par.append("span").attr("class","filterPartiIcon"),
	      parN  = par.append("span"),
	      com   = tt.content().append("div");
	  
	  // Set tooltip position to be at the middle of this element
	  // shortcut for x(function, true) (true mean relative coordinates)
	  tt
    	.x(function(d){return d.x;})
    	.y(function(d){return d.y;})
    	.offsety(function(d){return d.radius;});

	  // Update variables in tooltip without reselecting
	  tt.onShow(function(d,i) {
	    nom.html(d.Nom);
	    parI.style("background-color",color(d.Parti));
	    parNF.html(d.Parti);
	    com.html(d.Commune)
	  });
	  
	  // Bind to additional event
	  svg.on("click", tt.hide);    //touch screen -> hide on click elsewhere
	}

-------------------------------

See function definition for further fields and functions.

*/

(function() {

	function ttip(selection) {
		
		// Fields with default values
		var container = d3.select("body"),
			defclass  = "tooltip",
			defstyle  = "position: absolute; pointer-events: none;",
			that      = _init(),

			isAbsoluteX = true,
			isAbsoluteY = true,
			x         = function(d,i,context) { return d3.event.pageX; },
			y         = function(d,i,context) { return d3.event.pageY; },
			offsetx   = function(d,i,context) { return -that.node().getBoundingClientRect().width/2;},
			offsety   = function(d,i,context) { return 15;},
			
			onShow    = function() {};

		// (Re-)Generate the tooltip in case content was removed by caller
		function my() {
			if((that == null) || (that.node().parentNode == null))
				that = _init();
			
			/*
			// Keep for debugging !
			// centrer le tooltip sur l'élément hoverisé:
			// -> marche bien mais demande d'avoir setté .x() et .y()
			// et d'appeler impérativement show(d,i,context)
			// avec context = le 'this' du svg survolé
			
			matrix = function(d,i,context) {
				return context.getScreenCTM()
		      		.translate(x(d,i,context), y(d,i,context));
			}
			_realX = function(d,i,context) {
		      return (window.pageXOffset + matrix(d,i,context).e + offsetx(d,i,context)) + "px";
		  	}
		  	_realY = function(d,i,context) {
		      return (window.pageYOffset + matrix(d,i,context).f + offsety(d,i,context))  + "px";
		  	}
		  	*/

		  	/* 
		  	// Keep for debugging ! 
		  	// Works for absolute x + y only. Kept for debug
		  	_realX = function(d,i) {
		      return x(d,i) + offsetx(d,i) + "px";
		  	}
		  	_realY = function(d,i) {
		      return y(d,i) + offsety(d,i) + "px";
		  	}
		  	*/
		}

		// Initialize by creating a div for this tooltip
		function _init() {
			return container.append("div").attr({"class":defclass,"style":defstyle});
		}

		// Helper function, returns the value of f(d,i,c) if f is a function,
		// and the value of f otherwise
		function _val(f,d,i,c) { return (typeof f == 'function' ? f(d,i,c) : f); }

		// Functions that converts a given x and y in containers' coordinates
		// into absolute coordinates on the page, pageX and pageY.
		// see http://codepen.io/recursiev/pen/zpJxs
		function _matrix(d,i,context) {
			return context.getScreenCTM()
	    		.translate(_val(x,d,i,context), _val(y,d,i,context));
		}
		function _pageX(d,i,context) {
			return (window.pageXOffset + _matrix(d,i,context).e);
		};
		function _pageY(d,i,context) {
			return (window.pageYOffset + _matrix(d,i,context).f);
		};
		
		// Return real x and y. This is x + offset, in absolute screen coordinates.  	
	  	function _realX(d,i,context) {
	  		var s = 
	  			(!isAbsoluteX ? _pageX(d,i,context) : _val(x,d,i,context))
	  			+ _val(offsetx,d,i,context) 
	  			+ "px";
	  		return s;
	  	}
	  	function _realY(d,i,context) {
	  		var s = 
	  		(!isAbsoluteX ? _pageY(d,i,context) : _val(y,d,i,context))
	  		 + _val(offsety,d,i,context) 
	  		 + "px";
	  		return s;
	  	}

		// Getter/setters to use for x and y. isAbsolute must be set to true
		// if the value is absolute on the page (and not relative to parent)
		my.x = function(func, isAbsolute) {
			if (!arguments.length) return x;
			isAbsoluteX = (isAbsolute === 'undefined') ? false : isAbsolute;
	    	x = func;
	    	return my;
		}

		my.y = function(func, isAbsolute) {
			if (!arguments.length) return y;
	    	isAbsoluteY = (isAbsolute === 'undefined') ? false : isAbsolute;
	    	y = func;
	    	return my;
		}

		my.offsetx = function(func) {
			if (!arguments.length) return offsetx;
	    	offsetx = func;
	    	return my;
		}

		my.offsety = function(func) {
			if (!arguments.length) return offsety;
	    	offsety = func;
	    	return my;
		}

		// Returns a D3 selection with the contents of this
		my.content = function () {
			return that;
		}

		// Clears the content of this tooltip
		my.clear = function() {
			that.selectAll("*").remove();
			return my;
		}

		my.html = function(html) {
			if (!arguments.length) return that.html();
	    	that.html(html);
	    	return my;
		}

		my.onShow = function(func) {
			if (!arguments.length) return onShow;
	    	onShow = func;
	    	return my;
		}

		// Shows the tooltip
		my.show = function(d,i,context) {
			my();  // build or rebuild if destroyed
			if (typeof onShow === 'function') onShow(d,i,context);
			that
				.style("left", _realX(d,i,context))
				.style("top", _realY(d,i,context))
		    	.transition().duration(100).style("opacity", 1);
		  	return my;
		}

		// Hides the tooltip
		my.hide = function() {
			that.transition().duration(200).style("opacity", 0); 
			return my;
		}

		// Bind selection once and for all and register listeners.
		// (following code cannot be put in my(), otherwise never called...
		// is it good practice here ? FIXME ?)
		if(selection != null) {
			selection.on("mouseover",function(d,i) { my.show(d,i,this); });
			selection.on("mouseout",function(d,i) { my.hide(d,i,this); });
		}

		return my;
	}
	
	// Extend ds with defined function
	ds.ttip = ttip;

})();



/***************** Responsive Resize *********************//*

Resize automatically the svg given in argument, on 'resize' and 'load' events.
Use start() to start listening to events, and stop() to stop. (These functions
actually add or remove event listeners...)

Create by calling ds.responsive(svgElement, callback)
The svgElement is a d3 selection that contains just a svg and
the callback function will be invoked whenever an update() takes place.
It is invoked with updated svgElement, initial width and initial height
of svg upon creation of the ds.responsive() :

	callback(svgElement, initial_width, initial_height).

The update(event) function can also be called directly to force an update
outside of regular updates triggered by 'resize' and 'load' events.

This function automatically registers following listeners:
	window.addEventListener('resize', ...);
	window.addEventListener('load', ...);

---------------------------
Minimal use case with callback : 
	
	function customResize(svg,initialSVGWidth,initialSVGHeight) {
  		// Make custom updates, given svg (resized) as a d3.selection
  		// and initial width and height as numbers
  		// ...
	}

	// Create the responsive wrapper and start it
	var rsp = ds.responsive(d3.select("svg"), customResize).start();

	// Stop listening to events
	rsp.stop();

---------------------------
*/
(function() {

	function responsive(svgElement, callback) {
		
		var svg          = svgElement,
			w            = svg.attr("width"),
    		h            = svg.attr("height"),
			aspect       = w / h,
			init         = true,
			call         = callback
			events       = ['resize', 'load'],
			started      = false;

		my.update = function(event) {
			my();
			var targetWidth = svg.node().parentNode.offsetWidth;
		  	targetWidth = targetWidth < w ? targetWidth : w;
		  	var targetHeight = targetWidth / aspect;
		  	svg.attr("width", targetWidth);
		  	svg.attr("height", targetHeight);
		  	if (typeof call === 'function') call(svg,w,h);
		  	return my;
		}

		/*
		my.events = function (value) {
			if (!arguments.length) return events;
			if(started) { 
				my.stop();
				events = value;
				my.start();
			} else {
				events = value;
			}
	    	return my;
		}
		*/

		my.start = function() {
			for(var i=0; i<events.length; i++)
				window.addEventListener(events[i],my.update);
			started = true;
			return my;
		}

		my.stop = function() {
			for(var i=0; i<events.length; i++)
				window.removeEventListener(events[i],my.update);
			started = false;
			return my;
		}

		function my() {
			if(init) {
				svg.attr("viewBox","0 0 "+w+" "+h).attr("preserveAspectRatio","xMidYMid");
				init = false;
			}
		}

		return my;
	}

	ds.responsive = responsive;

})();




