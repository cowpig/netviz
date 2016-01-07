var train = false;
var data, labels, N;
var ss = 50.0; // scale for drawing

// create neural net
var layer_defs, net, trainer;
var t = "\n\
layer_defs = [];\n\
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:2});\n\
layer_defs.push({type:'fc', num_neurons:8, activation: 'relu'});\n\
layer_defs.push({type:'fc', num_neurons:6, activation: 'relu'});\n\
layer_defs.push({type:'fc', num_neurons:6, activation: 'relu'});\n\
layer_defs.push({type:'softmax', num_classes:2});\n\
\n\
net = new convnetjs.Net();\n\
net.makeLayers(layer_defs);\n\
\n\
trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, momentum:0.1, batch_size:10, l2_decay:0.1});\n\
";

function reload() {
  eval($("#layerdef").val());

  // enter buttons for layers
  var t = '';
  for(var i=1;i<net.layers.length-1;i++) { // ignore input and regression layers (first and last)
    var butid = "button" + i;
    t += "<input id=\""+butid+"\" value=\"" + net.layers[i].layer_type + 
        "(" + net.layers[i].out_depth + ")" + "\" type=\"submit\" onclick=\"updateLix(" +
          i + ")\" style=\"width:80px; height: 30px; margin:5px;\";>";
  }
  $("#layer_ixes").html(t);
  $("#button"+lix).css('background-color', '#FFA');
  $("#cyclestatus").html('drawing neurons ' + d0 + ' and ' + d1 + 
    ' of layer with index ' + lix + ' (' + net.layers[lix].layer_type + ')');

  updateNetVis();
}

function updateLix(newlix) {
  $("#button"+lix).css('background-color', ''); // erase highlight
  lix = newlix;
  d0 = 0;
  d1 = 1; // reset these
  $("#button"+lix).css('background-color', '#FFA');

  $("#cyclestatus").html('drawing neurons ' + d0 + ' and ' + d1 + ' of layer with index ' + 
    lix + ' (' + net.layers[lix].layer_type + ')');
}
 

function myinit() { }

function random_data(){
  data = [];
  labels = [];
  for(var k=0;k<40;k++) {
    data.push([convnetjs.randf(-3,3), convnetjs.randf(-3,3)]); labels.push(convnetjs.randf(0,1) > 0.5 ? 1 : 0);
  }
  N = labels.length;
}

function original_data(){
  
  data = [];
  labels = [];
  data.push([-0.4326  ,  1.1909 ]); labels.push(1);
  data.push([3.0, 4.0]); labels.push(1);
  data.push([0.1253 , -0.0376   ]); labels.push(1);
  data.push([0.2877 ,   0.3273  ]); labels.push(1);
  data.push([-1.1465 ,   0.1746 ]); labels.push(1);
  data.push([1.8133 ,   1.0139  ]); labels.push(0);
  data.push([2.7258 ,   1.0668  ]); labels.push(0);
  data.push([1.4117 ,   0.5593  ]); labels.push(0);
  data.push([4.1832 ,   0.3044  ]); labels.push(0);
  data.push([1.8636 ,   0.1677  ]); labels.push(0);
  data.push([0.5 ,   3.2  ]); labels.push(1);
  data.push([0.8 ,   3.2  ]); labels.push(1);
  data.push([1.0 ,   -2.2  ]); labels.push(1);
  N = labels.length;
}

function circle_data() {
  data = [];
  labels = [];
  for(var i=0;i<50;i++) {
    var r = convnetjs.randf(0.0, 2.0);
    var t = convnetjs.randf(0.0, 2*Math.PI);
    data.push([r*Math.sin(t), r*Math.cos(t)]);
    labels.push(1);
  }
  for(var i=0;i<50;i++) {
    var r = convnetjs.randf(3.0, 5.0);
    //var t = convnetjs.randf(0.0, 2*Math.PI);
    var t = 2*Math.PI*i/50.0
    data.push([r*Math.sin(t), r*Math.cos(t)]);
    labels.push(0);
  }
  N = data.length;
}

