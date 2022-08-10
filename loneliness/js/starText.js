// StarText Class
class StarText{
    constructor(_companionStar,_textFont, _textSize, _textString, _z, _category, _country= 'All-Lonely', _pos= new THREE.Vector3(0,0,-110)){
        this.textColor = new THREE.Color(0xffd6d6);
        this.textOpacity = 0.5;
        this.textShapes = null;
        this.textGeometry = null;
        this.pos = new THREE.Vector3(0,0,-110);
        
        this.companionStar = _companionStar;
        this.textFont = _textFont;
        this.textSize = _textSize;
        this.textString = _textString;
        this.pos.z = _z;
        this.category = _category;
        this.country = _country;
        this.pos = _pos;


        this.texMat = new THREE.MeshBasicMaterial( {
            color: this.textColor,
            transparent: true,
            blending:THREE.AdditiveBlending,
            depthTest: false,
            depthWrite : false,
            side: THREE.DoubleSide,
            opacity:1.0
        } );
        this.fadingStage = 0;   // -1 fading out, 0 do not change, 1 fading in
        this.starText = null;

        this.initialization();
    }

    static get fadingFactor(){
        return 0.1;
    }

    static get minOpacity(){
        return 0.1;
    }
    resetCompanionStar(_companionStar){
        this.companionStar = _companionStar;
    }

    initialization(){
        this.initTextGeometry();
    }
    initTextGeometry(){
        this.textShapes = this.textFont.generateShapes( this.textString, this.textSize);
        this.textGeometry = new THREE.ShapeBufferGeometry( this.textShapes );
        this.textGeometry.computeBoundingBox();
        this.textGeometry.center();
        this.starText = new THREE.Mesh( this.textGeometry,this.texMat );
        this.starText.position.x = this.pos.x;
        this.starText.position.y = this.pos.y;
        this.starText.position.z = this.pos.z;
    }

    update(){
        //this.starText.position.add(this.companionStar.vel);
        this.starText.position.x = this.companionStar.pos.x;
        this.starText.position.y = this.companionStar.pos.y;
        this.opacityChange();
    }

	fadeOut(){
        this.fadingStage = -1;
    }

    fadeIn(){
        this.fadingStage = 1;
    }

    setOpacity(_opacity){
        this.texMat.opacity = _opacity;
        this.texMat.needsUpdate = true;
    }

    opacityChange(){
        switch(this.fadingStage){
            case -1:
                if (this.texMat.opacity > StarText.minOpacity){
                    this.texMat.opacity = THREE.Math.lerp(this.texMat.opacity,StarText.minOpacity, StarText.fadingFactor);
                    this.texMat.needsUpdate = true;}
                else{
                    this.fadingStage = 0;
                }
                break;
            case 1:
                if (this.texMat.opacity < 1){
                    this.texMat.opacity = THREE.Math.lerp(this.texMat.opacity,1, StarText.fadingFactor);
                    this.texMat.needsUpdate = true;}
                else{
                    this.fadingStage = 0;
                }
                break;
            default:
                break;      
        }
    }
}