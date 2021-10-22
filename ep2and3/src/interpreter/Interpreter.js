const Node = require('../parser/nodes/Node');
const {
    UnaryOpNode,
    BinOpNode,
    NumberNode,
    VarAccessNode,
    VarAssignNode,
    IfNode
} = require('../parser/nodes/index');
const RTResult = require('./RTResult');
const { getattr } = require('../utils');
const Context = require('./Context');
const { TokenTypes } = require('../lexer/Token');
const { RTError } = require('../errors/index');

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
     * @param {VarAccessNode} node 
     * @param {Context} context 
     */
    visit_VarAccessNode(node, context) {
        let res = new RTResult();
        let varName = node.varNameTok.value;
        let value = context.symbolTable.get(varName);

        if(!value) {
            return res.failure(new RTError(
                node.posStart, node.posEnd,
                `'${varName}' is not defined`,
                context
            ));
        }

        value = value.copy().setPos(node.posStart, node.posEnd);
        return res.success(value);
    }

    /**
     * @param {VarAssignNode} node 
     * @param {Context} context 
     */
    visit_VarAssignNode(node, context) {
        let res = new RTResult();
        let varName = node.varNameTok.value;
        let value = res.register(this.visit(node.valueNode, context));
        if(res.error) return res;

        context.symbolTable.set(varName, value);
        return res.success(value);
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
        } else if(node.opTok.type == TokenTypes.POW) {
            var result = left.powedBy(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.EE) {
            var result = left.getComparisonEq(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.NE) {
            var result = left.getComparisonNe(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.LT) {
            var result = left.getComparisonLt(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.GT) {
            var result = left.getComparisonGt(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.LTE) {
            var result = left.getComparisonLte(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.GTE) {
            var result = left.getComparisonGte(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.matches(TokenTypes.KEYWORD, "&")) {
            var result = left.andedBy(right);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.matches(TokenTypes.KEYWORD, "|")) {
            var result = left.oredBy(right);
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
        } else if(node.opTok.matches(TokenTypes.KEYWORD, ":")) {
            if(number.name == "Number") {
                result = number.notted();
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

    /**
     * 
     * @param {IfNode} node 
     * @param {Context} context 
     */
    visit_IfNode(node, context) {
        let res = new RTResult();
        let exprValue = null;

        node.cases.forEach(c => {
            let condition = c[0];
            let expr = c[1];

            let conditionValue = res.register(this.visit(condition, context));
            if(res.error) return res;

            if(conditionValue.isTrue()) {
                exprValue = res.register(this.visit(expr, context));
                if(res.error) return res;
                return;
            }
        });

        if(exprValue != null) return res.success(exprValue);

        if(node.elseCase) {
            let elseValue = res.register(this.visit(node.elseCase, context));
            if(res.error) return res;
            return res.success(elseValue);
        }

        return res.success(null);
    }

    visit_ForNode(node, context) {
        let res = new RTResult();

        let startValue = res.register(this.visit(node.startValueNode, context));
        if(res.error) return res;

        let endValue = res.register(this.visit(node.endValueNode, context));
        if(res.error) return res;

        if(node.stepValueNode) {
            var stepValue = res.register(this.visit(node.stepValueNode, context));
        } else {
            stepValue = new Number(1);
        }

        let i = startValue.value;

        if(startValue.value >= 0) {
            var condition = () => i < endValue.value;
        } else {
            var condition = () => i > endValue.value;
        }

        while(condition()) {
            context.symbolTable.set(node.varNameTok.value, new Number(i));
            i += stepValue.value;

            res.register(this.visit(node.bodyNode, context));
            if(res.error) return res;
        }

        return res.success(null);
    }

    visit_WhileNode(node, context) {
        let res = new RTResult();

        while(true) {
            let condition = res.register(this.visit(node.conditionNode, context));
            if(res.error) return res;

            if(!condition.isTrue()) break;

            res.register(this.visit(node.bodyNode, context));
            if(res.error) return res;
        }

        return res.success(null);
    }
}