function spiral_data() {
  data = [];
  labels = [];
  var n = 100;
  for(var i=0;i<n;i++) {
    var r = i/n*5 + convnetjs.randf(-0.1, 0.1);
    var t = 1.25*i/n*2*Math.PI + convnetjs.randf(-0.1, 0.1);
    data.push([r*Math.sin(t), r*Math.cos(t)]);
    labels.push(1);
  }
  for(var i=0;i<n;i++) {
    var r = i/n*5 + convnetjs.randf(-0.1, 0.1);
    var t = 1.25*i/n*2*Math.PI + Math.PI + convnetjs.randf(-0.1, 0.1);
    data.push([r*Math.sin(t), r*Math.cos(t)]);
    labels.push(0);
  }
  N = data.length;
}

function concentric_rings() {
  data = [];
  labels = [];
  for(var r=1; r<5; r++) {
    for (var i=0; i<r*25; i++) {
      var rad = r - convnetjs.randf(0.5, 1.0);
      var t = convnetjs.randf(0.0, 2*Math.PI);
      data.push([rad*Math.sin(t), rad*Math.cos(t)]);
      labels.push(r % 2);
    }
  }
  N = data.length;
}

function update(){
  // console.log("update");
  if (clicked === false){
    if (train) {
      // forward prop the data

      var start = new Date().getTime();

      var x = new convnetjs.Vol(1,1,2);
      //x.w = data[ix];
      var avloss = 0.0;
      for(var iters=0;iters<20;iters++) {
        for(var ix=0;ix<N;ix++) {
          x.w = data[ix];
          var stats = trainer.train(x, labels[ix]);
          avloss += stats.loss;
        }
      }
      avloss /= N*iters;

      var end = new Date().getTime();
      var time = end - start;
          
      // console.log('loss = ' + avloss + ', 100 cycles through data in ' + time + 'ms');
    }
  }
}

function cycle() {
  var selected_layer = net.layers[lix];
  d0 += 1;
  d1 += 1;
  if(d1 >= selected_layer.out_depth) d1 = 0; // and wrap
  if(d0 >= selected_layer.out_depth) d0 = 0; // and wrap
  $("#cyclestatus").html('drawing neurons ' + d0 + ' and ' + d1 + ' of layer #' + lix + 
      ' (' + net.layers[lix].layer_type + ')');
}

var lix = 4; // layer id to track first 2 neurons of
var d0 = 0; // first dimension to show visualized
var d1 = 1; // second dimension to show visualized

