export class Region {

    constructor(name,xMin,xMax,yMin,yMax,padding){
        this.name=name;
        this.xMin=xMin;
        this.xMax=xMax;
        this.yMin=yMin;
        this.yMax=yMax;
        this.padding = padding;
    }

    contains(x,y){
        if(x > this.xMax + this.padding){
            return false
        }
        if(x < this.xMin - this.padding){
            return false
        }
        if(y > this.yMax + this.padding){
            return false
        }
        if(y < this.yMin - this.padding){
            return false
        }
        return true;
    }

    
}
