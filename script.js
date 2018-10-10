// import hash function
//const SHA256 = require('crypto-js/sha256');
require(['node_modules/crypto-js/sha256'], function (foo) {
    const SHA256 = foo;

    // CREATE BLOCK CLASS --------------------------------------------------------
    class Block {
        constructor(index, timestamp, data, previousHash = '') {
            this.index = index;
            this.timestamp = timestamp;
            this.data = data;
            this.previousHash = previousHash;
            this.hash = this.calculateHash();
            this.nonce = 0; // nonsense variable used for mining
        }

        calculateHash() {
            return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
        }

        // recalculates hash until it gets a hash that has the required number of leading 0's
        // This is the "proof of work" for security so that new blocks can't be added too quickly.
        mineBlock(difficulty){
            while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
                this.nonce++;
                this.hash = this.calculateHash();
            }

            console.log('Block mined: ' + this.hash);
        }
    }

    // CREATE CHAIN CLASS -----------------------------------------------------------
    class BlockChain {
        constructor() {
            this.chain = [this.createGenesisBlock()]; // initialize chain as array starting with genesis block
            this.difficulty = 2;
        }

        createGenesisBlock() {
            return new Block(0, "01/01/2018", "Genesis block", "0"); // creates genesis block
        }

        getLatestBlock() {
            return this.chain[this.chain.length - 1]; // returns the last block in the chain
        }

        addBlock(newBlock) {
            newBlock.previousHash = this.getLatestBlock().hash; // set previousHash to the last block's hash
            newBlock.mineBlock(this.difficulty); // sets the new block's hash to the mined hash
            this.chain.push(newBlock); // adds it to the array
        }

        // simple validation check
        isChainValid() {
            for(let i = 1; i < this.chain.length; i++) {
                const currentBlock = this.chain[i];
                const previousBlock = this.chain[i - 1];

                if(currentBlock.hash !== currentBlock.calculateHash()) {
                    return false;
                }

                if(currentBlock.previousHash !== previousBlock.hash){
                    return false;
                }
            }

            return true;
        }
    }
    // Create the chain
    let vivCoin = new BlockChain;

    console.log('Mining block 1...');
    vivCoin.addBlock(new Block(1, "09/10/2018", { amount: 4 }));

    console.log('Mining block 2...');
    vivCoin.addBlock(new Block(2, "11/10/2018", { amount: 10 }));

    // console.log('valid? ' + vivCoin.isChainValid());

    // vivCoin.chain[1].data = { amount: 100 };
    // vivCoin.chain[1].hash = vivCoin.chain[1].calculateHash();
    console.log('valid? ' + vivCoin.isChainValid());

    //console.log(JSON.stringify(vivCoin.chain, null, 4));

    // VARIABLES
    const divBlocks = document.querySelector('#div-blocks');
    const newBtn = document.querySelector('#addNew');
    const verifyBtn = document.querySelector('#verify');
    const changeDiffBtn = document.querySelector('#difficulty button');
    const diffInput = document.querySelector('#difficulty input');
    // RENDER FUNCTION
    function render() {
        const html = vivCoin.chain.map((block, index) => `
            <div class="block">
                <h2>Block ${index}</h2>
                <p><b>Time:</b> ${block.timestamp}</p>
                <p><b>Data:</b> ${JSON.stringify(block.data)}</p>
                <p><b>Previous Hash:</b> ${block.previousHash}</p>
                <p><b>Hash:</b> ${block.hash}</p>
                <p><b>Nonsense #:</b> ${block.nonce}</p>
            </div>
        `);
        divBlocks.innerHTML = html;
    }

    render();

    // CLICK HANDLERS
    newBtn.addEventListener('click', function() {
        console.log('Mining new block...');
        // vivCoin.addBlock(new Block((vivCoin.chain.length + 1), "10/10/2018", 'New block wassssaaup??'));
        // render();
        fetch('https://my.api.mockaroo.com/block.json?key=26e98c30')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                blockData = data;
                vivCoin.addBlock(new Block((vivCoin.chain.length + 1), "10/10/2018", blockData));
                render();
            })
    });
    verifyBtn.addEventListener('click', function() {
        console.log('Is the chain valid? ' + vivCoin.isChainValid());
    });
    changeDiffBtn.addEventListener('click', function(e) {
        e.preventDefault();
        let newDiff = Number(diffInput.value);
        vivCoin.difficulty = newDiff;
    });

});