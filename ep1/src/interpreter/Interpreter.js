const Node = require('../parser/nodes/Node');
const {
    UnaryOpNode,
    BinOpNode,
    NumberNode
} = require('../parser/nodes/index');
const RTResult = require('./RTResult');
const { getattr } = require('../utils');
const Context = require('./Context');
const { TokenTypes } = require('../lexer/Token');

const Number = require('./Number');

module.exports = class Interpreter {
    constructor() {}

    /**
     * @param {Node} node 
     * @param {Context} context 
     */
    visit(node, context) {
        let methodName = `visit_${node.name}`;
        let method = getattr(this, methodName, this.noVisitMethod);
        return method(node, context);
    }

    /**
     * @param {Node} node 
     * @param {Context} context 
     */
    noVisitMethod(node, context) {
        throw new Error(`No visit_${node.name} method defined`);
    }

    // ###############################################################

    /**
     * @param {NumberNode} node 
     * @param {Context} context 
     */
    visit_NumberNode(node, context) {
        return new RTResult().success(
            new Number(node.tok.value).setContext(context).setPos(node.posStart, node.posEnd)
        )
    }

    /**
     * @param {BinOpNode} node 
     * @param {Context} context 
     */
    visit_BinOpNode(node, context) {
        let res = new RTResult();
        let left = res.register(this.visit(node.leftNode, context));
        if(res.error) return res;
        let right = res.register(this.visit(node.rightNode, context));
        if(res.error) return res;

        if(node.opTok.type == TokenTypes.PLUS) {
            var result = left.addedTo(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.MINUS) {
            var result = left.subbedBy(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.MUL) {
            var result = left.multedBy(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.DIV) {
            var { result, error } = left.divedBy(right);
            if(error) return res.failure(error);
            return res.success(result.setPos(node.posStart, node.posEnd));
        }

        if(error) {
            return res.failure(error);
        } else {
            return res.success(result.setPos(node.posStart, node.posStart));
        }
    }

    /**
     * @param {UnaryOpNode} node 
     * @param {Context} context 
     */
    visit_UnaryOpNode(node, context) {
        let res = new RTResult();
        let number = res.register(this.visit(node.node, context));
        if(res.error) return res;

        let result = null;
        let error = null;

        if(node.opTok.type == TokenTypes.MINUS) {
            if(number.name == "Number") {
                result = number.multedBy(new Number(-1));
            } else {
                error = result;
            }
        }

        if(error) {
            return res.failure(error);
        } else {
            return res.success(number.setPos(node.posStart, node.posEnd));
        }
    }
}