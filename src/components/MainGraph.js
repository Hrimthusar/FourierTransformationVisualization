import React, { Component } from "react";
import * as PIXI from "pixi.js";

class MainGraph extends Component {
  constructor(props) {
    super(props);

    this.pixi_cnt = null;
    this.app = new PIXI.Application({
      transparent: false,
      antialias: true,
    });
    this.graphics = new PIXI.Graphics();
    
    this.canvasMargin = 100;
    this.canvasPadding = 20;
    this.topSectionHeight = 50;
    this.botSectionHeight = 50;
    this.sectionGap = 20;
    this.coordinateSystemExtra = 30;

    this.f = 0;
    this.data = this.props.songData;
    this.length = this.props.songLength;
    this.oscilationNumber = 0;
    this.oscilationProgress = 0;

    this.transformedData = [];

    this.renderText = [];

  }

  // TODO 10000 - parameter
  reduceDataAverage(data, num=10000) {
    let n = data.length;
    if(n<num)
      return data;

    let step = Math.ceil(n/num);
    let ret = [];

    let curr = 0;
    for(let i=0; i<n; i++){
      curr+=data[i];
      if(i%step === 0){
        ret.push(curr/step);
        curr=0;
      }
    }
    return ret;
  }

  componentDidUpdate() {
    if(this.props.start === undefined || this.props.end === undefined)
      return;

    if(this.props.isPlaying !== true)
      return;

    this.data = this.props.songData.slice(this.props.start,this.props.end);
    this.data = this.reduceDataAverage(this.data);
    this.length = this.props.songLength;

    let min = Math.min.apply(Math,this.data);
    this.data = this.data.map(point => point-min);

    let max = Math.max.apply(Math,this.data);
    this.data = this.data.map(point => point/max);

    this.app.ticker.add(delta => this.gameLoop(delta));
  }

  setup = () => {
    this.app.stage.position.x = this.canvasPadding;
    this.app.stage.scale.x = (this.app.renderer.width-2*this.canvasPadding)/this.app.renderer.width;
    this.app.stage.position.y = this.app.renderer.height / this.app.renderer.resolution;
    this.app.stage.scale.y = this.app.stage.scale.y = -(this.app.renderer.height-2*this.canvasPadding)/this.app.renderer.height;
  };

  // e^ix = cosx + i*sinx
  eulerFormula = x => {
    return [Math.cos(x), Math.sin(x)];
  }

  convertToCircle = ({data, f = .01, radius = 100, center={x:0, y:0}}) => {
    let t=0;

    // TODO WITH MAP
    let transformed = [];

    for (const point of data) {
      let newPoint = this.eulerFormula(-Math.PI*2*t);

      newPoint[0] = newPoint[0] * radius * point + center.x;
      newPoint[1] = newPoint[1] * radius * point + center.y;

      transformed.push(newPoint);
      t+=f;
    }

    if(t>this.oscilationNumber){
      this.oscilationNumber++;
    }
    this.oscilationProgress = this.oscilationNumber-t;

    return transformed;
  }

  drawCoordinateSystem = ({center, top, left, width, height, steps=2, color=0x9999ff, x_min=0, x_max=0, showTicks=false, ticksTop=false, showText=false, scaledTicks=false, formula=(v=>v)}) => {
    let tickHeight=30;

    this.graphics.lineStyle(1, color);

    // Draw X axis
    this.graphics.moveTo(left - this.coordinateSystemExtra, center.y);
    this.graphics.lineTo(left + width + this.coordinateSystemExtra, center.y);
    this.graphics.endFill();

    // Draw Y axis
    this.graphics.moveTo(center.x, top + this.coordinateSystemExtra);
    this.graphics.lineTo(center.x, top - height - this.coordinateSystemExtra);
    this.graphics.endFill();

    // Draw Ticks
    if(showTicks){
      let gap = {length:width/steps, value:(x_max-x_min)/steps};
      if(scaledTicks) {
        gap.length =  (gap.length*(steps) + gap.length*this.oscilationProgress)/(steps+1);
      }
      for(let i=0; i<=steps; i++){
        this.graphics.moveTo(left + i*gap.length, center.y - tickHeight/2);
        this.graphics.lineTo(left + i*gap.length, center.y + tickHeight/2);
        this.graphics.endFill();

        if(showText){
          let val = (x_min + i*gap.value);
          var valText = new PIXI.Text((steps<=10 || i%Math.ceil(steps/10)===0)?formula(val).toFixed(2):``, {
            fill: color,
            fontFamily: `Courier New`,
            fontWeight: `lighter`,
            fontSize:  tickHeight/2,
          });

          // Position the text
          valText.x = left + i*gap.length - (i===steps ? tickHeight : 0);
          if(ticksTop)
            valText.y =  top + this.coordinateSystemExtra;
          else
            valText.y =  center.y - tickHeight/2;

          valText.scale.y = -1;

          this.renderText.push(valText);
        }
      }
    }
  }

