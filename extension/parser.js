var contents = " " ;



var allTextLines = " ";
var lyrics = [];
var tim = [] ;
var line = " ";


// parsing the Lyrics 
function processData(allText) { // This will only divide with respect to new lines 
    
    allTextLines = allText.split(/\r\n|\n/);
    lyrics = []
    tim = []
    next();
} 

function next(){
    for (i=0;i<allTextLines.length;i++){
        if (allTextLines[i].search(/^(\[)(\d*)(:)(.*)(\])(.*)/i)>=0 ){// any line without the prescribed format wont enter this loop 
            line = allTextLines[i].match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
            tim[i] = (parseInt(line[2])*60)+ parseInt(line[4]); // will give seconds 
            lyrics[i]= line[6] ;//will give lyrics 

        }
    }  
    for (i=0; i<lyrics.length; i++){
        if (lyrics[i] == " " || lyrics[i] == '' || lyrics[i].substring(1,3) == "作曲" || lyrics[i].substring(1,3) == "作词"){
            lyrics[i] = "♪♪"
        }
    }
    console.log(lyrics)
    console.log(tim)
} 



// from https://stackoverflow.com/a/11690384