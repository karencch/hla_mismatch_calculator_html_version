// GENERAL NOTES =================================================
// For testing purposes, sample user input is in the format:
//   "04:01G3, 15:05, 04:PAYK:01, 15:05"
//    "01:01, x, 01:01, X"

// Generally, "p" will indicate patient, and "d" will indicate donor
// ===============================================================

// GENERAL OUTLINE OF PROGRAM
// Get user input of allele strings
// Edit the strings to make them suitable for analzying. That is, need to process the strings for the following situations:
    // (1) Special case of x or X 
    // (2) Any fields that are NOT a number (e.g., PAYK or P22)
    // (3) Any 2nd colons need to be deleted along with the letters/numbers after the 2nd colon
// Once processed, should have 4 fully numeric allele codes (i.e., in format ##:##), so 2 from patient and 2 from donor
// Need to split these 4 codes into 8 fields (so that we can compare the indivudal fields easily)
// Compare patient versus donor matches by testing for 3 scenarios
    // (1) If there is an allele code that could not be analyzed (for example, PAYK)
    // (2) If the two first-fields match
    // (3) If the two first fields do NOT match
// Count how many mismatches. This will be the output of this program.

//===============================================

const txt1 = document.getElementById("forminput");
// User provides this string in the format of "patient allele 1, patient allele 2, donor allele 1, donor allele 2"

const btn1 = document.getElementById("button1");
const p11 = document.getElementById("p11");
const p12 = document.getElementById("p12");
const d11 = document.getElementById("d11");
const d12 = document.getElementById("d12");
const antig = document.getElementById("antigenMis");
const allel = document.getElementById("alleleMis");

