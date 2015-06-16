# dsutils.js
Set of utilities for D3

## Tooltip

- Easiest use: create the tooltip by binding to a selection, 
an set `html` for content change:
```javascript
	var tt = ds.tooltip(selection);
  	tt.html(function(d) { return d.Nom + "<br>" + d.Altitude + "m"; });
```
- Easily create a default tooltip that shows all properties of the element being hovered
   by just calling `ds.ttip(<selection>).table()`
- Without binding to selection, you have to manually call listeners : 
attach the display of the tooltip to a selection of D3 elements 
by just setting the `.html()`. Warning: without binding a selection but
nevertheless using relative `.x` and `.y`, the call to show needs to provide the
`this` context of the element as third argument !
```javascript
	var tt = ds.ttip();
  	selection
    	.on("mouseover", function(d,i) { tt.html(d.Something).show(d,i,this); })
    	.on("mouseout", tt.hide);
```
- More complex example, building the structure of the tooltip beforehand, and setting
it to display on specific x,y positions relative to the SVG container's coordinate system
and not on event `d3.event.pageX` and `d3.event.pageY` (default) :
```javascript
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
    	.x(function(d){return x(d);})
    	.y(function(d){return y(d);})
    	.offsety(r);

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
```

### IMPORTANT WARNING

The value set by `.html(...)` has precedence over the value of `.onShow(...)`.
Therefore, when the tooltip is shown, `tt.html()` is evaluated first 
and it replaces the whole HTML content. For example if you call:
```javascript
	var tt = ds.tooltip(selection);
	var div = tt.content().append("div");
	tt.onShow(function(d) { div.text("Hello"); });
	tt.html("World");
	tt.show();
```

The tooltip will actually be just 
```html
	<div class="tooltip">World</div>.
```
Therefore, to avoid bad surprises, use wether `.html()` or `.onShow()`, 
but not both simultaneously. Setting `.html(null)` effectively removes
execution of the `.html()` when showing the tooltip.

Also, different tooltips can be created for different d3 selection, e.g.:
```javascript
	var tt1 = ds.tooltip( svg.selectAll("rect") );
  	tt1.html("I'm rect");

	var tt2 = ds.tooltip( svg.selectAll("circle") );
  	tt2.html("I'm circle and red").content().style("color","red");
```