  drawSignalSection = ({data, center}) => {
    this.drawCoordinateSystem({
      center: {x:0, y:center.y},
      top:this.app.renderer.height, left:0, width: this.app.renderer.width, height: this.topSectionHeight,
      showTicks: true,
      showText: true,
      x_max: this.length,
      steps: 10
    });
    this.drawSignal({data, center});
  }

  drawSignal = ({data, center, color=0xffff00}) => {
    this.graphics.lineStyle(2, color);

    this.graphics.moveTo(0+center.x, data[0]+center.y);

    let step = this.app.renderer.width / this.app.renderer.resolution / data.length;

    // TODO CALCULATE MAX AND SCALE WITH SPACE NOT 20
    data.forEach(function(point, i) {
      this.graphics.lineTo(i*step + center.x, point*20 + center.y );
    }.bind(this));
  }

  drawTransformedSignalSection = ({data, center, color=0xffffff}) => {
    this.drawCoordinateSystem({
      center: {x:0, y:center.y},
      top:this.topSectionHeight, left:0, width: this.app.renderer.width, height: this.topSectionHeight,
      showTicks: true,
      steps: this.oscilationNumber,
      scaledTicks: true,
      x_max: this.oscilationNumber/(this.length*1000),
      showText: true,
      ticksTop: true,
      formula: (v => (this.length*1000)/v)
    });
    this.drawTransformedSignal({data, center, color});
  }

  drawTransformedSignal = ({data, center, color=0xffffff}) => {
    if(data.length < 2)
      return;

    this.graphics.lineStyle(2, color);

    this.graphics.moveTo(0+center.x, data[0]+center.y);

    let step = this.app.renderer.width / this.app.renderer.resolution / data.length;

    data.forEach(function(point, i) {
      this.graphics.lineTo(i*step + center.x, point + center.y );
    }.bind(this));
  }

  drawIntegral(x, y, color = 0xff5555, width = 3, radius = 5){
    this.graphics.lineStyle(radius, color);
    this.graphics.drawCircle(x, y, width);
  }

  drawTransformation = ({data, center, radius}) => {
    data = this.convertToCircle({data, 
      center,
      f:this.f,
      radius
    });

    let integral = {x:0, y:0};

    this.graphics.moveTo(data[0][0], data[0][1]);

    data.forEach(function(point, i) {
      this.graphics.lineStyle(2, 0xffffff, i/data.length);
      this.graphics.lineTo(point[0], point[1] );

      integral.x += point[0];
      integral.y += point[1];
    }.bind(this));

    integral.x /= data.length;
    integral.y /= data.length;
    this.drawIntegral(integral.x, integral.y);

    let scaleFix = this.botSectionHeight/radius;
    this.transformedData.push((integral.x - center.x)*scaleFix);

    this.graphics.endFill();
  }

  drawTransformationSection = ({data}) => {
    let center = {x:this.app.renderer.width/2,y:this.app.renderer.height/2};
    let radius = Math.min(this.canvasWidth/2,
      this.canvasHeight/2 - this.topSectionHeight - this.botSectionHeight)
       - this.sectionGap;

    let top = center.y + radius;
    let left = center.x - radius;
    
    this.drawCoordinateSystem({
      center, top, left, width: 2*radius, height: 2*radius
    });

    this.drawTransformation({data, center, radius});
        
  }

  
  gameLoop(delta){
    if(!this.props.isPlaying)
      return;

    this.renderText = [];
    this.app.stage.removeChildren();

    let data = this.data;

    this.graphics.clear();

    this.drawSignalSection({
      data, 
      center:{x:0,
        y:this.app.renderer.height-
         this.topSectionHeight
      }
    });
    this.drawTransformationSection({data});
    this.drawTransformedSignalSection({
      data: this.transformedData, 
      center:{x:0,y:this.botSectionHeight/2},
      color: 0xff5555 
    });

    this.app.stage.addChild(this.graphics);
    this.renderText.forEach(
      t => this.app.stage.addChild(t)
    );

    this.f+=this.props.speed*delta;
  }

  updatePixiCnt = element => {
    this.pixi_cnt = element;
    if (this.pixi_cnt && this.pixi_cnt.children.length <= 0) {
      this.canvasWidth = element.offsetWidth - this.canvasMargin;
      this.canvasHeight=element.offsetHeight - this.canvasMargin;
      this.app.renderer.resize(this.canvasWidth, this.canvasHeight);
      this.pixi_cnt.appendChild(this.app.view);
      this.setup();
    }
  };

  render() {
    return <div id="canvas" ref={this.updatePixiCnt} />;
  }
}
export default MainGraph;
