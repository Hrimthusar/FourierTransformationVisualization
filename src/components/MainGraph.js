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
    this.coordinateSystemExtra = 10;

    this.f = 0;
    this.data = this.props.songData
    this.transformedData = []
  }

  // componentDidMount() {
  //   const height = this.divElement.clientHeight;
  //       this.setState({ height });
  // }

  componentDidUpdate() {
    // TODO RANDOM OR PICKED SECONDS
    this.data = this.props.songData.slice(5000,5100);
    console.log(this.data)

    let min = Math.min.apply(Math,this.data)
    this.data = this.data.map(point => point-min)

    let max = Math.max.apply(Math,this.data)
    this.data = this.data.map(point => point/max)

    console.log("######")
    console.log(this.data)


    this.app.ticker.add(delta => this.gameLoop(delta));
  }

  setup = () => {
    // Changes coordinate system so y grows from bottom to top
    // And adds padding
    this.app.stage.position.x = this.canvasPadding;
    this.app.stage.scale.x = (this.app.renderer.width-2*this.canvasPadding)/this.app.renderer.width;
    this.app.stage.position.y = this.app.renderer.height / this.app.renderer.resolution;
    this.app.stage.scale.y = this.app.stage.scale.y = -(this.app.renderer.height-2*this.canvasPadding)/this.app.renderer.height;
  };

  // e^ix = cosx + i*sinx
  eulerFormula = x => {
    return [Math.cos(x), Math.sin(x)]
  }

  convertToCircle = ({data, f = .01, radius = 100, center={x:0, y:0}}) => {
    let t=0;

    // TODO WITH MAP
    let transformed = []

    for (const point of data) {
      let newPoint = this.eulerFormula(-Math.PI*2*t);

      newPoint[0] = newPoint[0] * radius * point + center.x;
      newPoint[1] = newPoint[1] * radius * point + center.y;

      transformed.push(newPoint)
      t+=f
    }

    // console.log(transformed)
    return transformed
  }

  drawCoordinateSystem = ({center, top, left, width, height, step, grid= true, color=0x9999ff}) => {
    this.graphics.lineStyle(1, color);

    this.graphics.moveTo(left - this.coordinateSystemExtra, center.y);
    this.graphics.lineTo(left + width + this.coordinateSystemExtra, center.y);
    this.graphics.endFill();

    this.graphics.moveTo(center.x, top + this.coordinateSystemExtra);
    this.graphics.lineTo(center.x, top - height - this.coordinateSystemExtra);
    this.graphics.endFill();
  }

  drawSignalSection = ({data, center}) => {
    this.drawCoordinateSystem({
        center: {x:0, y:center.y},
        top:this.app.renderer.height, left:0, width: this.app.renderer.width, height: this.topSectionHeight
      })
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
      top:this.topSectionHeight, left:0, width: this.app.renderer.width, height: this.topSectionHeight
    })
    this.drawTransformedSignal({data, center, color});
  }

  drawTransformedSignal = ({data, center, color=0xffffff}) => {
    if(data.length < 2)
      return

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

    console.log(this.botSectionHeight/radius)
    let scaleFix = this.botSectionHeight/radius;
    this.transformedData.push((integral.x - center.x)*scaleFix)

    this.graphics.endFill();
  }

  drawTransformationSection = ({data}) => {
    let center = {x:this.app.renderer.width/2,y:this.app.renderer.height/2}
    let radius = Math.min(this.canvasWidth/2,
       this.canvasHeight/2 - this.topSectionHeight - this.botSectionHeight)
       - this.sectionGap;

    let top = center.y + radius;
    let left = center.x - radius;
    
    this.drawCoordinateSystem({
      center, top, left, width: 2*radius, height: 2*radius
    })

    this.drawTransformation({data, center, radius})
        
  }

  
  gameLoop(delta){
    if(!this.props.isPlaying)
      return;

    let data = this.data;

    this.graphics.clear();

    this.drawSignalSection({
      data, 
      center:{x:0,
         y:this.app.renderer.height-
         this.topSectionHeight
      }
    })
    this.drawTransformationSection({data});
    this.drawTransformedSignalSection({
      data: this.transformedData, 
      center:{x:0,y:this.botSectionHeight/2},
      color: 0xff5555 
    })

    this.app.stage.addChild(this.graphics);

    this.f+=0.0001*delta
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
    console.log("CRTAM")
    return <div id="canvas" ref={this.updatePixiCnt} />;
  }
}
export default MainGraph;
