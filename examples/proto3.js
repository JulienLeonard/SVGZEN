$(document).ready(function(){
    svgrender();
});


function drawtitle(xcenter,nitem,g,child,cy) {
    var childid        = child.id;
    var childclass     = child.classname;
    var childinnerhtml = child.innerHTML
    
    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    var r = 200;
    var ccy = cy + r;
    var side = 1.0;
    if (nitem % 2 == 0) {
	side = -1.0;
    }
    var cx = xcenter + side * r;

    c.setAttribute("id","c"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r);
    c.setAttribute("fill","white");
    c.setAttribute("stroke","black");
    c.setAttribute("stroke-width","10");
    g.appendChild(c);

    // create text
    var t = document.createElementNS("http://www.w3.org/2000/svg",'text');
    t.setAttribute("id","t"+childid);
    t.setAttribute("x",cx);
    t.setAttribute("y",ccy);
    t.setAttribute("fill","black");
    t.setAttribute("style","font-family:Helvetica;font-size:70; text-anchor:middle; alignment-baseline:central; leading:1.5em;");
    t.innerHTML = childinnerhtml;

    g.appendChild(t);
    
    cy += r * 1.5;
    
    return cy;
}

function drawsubtitle(xcenter,nitem,g,child,cy) {
    var childid    = child.id;
    var childclass = child.classname;
    var childinnerhtml = child.innerHTML
    
    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    var r = 150;
    var ccy = cy + r;
    var side = 1.0;
    if (nitem % 2 == 0) {
	side = -1.0;
    }
    var cx = xcenter + side * r;

    c.setAttribute("id","c"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r);
    c.setAttribute("fill","white");
    c.setAttribute("stroke","black");
    c.setAttribute("stroke-width","10");
    g.appendChild(c);

    // create text
    var t = document.createElementNS("http://www.w3.org/2000/svg",'text');
    t.setAttribute("id","t"+childid);
    t.setAttribute("x",cx);
    t.setAttribute("y",ccy);
    t.setAttribute("fill","black");
    t.setAttribute("style","font-family:Helvetica;font-size:35; text-anchor:middle; alignment-baseline:central; leading:1.5em;");
    t.innerHTML = childinnerhtml;

    g.appendChild(t);
    
    cy += r * 1.5;
    return cy;
}

function drawbigimage(xcenter,nitem,g,child,cy) {
    // <image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
    var childid        = child.id;
    var childclass     = child.classname;
    var childinnerhtml = child.innerHTML;
    
    var image = document.createElementNS("http://www.w3.org/2000/svg",'image');
    var r = 500;
    var ccy = cy + r * 1.25;
    var side = 0.0;
    var cx = xcenter;
    var ix = xcenter - r;
    var iy = cy + r * 0.25;

    // image.setAttributeNS("xlink:href","Gravity-Flower-Details.jpg")
    image.setAttributeNS('http://www.w3.org/1999/xlink','href', 'Gravity-Flower-Details.jpg');
    image.setAttribute("x",ix);
    image.setAttribute("y",iy);
    image.setAttribute("height",1000);
    image.setAttribute("width",1000);


    var cpath = document.createElementNS("http://www.w3.org/2000/svg",'clipPath');
    cpath.setAttribute("id","cpath" + childid);

    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    c.setAttribute("id","cpathc"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r * 0.9);
    
    cpath.appendChild(c);
    g.appendChild(cpath);
    
    image.setAttribute("clip-path","url(#" + "cpath" + childid + ")");
    g.appendChild(image);
    
    cy += r * 1.5;
    return cy;
}
