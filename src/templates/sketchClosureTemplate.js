
module.exports.sketchTemplate = (sketchClosureName, sketchWidthForTemplate, sketchHeightForTemplate) => {

    return `
const ${sketchClosureName} = (s) => {

    s.state = {}
    s.dispatch = () => { }
    
    s.setup = () => {
        s.createCanvas(${sketchWidthForTemplate}, ${sketchHeightForTemplate})
    
        s.dispatch({
            type: 'OUTPUT_DISPLAY_SKETCH_DENSITY',
            payload: {
                sketchDisplayDensity: s.displayDensity(),
                sketchPixelDensity: s.pixelDensity()
            }
        })
    
    }
    
    s.draw = () => {
    
        s.background(127);
    
        s.textSize(48)
        s.fill(255)
        s.text(s.state.sketchName, s.state.sketchWidth / 2, s.state.sketchHeight / 2);
    
        // Debugging
        if (s.state.showFramerate) {
            s.dispatch({
                type: 'OUTPUT_FRAMERATE',
                payload: {
                    sketchFramerate: s.frameRate()
                },
            });
        }
    
    }

};

export default ${sketchClosureName};
`

}
