
module.exports.sketchComponentTemplate = (
    p5WrapperRelativePath,
    sketchClosureName,
    sketchClosureFileRelativePath,
    sketchWrapperName,
    sketchComponentName,
    sketchWidth,
    sketchHeight
) => {

    const sketchComponentContent = `
import React from 'react';

import { generate } from 'shortid';
import p5WrapperGenerator from "${p5WrapperRelativePath}";

import ${sketchClosureName} from "${sketchClosureFileRelativePath}";

const ${sketchWrapperName} = p5WrapperGenerator(generate(), ${sketchWidth}, ${sketchHeight});

const ${sketchComponentName} = (props) => {

    return (
        <${sketchWrapperName} 
            dispatch={props.dispatch}
            sketch={${sketchClosureName}}
            state={{
                sketchName: props.sketchName,
                sketchWidth: props.sketchWidth,
                sketchHeight: props.sketchHeight,
                showFramerate: props.showFramerate
            }}
        />
    )

};

export default ${sketchComponentName};
`;

    return sketchComponentContent;

};
