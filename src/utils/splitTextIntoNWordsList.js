//This function converts a sentence into an array of n-word combinations
export default (sentence, n) => {
    let words = sentence.split(" ");
    let blocks = [];
    if (words.length >= n) {
        for (let i = n - 1; i < words.length; i++) {
            let block = "";
            for (let j = n - 1; j >= 0; j--) {
                block += j === 0 ? words[i - j] : words[i - j] + " ";
            }
            blocks.push(block);
        }
    } else blocks = words;
    return blocks;
};