function draw(){
    // console.log("draw");
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    // node visualization
    if (selected_node !== null){
      nodectx.clearRect(0,0,WIDTH,HEIGHT);
    }
    
    var netx = new convnetjs.Vol(1,1,2);
    // draw decisions in the grid
    var density= 5.0;
    var gridstep = 2;
    var gridx = [];
    var gridy = [];
    var gridl = [];

    var gridnode = [];
    
    for(var x=0.0, cx=0; x<=WIDTH; x+= density, cx++) {
      for(var y=0.0, cy=0; y<=HEIGHT; y+= density, cy++) {
        //var dec= svm.marginOne([(x-WIDTH/2)/ss, (y-HEIGHT/2)/ss]);
        netx.w[0] = (x-WIDTH/2)/ss;
        netx.w[1] = (y-HEIGHT/2)/ss;
        var a = net.forward(netx, false);
        
        if(a.w[0] > a.w[1]) ctx.fillStyle = 'rgb(250, 150, 150)';
        else ctx.fillStyle = 'rgb(150, 250, 150)';

        ctx.fillStyle = 'rgb(150,' + Math.floor(a.w[0]*105)+150 + ',150)';
        ctx.fillStyle = 'rgb(' + Math.floor(a.w[0]*255) + ',' + Math.floor(a.w[1]*255) + ', 0)';
        ctx.fillRect(x-density/2-1, y-density/2-1, density+2, density+2);

        if(cx%gridstep === 0 && cy%gridstep===0) {
          // record the transformation information
          var xt = net.layers[lix].out_act.w[d0]; // in screen coords
          var yt = net.layers[lix].out_act.w[d1]; // in screen coords
          gridx.push(xt);
          gridy.push(yt);

          if (selected_node !== null){
            // console.log("selected_node: " + selected_node);
            // console.log(net.layers);

            var activation = net.layers[selected_node[0]].out_act.w[selected_node[1]];
            nodectx.fillStyle = "hsl(0, 0%, " + (100-activation*100) + "%)"
            var scalor = (WIDTH / density);
            nodectx.fillRect(x-density, y-density, density*2, density*2);
          }

          gridl.push(a.w[0] > a.w[1]); // remember final label as well
        }
      }
    }

    // draw axes
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(50,50,50)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, HEIGHT/2);
    ctx.lineTo(WIDTH, HEIGHT/2);
    ctx.moveTo(WIDTH/2, 0);
    ctx.lineTo(WIDTH/2, HEIGHT);
    ctx.stroke();


    // draw axes
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(50,50,50)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, HEIGHT/2);
    ctx.lineTo(WIDTH, HEIGHT/2);
    ctx.moveTo(WIDTH/2, 0);
    ctx.lineTo(WIDTH/2, HEIGHT);
    ctx.stroke();


    // draw representation transformation axes for two neurons at some layer
    var mmx = cnnutil.maxmin(gridx);
    var mmy = cnnutil.maxmin(gridy);
    visctx.clearRect(0,0,visWIDTH,visHEIGHT);
    visctx.strokeStyle = 'rgb(0, 0, 0)';
    var n = Math.floor(Math.sqrt(gridx.length)); // size of grid. Should be fine?
    var ng = gridx.length;
    var c = 0; // counter
    visctx.beginPath() 
    for(var x=0;x<n;x++) {
      for(var y=0;y<n;y++) {

        // down
        var ix1 = x*n+y;
        var ix2 = x*n+y+1;
        if(ix1 >= 0 && ix2 >= 0 && ix1 < ng && ix2 < ng && y<n-1) { // check oob
          var xraw = gridx[ix1];
          xraw1 = visWIDTH*(gridx[ix1] - mmx.minv)/mmx.dv;
          yraw1 = visHEIGHT*(gridy[ix1] - mmy.minv)/mmy.dv;
          xraw2 = visWIDTH*(gridx[ix2] - mmx.minv)/mmx.dv;
          yraw2 = visHEIGHT*(gridy[ix2] - mmy.minv)/mmy.dv;
          visctx.moveTo(xraw1, yraw1);
          visctx.lineTo(xraw2, yraw2);
        }

        // and draw its color
        if(gridl[ix1]) visctx.fillStyle = 'rgb(250, 150, 150)';
        else visctx.fillStyle = 'rgb(150, 250, 150)';
        var sz = density * gridstep;
        visctx.fillRect(xraw1-sz/2-1, yraw1-sz/2-1, sz+2, sz+2);

        // right
        var ix1 = (x+1)*n+y;
        var ix2 = x*n+y;
        if(ix1 >= 0 && ix2 >= 0 && ix1 < ng && ix2 < ng && x <n-1) { // check oob
          var xraw = gridx[ix1];
          xraw1 = visWIDTH*(gridx[ix1] - mmx.minv)/mmx.dv;
          yraw1 = visHEIGHT*(gridy[ix1] - mmy.minv)/mmy.dv;
          xraw2 = visWIDTH*(gridx[ix2] - mmx.minv)/mmx.dv;
          yraw2 = visHEIGHT*(gridy[ix2] - mmy.minv)/mmy.dv;
          visctx.moveTo(xraw1, yraw1);
          visctx.lineTo(xraw2, yraw2);
        }
 
      }
    }
    visctx.stroke();

    // draw datapoints.
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.lineWidth = 1;
    for(var i=0;i<N;i++) {
      
      if(labels[i]==1) ctx.fillStyle = 'rgb(100,200,100)';
      else ctx.fillStyle = 'rgb(200,100,100)';
      
      drawCircle(data[i][0]*ss+WIDTH/2, data[i][1]*ss+HEIGHT/2, 5.0);

      // also draw transformed data points while we're at it
      netx.w[0] = data[i][0];
      netx.w[1] = data[i][1]
      var a = net.forward(netx, false);
      var xt = visWIDTH * (net.layers[lix].out_act.w[d0] - mmx.minv) / mmx.dv; // in screen coords
      var yt = visHEIGHT * (net.layers[lix].out_act.w[d1] - mmy.minv) / mmy.dv; // in screen coords
      if(labels[i]==1) visctx.fillStyle = 'rgb(100,200,100)';
      else visctx.fillStyle = 'rgb(200,100,100)';
      visctx.beginPath();
      visctx.arc(xt, yt, 5.0, 0, Math.PI*2, true); 
      visctx.closePath();
      visctx.stroke();
      visctx.fill();
    }

    updateNetVis();
}