function mainFunction() {
  const myInput = txt1.value;
  // This function will take the user-provided string and convert into an array of arrays, so that we can take care of special case x or X easily
function myInputToArrayOfArrays(str){
    const findComma = str.split(/[, \t]+/g); // The regex will find commas, spaces, and tabs
    const arrayOfArrays = [[findComma[0], findComma[1]], [findComma[2], findComma[3]]];
    return arrayOfArrays;
}

const printoutInput = myInputToArrayOfArrays(myInput);

let newMyInput = myInputToArrayOfArrays(myInput);
// So far, we have just re-structured input into array of arrays

// Let us deal with special case X first (which we interpret as homozygous)
// The function below returns true or false depending on if the string is a single x or X
function onlyX(str) {
    return /^[Xx]{1}$/.test(str);
}
// This for-loop should replace X with its paired value
for(let k=0; k<newMyInput.length; k++){
    if(onlyX(newMyInput[k][0]) == true){
        newMyInput[k][0] = newMyInput[k][1];
    } else if(onlyX(newMyInput[k][1]) == true){
        newMyInput[k][1] = newMyInput[k][0];
    }
}

// =========================================================

// At this point, variable "newMyInput" now has all values in a basic format without X's.
// In other words, it's taken input "01:01, x, 01:01, X" and given
// us output in the form of [ [ '01:01', '01:01' ], [ '01:01', '01:01' ] ]

// =========================================================
// Let us split the output that we got above into patient versus donor:
// For each person, we get an array containing both their allele codes
let p_alleles = newMyInput[0];  // e.g., [ '04:01G3', '15:05' ]
let d_alleles = newMyInput[1];  // e.g., [ '04:PAYK:01', '15:05' ]


// Next, need to delete extra fields, i.e., anything after a second colon
// The following function will delete the allele string after a second colon
// Let's say i have a code 04:101:03. Goal is to return 04:101
function deleteAfter2ndColon(hlaCode){
    const indexColon = hlaCode.indexOf(":");

    // Slice before and after the colon. 
    const first = hlaCode.slice(0,indexColon);
    let second = hlaCode.slice(indexColon+1); //Note that sometimes, this 2nd piece might also have a colon in it. In that case, need to cut the string again before this second colon.

    // This loop doublechecks that the 2nd half does not have a colon. If it does, should delete everything after the colon because we're only looking at the first two fields for bone marrow transplants. (Fields in allele codes are separated by colons.) NOTE TO SELF: Could've also used REGEX to split at colons.
    for (let i=0; i < second.length; i++){
        if(second.indexOf(":") != -1){   // <== This line translates to: If the colon is found...
            second = second.slice(0, second.indexOf(":"));
        }
    } 

    // Now we have two pieces (the part before the colon, and the part after the colon). 
    // Must concatenate them back together.
    return (first + ":" + second);
}

// Map the deleteAfter2ndColon function onto patient and donor arrays
const delete2ndcolon_p = p_alleles.map(deleteAfter2ndColon);
const delete2ndcolon_d = d_alleles.map(deleteAfter2ndColon);  
// e.g., Now we have [ '04:PAYK', '15:05' ] instead of [ '04:PAYK:01', '15:05' ] 


// NOTE: Right now, we need to separate each field (via colon separator) because we treat each field on either side of the colon as a separate element. Will be easier to analyze and compare once they're separated

// This function below will analyze a string, split by colon, and return an array of two elements
function splitAtColon(str) {
    const colonLocation = /[:]+/;
    const splitString = str.split(colonLocation);

    const firstHalf = splitString[0];
    const secondHalf = splitString[1];

    // Making an object of all the above data
    const pairOfFields = [firstHalf, secondHalf];

    return pairOfFields;  // <-- This is in the format of [a, b]
}

// Make an empty array to which I will push both patient and donor data to get one big array
let array1 = [];

// Push patient data
for(let q=0; q<delete2ndcolon_p.length; q++){
array1.push(splitAtColon(delete2ndcolon_p[q]));
}

// Push donor data
for(let r=0; r<delete2ndcolon_d.length;r++){
    array1.push(splitAtColon(delete2ndcolon_d[r]));
}

// At this point, array1 looks something like this; [ [ '04', '01G3' ], [ '15', '05' ], [ '04', 'PAYK' ], [ '15', '05' ] ]

// Also, need to deal with the different string scenarios
// Scenario 1 is if value is all numbers. This is ideal. No edit necessary.
// Scenario 2 is if value is a mix of numbers and letters, but note that allele codes always start with a number in this case.
// Scenario 3 is if value is all letters (excluding just X alone).


// This function will remove all letters (and terminal numbers) from a string and leave behind leading numbers only. It will leave an empty space if a string is all letters, or letters then trailing number(s).
function removeLetters(str) {
    return str.replace(/[A-Za-z]+[0-9]*$/g, '');
}
// Running this loop will extract just numbers from allele codes or output an empty space for "all-letter" codes or codes with letters-followed-by-trailing-numbers
for(let s=0; s<array1.length; s++){
    array1[s][0] = removeLetters(array1[s][0]);
    array1[s][1] = removeLetters(array1[s][1]);
}

// array1 now looks like this: [ [ '04', '01' ], [ '15', '05' ], [ '04', '' ], [ '15', '05' ] ]
//                             [ [p_1a , p_1b],   [p_2a, p_2b],   [d_1a, d_1b],  [d_2a, d_2b] ] 

// Make an object to have all the re-formatted data in one place
const obj = {
    patient_Allele1a: array1[0][0],
    patient_Allele1b: array1[0][1],
    patient_Allele2a: array1[1][0],
    patient_Allele2b: array1[1][1],
    donor_Allele1a: array1[2][0],
    donor_Allele1b: array1[2][1],
    donor_Allele2a: array1[3][0],
    donor_Allele2b: array1[3][1]
    }

// Can compare patient and donor now. 


// ************************************************************
// These two constants of patient and donor concatenate the fields (e.g., 07:02 becomes 0702, which will be helpful for allelic level matching bc they are analyzed as a whole like this). NOTE: These constants will only be used for allelic-level matching.
const patient = [obj.patient_Allele1a+obj.patient_Allele1b, obj.patient_Allele2a+obj.patient_Allele2b];
const donor = [obj.donor_Allele1a+obj.donor_Allele1b, obj.donor_Allele2a+obj.donor_Allele2b];

// ************************************************************

function analyze(){
    // Must deal with special case first. (i.e., When the value is empty because it was originally all letters like PAYK )
  if( obj.patient_Allele1b == "" || obj.patient_Allele2b == "" || obj.donor_Allele1b == '' || obj.donor_Allele2b == "" ){
      let allelMismatches = "ND (not determined)";
      let antigMismatches = firstFieldMismatches([obj.patient_Allele1a,obj.patient_Allele2a], [obj.donor_Allele1a, obj.donor_Allele2a]);
    const misMatchResults = [antigMismatches, allelMismatches];
    return misMatchResults;
  }
  // These are the main functions to compare patient versus donor.
  else if(firstFieldMismatches([obj.patient_Allele1a,obj.patient_Allele2a], [obj.donor_Allele1a, obj.donor_Allele2a]) == 0){  
      // In other words, if the first two digits match...
      let antigMismatches = "ND (not determined)";
      let allelMismatches = secondFieldMismatches(patient, donor);
      const misMatchResults = [antigMismatches, allelMismatches];
    return misMatchResults;
  } else{
      // In other words, if the first two digits don't match...
      let antigMismatches = firstFieldMismatches([obj.patient_Allele1a, obj.patient_Allele2a], [obj.donor_Allele1a, obj.donor_Allele2a]);
      let allelMismatches = "ND (not determined)";
      const misMatchResults = [antigMismatches, allelMismatches];
    return misMatchResults;
  }
  }
  
  const finalAnalysis = analyze();
  const antigenMismatches = finalAnalysis[0]; // FINAL RESULTS!
  const allelicMismatches = finalAnalysis[1]; // FINAL RESULTS



// ************************************************************


// This function wil count # allelic-level mismatches between patient and donor (i.e., the 2nd fields of two allele codes)
// NOTE: Function takes in two parameters: one concatenated patient item and one concatenated donor item.
function secondFieldMismatches(p, d){
    if( p.includes(d[0]) == false && p.includes(d[1]) == false ){
        return 2;
    }else if(isEqual(p,d) ){
    return 0;
    } else {
    return 1;
    }
}


// ************************************************************
// This function will count # of antigen-level mismatches between patient and donor (i.e., the first fields of two allele codes)
// Order of elements does NOT matter here
// each parameter represents an array with 2 elements (the first fields of two allele codes)
// Example, it will take in an array, of patient 1 as [ [07, 35] ]
// In other words, all the elements with the letter "a" NOT "b" 
function firstFieldMismatches(p_first_fields, d_first_fields) {
    // example: Let's evaluate patient's 1st field, 1st allele
    // We want to know: is it present in donor AND how many times, 
    // while making sure to count MISmatches, NOT MATCHES)
    if(d_first_fields.includes(p_first_fields[0]) == false && d_first_fields.includes(p_first_fields[1]) == false){
    return 2;
    } else if(isEqual(p_first_fields, d_first_fields)){
    return 0;
    } else {
    return 1;
    }
}

// In order to compare if two arrays are the same, turn them into strings via join, and then compare
function isEqual(a, b) {
    return a.join() == b.join(); // If returns true, they are equal
}

    // ************************************************************
    // ************************************************************
    // ************************************************************
    // FINAL RESULTS:


  p11.innerHTML = `${printoutInput[0][0]}`;
  p12.innerHTML = `${printoutInput[0][1]}`;
  d11.innerHTML = `${printoutInput[1][0]}`;
  d12.innerHTML = `${printoutInput[1][1]}`;
  antig.innerHTML = `${antigenMismatches}`;
  allel.innerHTML = `${allelicMismatches}`;
 
}

btn1.addEventListener("click", mainFunction);