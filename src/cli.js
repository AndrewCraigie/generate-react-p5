#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const yargs = require('yargs');
const {hideBin} = require('yargs/helpers')

const sketchTemplate = require('./templates/sketchClosureTemplate');
const sketchComponentTemplate = require('./templates/sketchComponentTemplate');
const sketchPageTemplate = require('./templates/sketchPageTemplate');


const getMatchedRootPath = (gPath, sPath) => {

    const gPathParts = gPath.split('\\');
    const sPathParts = sPath.split('\\');

    for (let i = 0; i < sPathParts.length; i++) {

        const gPart = gPathParts[i];
        const sPart = sPathParts[i];

        if (!(gPart === sPart)) {

            const matchIndex = i;
            const matchPath = [];
            const gPathTail = [];

            for (let j = 0; j < matchIndex; j++) {
                matchPath.push(gPathParts[j]);
            }

            for (let k = matchIndex; k < gPathParts.length; k++) {
                gPathTail.push(gPathParts[k]);
            }

            return {
                matchedPath: matchPath.join('\\'),
                matchIndex: matchIndex - 1,
                generatorPathTail: gPathTail.join('\\'),
                relativeUps: sPathParts.length - matchIndex - 1
            };
        }

    }

    return {matchedPath: sPath, matchIndex: 0, generatorPathTail: gPathParts.join('\\'), relativeUps: 0};

}

const fileGeneratorFile = function(dir, fileToFind) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(fileGeneratorFile(file, fileToFind));
        } else {
            const file_type = file.split(".").pop();
            const file_name = file.split(/(\\|\/)/g).pop();
            if (file_name === fileToFind  &&  file_type === "js") results.push(file);
        }
    });
    return results;
}

const generateReactp5 = (argv) => {

    const sketchName = argv.sketchName;
    const sketchWidth = argv.width;
    const sketchHeight = argv.height;

    console.log(`Generating React p5 sketch with options:
      Name: ${sketchName}
      Destination: ${argv.destination}
      Width: ${sketchWidth}
      Height: ${sketchHeight}`);

    const templatesDirectory = path.resolve(__dirname, 'templates');

    // Check if templates directory can be found
    if (!fs.existsSync(templatesDirectory)) {
        console.log(`Cannot find templates directory at: ${templatesDirectory}`);
        process.exit(1);
    }

    const currentWorkingDirectory = process.cwd();
    const destinationDirectory = path.resolve(currentWorkingDirectory, argv.destination);

    console.log(`generate-react-p5 directory: ${currentWorkingDirectory}`)
    console.log(`Destination directory: ${destinationDirectory}`);

    // Check if destination directory exists
    if (!fs.existsSync(destinationDirectory)) {
        // Exit on error
        console.log(`Directory: ${destinationDirectory} does not exist`);
        process.exit(9);
    }

    // File names
    const sketchNameWithLowerCaseFirstLetter = sketchName.charAt(0).toLowerCase() + sketchName.slice(1);
    const sketchNameWithUpperCaseFirstLetter = sketchName.charAt(0).toUpperCase() + sketchName.slice(1);

    const sketchClosureName = `${sketchNameWithLowerCaseFirstLetter}Sketch`;
    const sketchComponentName = `${sketchNameWithUpperCaseFirstLetter}Component`;
    const sketchPageName = `${sketchNameWithUpperCaseFirstLetter}Page`;

    const sketchClosureFileName = `${sketchClosureName}.js`;
    const sketchComponentFileName = `${sketchComponentName}.js`;
    const sketchPageFileName = `${sketchPageName}.js`;

    const sketchWrapperName = `${sketchNameWithUpperCaseFirstLetter}P5Wrapper`;

    const sketchDirectoryName = `${sketchPageName}`;
    const sketchDirectoryPath = path.resolve(destinationDirectory, sketchDirectoryName);

    // Get file path to P5WrapperGenerator.js
    console.log(`Searching for P5WrapperGenerator.js in ${currentWorkingDirectory}`);
    const results = fileGeneratorFile(currentWorkingDirectory, 'P5WrapperGenerator.js');
    const generatorFilePath = path.resolve(results[0]);
    console.log(`P5WrapperGenerator found at: ${generatorFilePath}`);

    console.log(`Creating React p5 sketch boilerplate...\n`);

    // Create Sketch directory
    if (!fs.existsSync(sketchDirectoryPath)){
       fs.mkdirSync(sketchDirectoryPath);
    }

    // Check directory now exists
    if (!fs.existsSync(sketchDirectoryPath)) {
       console.log(`Error creating destination directory: ${sketchDirectoryPath}`)
    }


    // Output Sketch Closure File
    const sketchScriptContent = sketchTemplate.sketchTemplate(sketchClosureName, sketchWidth, sketchHeight);

    const sketchClosureFilePath = path.resolve(sketchDirectoryPath, sketchClosureFileName);
    fs.writeFileSync(sketchClosureFilePath, sketchScriptContent);


    // Output Component file
    const matchedRootPathObj = getMatchedRootPath(generatorFilePath, sketchClosureFilePath);

    const relativeUps = '../'.repeat(matchedRootPathObj.relativeUps);
    const generatorRelativePath = relativeUps + matchedRootPathObj.generatorPathTail.replace('\\', '/');
    const sketchClosureFileRelativePath = `./${sketchClosureFileName}`;

    const sketchComponentContent = sketchComponentTemplate.sketchComponentTemplate(
        generatorRelativePath,
        sketchClosureName,
        sketchClosureFileRelativePath,
        sketchWrapperName,
        sketchComponentName,
        sketchWidth,
        sketchHeight
    )

    const sketchComponentFilePath = path.resolve(sketchDirectoryPath, sketchComponentFileName);
    fs.writeFileSync(sketchComponentFilePath, sketchComponentContent);


    // Output Sketch Page
    const sketchComponentRelativePath = `./${sketchComponentFileName}`;
    const sketchPageContent = sketchPageTemplate.sketchPageTemplate(
        sketchComponentName,
        sketchComponentRelativePath,
        sketchPageName,
        sketchNameWithUpperCaseFirstLetter,
        sketchWidth,
        sketchHeight
    );

    const sketchPageFilePath = path.resolve(sketchDirectoryPath, sketchPageFileName)
    fs.writeFileSync(sketchPageFilePath, sketchPageContent);

    console.log(`  ... p5 sketch created`);
    process.exit(0);


}


const argv = yargs(hideBin(process.argv))
    .command(
        'sketch',
        'Generates a React p5 sketch',
        {
            sketchName: {
                description: 'the name for the sketch',
                alias: 'n',
                type: 'string',
                default: 'Reactp5Sketch01'
            },
            destination: {
                description: 'the path to the directory to create the sketch in',
                alias: 'd',
                type: 'string',
                default: 'src'
            },
            width: {
                description: 'width for the sketch to be generated',
                alias: 'sw',
                type: 'number',
                default: '800'
            },
            height: {
                description: 'height for the sketch to be generated',
                alias: 'sh',
                type: 'number',
                default: '600'
            }
        },
        function (argv) {
            generateReactp5(argv)
        }
    )
    // .option('sketchName', {
    //     alias: 'n',
    //     description: 'Sketch name',
    //     type: 'string'
    // })
    .help()
    .alias('help', 'h').argv;



// console.log(argv);