function mouseClick(x, y, shiftPressed, ctrlPressed){
  
  // x and y transformed to data space coordinates
  var xt = (x-WIDTH/2)/ss;
  var yt = (y-HEIGHT/2)/ss;

  if(ctrlPressed) {
    // remove closest data point
    var mink = -1;
    var mind = 99999;
    for(var k=0, n=data.length;k<n;k++) {
      var dx = data[k][0] - xt;
      var dy = data[k][1] - yt;
      var d = dx*dx+dy*dy;
      if(d < mind || k==0) {
        mind = d;
        mink = k;
      }
    }
    if(mink>=0) {
      console.log('splicing ' + mink);
      data.splice(mink, 1);
      labels.splice(mink, 1);
      N -= 1;
    }

  } else {
    // add datapoint at location of click
    data.push([xt, yt]);
    labels.push(shiftPressed ? 1 : 0);
    N += 1;
  }

}

function keyDown(key){
}

function keyUp(key) {
}

function toggleTrain() {
  train = !train;
  if (train) {
    $("#toggletrain").attr("value", "pause training");
  } else {
    $("#toggletrain").attr("value", "resume training");
  }
}

function stepTrain() {
  train = true;
  update();
  train = false;
  $("#toggletrain").attr("value", "resume training");
}

// globals for neural network structure visualization
var pad = 40;
var radi = 20;
var nncanvas;
var nnctx;
var nodes = [];
var wlocs = []; // objs on connection lines that represent weights
var selected_node = null; // node that has been selected for visualization

function resetNetVis()
{
  // important gotcha: the convnet object has two "layer" objects for the conventional
  //  neural network layers--one for the linear transformation (wx + b), and one
  //  that passes that result into an activation function (tanh / sigmoid / relu)
  var nn_nodes = []; 
  var synaps = [];
  for (var i=1;i<net.layers.length;i++) {
    if (i%2 == 0) {
      nn_nodes.push(net.layers[i]);
    } else {
      synaps.push(net.layers[i]);
    }
  }

  var nncw = nncanvas.width;
  var nnch = nncanvas.height;

  ///////////////////////////////////////
  // draw the neural network's architecture
  nnctx.font = "36px Arial";
  nnctx.fillStyle = "black";
  var left = (nncw - "INPUT".length*20 - pad*2) / 2 + ("INPUT".length*20 /2);
  var top = pad+30
  nnctx.fillText("INPUT",left,top);


  var totalH = pad+30+30+pad;
  var rowH = (nnch - totalH - pad) / nn_nodes.length;
  // add all the nodes
  for(var i=0;i<nn_nodes.length;i++){
    var layer = nn_nodes[i];
    var colW = (nncw - pad*2.0) / layer.out_depth;
    var ntop = totalH + rowH*i + rowH/2.0;

    nodes.push([]);
    
    for(var j=0;j<layer.out_depth;j++){
      var nleft = pad + colW*j + colW/2.0;
      // console.log(ntop, nleft);
      nodes[i].push({"x":nleft, "y":ntop, "s":false, "ins":[]});
    }
  }

  // add conns from input to first layer
  // var top = top + 30;
  for(var i=0;i<nodes[0].length;i++){
    c = nodes[0][i];
    c.ins.push({'x1':nncw/3, 'y1':top+pad/2, 'x2':c['x'], 'y2':c['y']-radi, 's':false})
    c.ins.push({'x1':nncw*2/3, 'y1':top+pad/2, 'x2':c['x'], 'y2':c['y']-radi, 's':false})
  }
  // add rest of conns
  for(var i=0;i<nodes.length-1;i++){
    for(var j=0;j<nodes[i].length;j++){
      var c = nodes[i][j];
      for(var k=0;k<nodes[i+1].length;k++){
        var c2 = nodes[i+1][k];
        c2.ins.push({'x1':c['x'], 'y1':c['y']+radi, 'x2':c2['x'], 'y2':c2['y']-radi, 's':false, 'out':c2})
      }
    }
  }

  // updateNetVis();
}


