import { intentClassifier } from "../ai/classifier/intent.classifier";

console.log(intentClassifier.classify("hi"));

console.log(intentClassifier.classify("birthday decoration"));

console.log(intentClassifier.classify("where is your office"));

console.log(intentClassifier.classify("cancel booking"));

console.log(intentClassifier.classify("suggest a decoration for twins"));