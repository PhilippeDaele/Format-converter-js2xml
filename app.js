const fs = require('fs');
const xml2js = require('xml2js');

let filepath = 'testfile.txt';
let peopleSomething = [];


try{
    peopleSomething = readFromFile(filepath);

    // builds the xml-file
    const builder = new xml2js.Builder({ strict:true });
    const xml = builder.buildObject({ peopleSomething: peopleSomething });
    fs.writeFileSync('output.xml', xml);
}catch(error){
    console.error("An error occured with the input data, check input format.\nError message:\n\t", error.message);
    process.exit(1);
}

function readFromFile(filepath){
    try{
        const people = [];
        let currentPerson = {};
    
        const data = fs.readFileSync(filepath, 'utf-8');
        const lines = data.split('\n');
    
        for(let i = 0; i < lines.length; i++){
            const line = lines[i].trim();
            const [recordType, ...readValue] = line.split('|');
            
            switch(recordType){
                case 'P':
                    if (Object.keys(currentPerson).length !== 0) {
                        people.push(currentPerson); // Push the previous person data
                        currentPerson = {}; // Start a new person
                    }
                    currentPerson.person = {
                        firstname: readValue[0], 
                        lastname: readValue[1]
                    };
                    break;
        
                case 'T':
                    currentPerson.person.phone = { 
                        mobile: readValue[0], 
                        landline: readValue[1]
                    };
                    break;
        
                case 'A':
                    currentPerson.person.address = { 
                        street: readValue[0], 
                        city: readValue[1], 
                        postcode: readValue[2] 
                    };
                    break;
    
                case 'F':
                    currentPerson.person.family = currentPerson.person.family || [];
                    let familyMember = {
                        name: readValue[0], 
                        yearbirth: readValue[1]
                    };
    
                    // Check if there's an address or phone record following the family record
                    let j = i + 1;
                    while (j < lines.length) {
                        const nextLine = lines[j].trim();
                        const [NextLinerecordType, ...nextLinereadValue] = nextLine.split('|');
                        if (NextLinerecordType === 'A') {
                            familyMember.address = {
                                street: nextLinereadValue[0],
                                city: nextLinereadValue[1],
                                postcode: nextLinereadValue[2]
                            };
                            j++;
                        } else if (NextLinerecordType === 'T') {
                            familyMember.phone = {
                                mobile: nextLinereadValue[0],
                                landline: nextLinereadValue[1]
                            };
                            j++;
                        } else {
                            break;
                        }
                    }
    
                    currentPerson.person.family.push(familyMember);
    
                    // Move back to the main loop counter to the last processed family member
                    i = j - 1;
                    break;
    
                default:
                    return;
            }
        }
    
        // Push the last person's data if there's any
        if (Object.keys(currentPerson).length !== 0) {
            people.push(currentPerson);
        }
    
        return people; // return the parsed data

    }catch(error){
        //console.log('An error occured while parsing the data, check input format.\nError:');
        //console.error(error.message);
        throw error;
    }
}
