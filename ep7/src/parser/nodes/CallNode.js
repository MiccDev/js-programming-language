const Node = require('./Node');

module.exports = class CallNode extends Node {
    /**
     * @param {Node} nodeToCall 
     * @param {Node[]} argNodes 
     */
    constructor(nodeToCall, argNodes) {
        super();
        this.nodeToCall = nodeToCall;
        this.argNodes = argNodes;

        this.posStart = this.nodeToCall.posStart;

        if(this.argNodes.length > 0) {
            this.posEnd = this.argNodes[this.argNodes.length - 1].posEnd;
        } else {
            this.posEnd = this.nodeToCall.posEnd;
        }

        this.name = "CallNode";
    }

}