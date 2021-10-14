// Author: Me
// Title: Matrices

#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// background Colour
const vec3 backCol = vec3(0.000,0.028,0.045);

// Static controls
const bool showStatic = true;
const float staticStrength = -0.380;

// text colour
const bool varyTextCol = true;
const vec3 lowColRange = vec3(0.502,0.690,0.577);
const vec3 highColRange = vec3(0.108,0.990,0.095);



const float drawCharCutttoff = 0.164;
const float charNoiseCuttoff = 0.580;
const int charVertBuffer = 0;
// drawCharCutttoff - determines whether to draw the char or not
// charNoiseCuttoff - describes the lower bound for a pixel within a character to show
// charVertBuffer   - describes the number of pixels inbetween "characters"


// "text" controls
const float aspectRatio = 1.000;
const float numColumns = 50.0;



const float textHbuffer = 0.25;
const vec2 charDimensions = vec2(2,36);
const float pixelAR = 1.000;
const float updatesPerSec = 20.0;
// textHbuffer      - [0,1], determine the % of each column or row that is a "buffer"
// charDimensions   - describes the size of a character. Only vector x, y values
// pixelARdescribes - the aspect ratio of each pixel
// updatesPerSec    - (roughly) controlls updates per sec

const float minColSpeed = 1.0;
const float maxColSpeed = 10.0;
// minColUpSpeed    - describes the minimum rate that a column updates
// minColUpSpeed    - describes the maximum rate that a column updates


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(0.370,0.560)))*
        43758.961);
}

float genStaticTV(vec2 pos, float seed){
    pos += vec2(seed,cos(u_time));
    float staticValue = random(pos);
    staticValue = clamp(staticValue, 0.0, 1.0);
    return staticValue;
}
// generates TimeVariable static

vec3 StaticOverlay(vec2 st){
    float staticlayer = genStaticTV(st, sin(u_time * 1.61))/1.000 + 0.0;
    vec3 staticColour = vec3(1,1, 1) *staticlayer;
    return staticColour;
}


float getColumn(float value, float columns){
    return ((value * columns) - mod(value * columns, 1.0));
}

float intColx(float normVecX){
    float vecXcolumn = getColumn(normVecX, numColumns);
    float distToBound = normVecX - vecXcolumn/(numColumns);
    distToBound = distToBound*(numColumns);
    return distToBound;}
// returns the x val [0,1] of the point inside its column
// INTernal COLumn X-position

float CalcPixelDimensions(){
    float columnWidth = 1.0/numColumns;
    float noBufferWidth = columnWidth - columnWidth * textHbuffer * 2.0;
    float pixelLength = noBufferWidth/charDimensions.x;
    return pixelLength * aspectRatio * pixelAR;}
// calculates the width of each pixel from data on columns. Returns value between 0 and 1

float CalcHPixel(float normY){
    float pixelLength = CalcPixelDimensions();
    float pHWorldUnits = abs(normY -1.0) - mod(abs(normY -1.0),CalcPixelDimensions());
    return pHWorldUnits;
}
// calculates how many "pixels" the position is from the top of the canvas

bool NotOnBuffer(int column, int row){
    if(mod(float(row), charDimensions.y + float(charVertBuffer)) > float(charVertBuffer - 1)){
        	return true;}
    return false;
}
// returns true if the point should be rendered as a "character"










void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;   

    vec3 calcCol = backCol;
    //vec3 calcCol = columnCol*vec3(0.044,0.900,0.000);
    
    
    
    float internalXpos = intColx(st.x);
    if(abs(internalXpos-0.5) > 0.5 - textHbuffer){ calcCol = backCol;}
    // ^^Colour Buffer backcol
    else{
        float noBufferPos = sign(internalXpos - 0.5)* abs(internalXpos -0.5)/ (0.5 -textHbuffer)*0.5 + 0.5;
        // [0,1], gives x location within column, within bounds of buffer
        
        int intColumn = int(getColumn(noBufferPos, charDimensions.x));
        // this gives the pixel's horizontal index within the character
        int intRow = int(CalcHPixel(st.y)/CalcPixelDimensions());
        // this gives the pixel's vertical index
        
        float columnRand = clamp(random(vec2(getColumn(st.x, numColumns)* numColumns, 8.9)), 0.0, 1.0);
        // a unique random number shared by a whole column
        

        int timeFunct = -int(u_time * updatesPerSec  * (columnRand));
        // using fallspeed calculates how the pixel has been temporially displaced
        
        
        
        if (NotOnBuffer(intColumn, intRow + timeFunct)){
            // determines whether this "pixel" is inbetween chars
            
            
            
            if (random(vec2(float(intColumn + timeFunct * int(charDimensions) + int(columnRand *10.0)) , columnRand*float(intRow + timeFunct))) > charNoiseCuttoff){
                float columnUpdateSpeed = float(columnRand * (maxColSpeed - minColSpeed) + minColSpeed);
                
                vec2 commonCharVec = vec2(15.240 * columnRand , float(intRow) + float(timeFunct)*columnUpdateSpeed - mod(float(intRow) + float(timeFunct)* columnUpdateSpeed, float(charVertBuffer) + charDimensions.y));
                // this vector is shared by all "pixels" in a "character"
                
                if (random(commonCharVec) > drawCharCutttoff){
                    // determines whether to draw the character
                
                	float tone = clamp(random(vec2(commonCharVec.y + float(timeFunct),commonCharVec.y )),0.0, 1.0);
                
                	if(varyTextCol){calcCol = (highColRange - lowColRange) * tone + lowColRange;}
                    else{calcCol = highColRange;}
                    // either lerps high and low colour or returns only high colour
                }
                
            }
            
		}
    }
    
    
    
    
    
    // Generate static Overlay, removes it if showStatic is false
    vec3 staticCol = StaticOverlay(st);
    staticCol *= staticStrength;
    if (!showStatic){staticCol *= 0.0;}
	
    // Combine three layers
    vec3 finalCol = calcCol + staticCol + backCol;
    gl_FragColor = vec4(finalCol,1.0);
}