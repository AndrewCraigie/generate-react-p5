
module.exports.sketchPageTemplate = (
    sketchComponentName,
    sketchComponentRelativePath,
    sketchPageName,
    sketchName,
    sketchWidthForTemplate,
    sketchHeightForTemplate
) => {

    return `
import React, { useState } from 'react';
import ${sketchComponentName} from '${sketchComponentRelativePath}'; 

const ${sketchPageName} = () => {

    const defaultDebugObject = {
        sketchFramerate: '',
        sketchDisplayDensity: 0,
        sketchPixelDensity: 0
    };
    
    const [debugObject, setDebugObject] = useState(defaultDebugObject)
    const [showFramerate, setShowFramerate] = useState(true);
    const [showDebugInfo, setShowDebugInfo] = useState(true);
    
    const sketchName = '${sketchName}';
    const sketchWidth = ${sketchWidthForTemplate};
    const sketchHeight = ${sketchHeightForTemplate};
    
    const handleDispatch = (dispatchMessage) => {

        switch (dispatchMessage.type) {

            case 'OUTPUT_FRAMERATE':
                const {sketchFramerate} = dispatchMessage.payload;
                setDebugObject(prevState => ({
                    ...prevState,
                    sketchFramerate: Number(sketchFramerate).toFixed(2)
                }));
                break;
            case 'OUTPUT_DISPLAY_SKETCH_DENSITY':
                const {sketchDisplayDensity, sketchPixelDensity} = dispatchMessage.payload;
                setDebugObject(prevState => ({
                    ...prevState,
                    sketchDisplayDensity,
                    sketchPixelDensity
                }))
                break;

        }

    };
    
    return (
        <div>
            <h2>{sketchName}</h2>
            <${sketchComponentName}
                dispatch={handleDispatch}
                sketchName={sketchName}
                sketchWidth={sketchWidth}
                sketchHeight={sketchHeight}
                showFramerate={showFramerate}
            />

            <div>

                {showFramerate &&
                    <p>Frame Rate: {debugObject.sketchFramerate}</p>
                }

                {showDebugInfo && (
                    <>
                        <p>Display Density: {debugObject.sketchDisplayDensity}</p>
                        <p>Pixel Density: {debugObject.sketchPixelDensity}</p>
                    </>
                )}

            </div>

        </div>
    )
    

}; 

export default ${sketchPageName};
`

};