function updateNetVis() {
  // console.log("updateNetVis");
  var nncw = nncanvas.width;
  var nnch = nncanvas.height;
  nnctx.clearRect(0,0,nncw,nnch);

  ///////////////////////////////////////
  // draw the neural network's architecture
  nnctx.font = "40px Arial";
  nnctx.fillStyle = "black";
  var left = (nncw - "INPUT".length*20 - pad*2) / 2 + ("INPUT".length*20 /2);
  var top = pad+30
  nnctx.fillText("INPUT",left,top);
  wlocs = []; // we're going to recalc the weight locations

  // draw nodes
  for(var i=0;i<nodes.length;i++){
    // get weights for this layer
    var ix = 1 + (i*2); // converts nodes layer to convnetjs net "fully connected" layer
    var layer_weights = net['layers'][ix]["filters"].map(function(d) {return d.w});
    var mm = cnnutil.maxmin(cnnutil.flatten(layer_weights));

    for(var j=0;j<nodes[i].length;j++){
      var c = nodes[i][j];
      if (c.s) {
        // console.log("drawing a selection");
        nnctx.fillStyle = "#001183";
        nnctx.strokeStyle = "#001183";
      } else {
        // console.log("drawing a non-selection");
        nnctx.fillStyle = "#3672FF";
        nnctx.strokeStyle = "#3672FF";
      }
      drawCircle(c.x, c.y, radi, nnctx);

      // console.log(ix);
      var w = layer_weights[j];

      // draw each line that is an input to this node
      
      for(var k=0;k<c.ins.length;k++){
        var l = c.ins[k];
        // console.log(w);
        // console.log(mm);
        var norm = (w[k] - mm.minv) / mm.dv;
        // console.log("norm " + norm);
        // console.log("drawing a circle size " + 5 + " at: " + normx + " " + normy);

        var normx = l.x1 + (l.x2 - l.x1)*norm;
        var normy = l.y1 + (l.y2 - l.y1)*norm;

        var mm_unit = cnnutil.maxmin(layer_weights[j]);
        var unit_norm = (w[k] - mm_unit.minv) / mm_unit.dv;
        // console.log(layer_weights);
        // console.log(mm);
        // console.log(w);
        // console.log(mm_unit);
        // console.log(unit_norm);
        // console.log(norm);
        // console.log(blackWhiteScale(norm));

        wlocs.push({'x': normx, 'y': normy, 'w': w[k], 'norm':norm, 'l':l, 
                'ref':[ix,j,k], 'min':mm.minv, 'max':mm.maxv, 'd':mm.dv});

        nnctx.lineWidth = 4;
        drawLine(l.x1, l.y1, normx, normy, nnctx);
        nnctx.lineWidth = 2;
        drawLine(normx, normy, l.x2, l.y2, nnctx);
      }
    }
  }
  drawWeights();
}

