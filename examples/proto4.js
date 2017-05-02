$(document).ready(function(){
    svgrender();
});


function drawtitle(xcenter,nitem,g,child,cy) {
    var childid        = child.id;
    var childclass     = child.classname;
    var childinnerhtml = child.innerHTML
    
    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    var r = 200;
    var ccy = cy + r * 1.5;
    var side = 0.0;
    var cx = xcenter + side * r;

    c.setAttribute("id","c"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r);
    c.setAttribute("fill","#111133");
    c.setAttribute("stroke","white");
    c.setAttribute("stroke-width","5");
    g.appendChild(c);

    // create text
    var t = document.createElementNS("http://www.w3.org/2000/svg",'text');
    t.setAttribute("id","t"+childid);
    t.setAttribute("x",cx);
    t.setAttribute("y",ccy);
    t.setAttribute("fill","white");
    t.setAttribute("style","font-family:Helvetica;font-size:70; text-anchor:middle; alignment-baseline:central; leading:1.5em;");

    var h1node = child.getElementsByTagName('h1')[0];
    var texttitle = h1node.innerText;    
    t.innerHTML = child.getElementsByTagName('h1')[0].innerHTML;

    g.appendChild(t);
    
    cy += r * 3.0;
    
    return cy;
}


function drawartwork(xcenter,nitem,g,child,cy) {
    // <image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
    var childid        = child.id;
    var childclass     = child.classname;
    var childinnerhtml = child.innerHTML;

    var image = document.createElementNS("http://www.w3.org/2000/svg",'image');
    var r = 500;
    var ccy = cy + r;
    var side = 1.0;
    if (nitem % 2 == 0) {
	side = -1.0;
    }
    var cx = xcenter + side * r + (0.5 - Math.random()) * r;
    var ix = cx - r;
    var iy = cy;

    // get image path as src of child item img
    var imgnode = child.getElementsByTagName('img')[0];
    var imagepath = imgnode.getAttribute('src');

    // get link path
    var linknode = child.getElementsByTagName('a')[0];
    var linkpath = linknode.getAttribute('href');
    console.log("linkpath " + linkpath );
    
    // create a href for the whole artwork
    var a = document.createElementNS("http://www.w3.org/2000/svg",'a');
    a.setAttributeNS('http://www.w3.org/1999/xlink','href', linkpath);
    g.appendChild(a);
    
    // draw subcircle to do border
    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    c.setAttribute("id","cborder"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r * 0.9);
    c.setAttribute("fill","white");
    c.setAttribute("stroke","white");
    c.setAttribute("stroke-width","10");
    a.appendChild(c);
    
    
    // image.setAttributeNS("xlink:href","Gravity-Flower-Details.jpg")
    image.setAttributeNS('http://www.w3.org/1999/xlink','href', imagepath);
    image.setAttribute("x",ix);
    image.setAttribute("y",iy);
    image.setAttribute("height",r * 2.0);
    image.setAttribute("width", r * 2.0);

    var cpath = document.createElementNS("http://www.w3.org/2000/svg",'clipPath');
    cpath.setAttribute("id","cpath" + childid);

    var c = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    c.setAttribute("id","cpathc"+childid);
    c.setAttribute("cx",cx);
    c.setAttribute("cy",ccy);
    c.setAttribute("r",r * 0.9);
    // c.setAttribute("href",linkpath);
    c.setAttributeNS('http://www.w3.org/1999/xlink','href', linkpath);
    
    cpath.appendChild(c);
    a.appendChild(cpath);
    
    image.setAttribute("clip-path","url(#" + "cpath" + childid + ")");
    a.appendChild(image);

    // draw title and subtitle as opposite to pictures
    var ocx = cx - side * (r + 125);
    var t = document.createElementNS("http://www.w3.org/2000/svg",'text');
    t.setAttribute("id","t"+childid);
    t.setAttribute("x",ocx);
    t.setAttribute("y",ccy);
    t.setAttribute("fill","white");
    t.setAttribute("style","font-family:Helvetica;font-size:70; text-anchor:middle; alignment-baseline:central; leading:1.5em;");
    // t.setAttribute("href",linkpath);

    var h1node = child.getElementsByTagName('h1')[0];
    var texttitle = h1node.innerText;    
    t.innerHTML = child.getElementsByTagName('h1')[0].innerHTML;

    a.appendChild(t);
    

    
    cy += r * 1.5;
    return cy;
}