function drawWeights() {
  var nncw = nncanvas.width;
  var nnch = nncanvas.height;

  for (var i=0; i<wlocs.length;i++){
    var w = wlocs[i];
    nnctx.fillStyle = blackWhiteScale(1-w.norm);
    // console.log(w.unit_norm);
    // console.log(nnctx.fillStyle);
    drawCircle(w.x, w.y, 7, nnctx);
  }
}

//this global should always be false, unless clicking and dragging a weight indicator
var clicked = false; 
function nnMouseDown(x, y, shiftPressed, ctrlPressed) {
  // console.log("nnMouseDown");
  
  train = false;
  $("#toggletrain").attr("value", "resume training");

  for (var i=0;i<wlocs.length;i++){
    if (distance(x,y,wlocs[i].x,wlocs[i].y) < 8) {
      clicked = {
        x:wlocs[i].x,
        y:wlocs[i].y,
        l:wlocs[i].l,
        w:wlocs[i].w,
        d:wlocs[i].d,
        ref:wlocs[i].ref
      };
    }
  }
}

function nnDrag(x, y, shiftPressed, ctrlPressed) {
  if (clicked !== false) {
    // console.log("nnDrag");
    // console.log("original coords: " + clicked.x + "," + clicked.y);
    // console.log("mouse coords: " + x + "," + y);
    // console.log(clicked);
    var ydiff = (y - clicked.y) / (clicked.l.y2 - clicked.l.y1);
    // console.log("diff: " + ydiff);
    // console.log("new_norm: " + ydiff * clicked.norm);
    var new_w = clicked.w + ydiff * clicked.d;
    // console.log("new_w: " + new_w);
    net['layers'][clicked.ref[0]]["filters"][clicked.ref[1]]["w"][clicked.ref[2]] = new_w;
  }
}

function nnLeave(x,y,shiftPressed,ctrlPressed) {
  // console.log("nnLeave");
  clicked = false;
}

function nnMouseUp(x, y, shiftPressed, ctrlPressed){
  // console.log("clicked on " + x + " " + y);
  // console.log("nnMouseUp");
  var clicked_a_node = false;
  if (clicked === false) {
    for(var i=0;i<nodes.length;i++){
      for(var j=0;j<nodes[i].length;j++){
        c = nodes[i][j]
        // console.log(distance(c.x, c.y, x, y));
        if (distance(c.x, c.y, x, y) < radi) {
          var clicked_circle = nodes[i][j];
          selected_node = [2+2*i, j]
          clicked_a_node=true;
          // console.log(clicked_circle);
          break;
        }
      }
      if (clicked_a_node) break;
    }
  }

  if (clicked_a_node) {
    var top_layer = i;

    for(var i=0;i<nodes.length;i++){
      for(var j=0;j<nodes[i].length;j++){
        if (i < top_layer) {
          nodes[i][j].s = true;
        } else if (i >= top_layer) {
          nodes[i][j].s = false;
        }
      }
      // for(var k=0;k<nodes[i][j].ins.length;k++){
      //   nodes[i][j].ins[k].s = nodes[i][j].s;
      // }
    }
    clicked_circle.s = true; //I'm sure there's a more elegant way to do this but w/e
  }
  clicked = false;
}


$(function() {
    // note, globals
    viscanvas = document.getElementById('viscanvas');
    visctx = viscanvas.getContext('2d');
    visWIDTH = viscanvas.width;
    visHEIGHT = viscanvas.height;

    nncanvas =  document.getElementById("nncanvas");
    nnctx = nncanvas.getContext("2d");
    nncanvas.addEventListener('mousedown', eventClickGen(nnMouseDown, nncanvas), false);
    nncanvas.addEventListener('mouseup', eventClickGen(nnMouseUp, nncanvas), false);
    nncanvas.addEventListener('mousemove', eventClickGen(nnDrag, nncanvas), false);
    nncanvas.addEventListener('mouseleave', eventClickGen(nnLeave, nncanvas), false);

    nodecanvas =  document.getElementById("nodecanvas");
    nodectx = nodecanvas.getContext("2d");

    circle_data();
    $("#layerdef").val(t);
    reload();
    NPGinit();
    resetNetVis();
});

