const Node = require('src/parser/nodes/Node');
const {
    UnaryOpNode,
    BinOpNode,
    NumberNode,
    VarAccessNode,
    VarAssignNode,
    IfNode,
    FuncDefNode,
    CallNode,
    StringNode
} = require('src/parser/nodes');
const RTResult = require('src/interpreter/RTResult');
const { getattr } = require('src/utils');
const Context = require('src/interpreter/Context');
const { TokenTypes } = require('src/lexer/Token');
const { RTError, UniformError } = require('src/errors');

const Number = require('src/interpreter/Number');
const Function = require('src/interpreter/Function');
const String = require('src/interpreter/String');
const List = require('src/interpreter/List');

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
     * @param {StringNode} node 
     * @param {Context} context 
     */
    visit_StringNode(node, context) {
        return new RTResult().success(
            new String(node.tok.value).setContext(context).setPos(node.posStart, node.posEnd)
        )
    }

    visit_ListNode(node, context) {
        let res = new RTResult();
        let elements = [];

        node.elementNodes.forEach(elementNode => {
            elements.push(res.register(this.visit(elementNode, context)));
            if(res.error) return res;
        });

        return res.success(
            new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
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

        value = value.copy().setPos(node.posStart, node.posEnd).setContext(context);
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

    visit_VarReAssignNode(node, context) {
        let res = new RTResult();
        let varName = node.varNameTok.value;
        let value = res.register(this.visit(node.newValueNode, context));
        if(res.error) return res;

        if(context.symbolTable.get(varName)) {
            context.symbolTable.set(varName, value);
        } else if(context.symbolTable.parent.get(varName)) {
            context.symbolTable.parent.set(varName, value);
        }
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
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.MINUS) {
            var result = left.subbedBy(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.MUL) {
            var result = left.multedBy(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.DIV) {
            var { result, error } = left.divedBy(right);
            if(error) return res.failure(error);
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.POW) {
            var result = left.powedBy(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.EE) {
            var result = left.getComparisonEq(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.NE) {
            var result = left.getComparisonNe(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.LT) {
            var result = left.getComparisonLt(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.GT) {
            var result = left.getComparisonGt(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.LTE) {
            var result = left.getComparisonLte(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.type == TokenTypes.GTE) {
            var result = left.getComparisonGte(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.matches(TokenTypes.KEYWORD, "&")) {
            var result = left.andedBy(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
            return res.success(result.setPos(node.posStart, node.posEnd));
        } else if(node.opTok.matches(TokenTypes.KEYWORD, "|")) {
            var result = left.oredBy(right);
            if(result instanceof UniformError) {
                return res.failure(result);
            }
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
        var shouldReturnNull = null;
        let conditionValue = null;
        let returnFromFor = false;

        node.cases.forEach(c => {
            let condition = c[0];
            let expr = c[1];
            shouldReturnNull = c[2];
            conditionValue = res.register(this.visit(condition, context));
            if(res.error) return res;

            if(conditionValue.isTrue()) {
                exprValue = res.register(this.visit(expr, context));
                if(res.error) return res;
                returnFromFor = true;
            }
        });
        if(returnFromFor) return res.success(shouldReturnNull ? Number.null : exprValue);

        if(node.elseCase) {
            let [ expr, shouldReturnNull ] = node.elseCase;
            let exprValue = res.register(this.visit(expr, context));
            if(res.error) return res;
            return res.success(shouldReturnNull ? Number.null : exprValue);
        }

        return res.success(Number.null);
    }

    visit_ForNode(node, context) {
        let res = new RTResult();
        let elements = [];

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

            elements.push(res.register(this.visit(node.bodyNode, context)));
            if(res.error) return res;
        }

        return res.success(
            node.shouldReturnNull ? Number.null : new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    visit_WhileNode(node, context) {
        let res = new RTResult();
        let elements = [];

        while(true) {
            let condition = res.register(this.visit(node.conditionNode, context));
            if(res.error) return res;

            if(!condition.isTrue()) break;

            elements.push(res.register(this.visit(node.bodyNode, context)));
            if(res.error) return res;
        }

        return res.success(
            node.shouldReturnNull ? Number.null : new List(elements).setContext(context).setPos(node.posStart, node.posEnd)
        );
    }

    /**
     * @param {FuncDefNode} node 
     * @param {Context} context 
     */
    visit_FuncDefNode(node, context) {
        let res = new RTResult();

        let funcName = node.varNameTok.value ? node.varNameTok.value : null;
        let bodyNode = node.bodyNode;
        let argNames = [];
        node.argNameToks.forEach(argName => {
            argNames.push(argName.value);
        });
        let funcValue = new Function(funcName, bodyNode, argNames).setContext(context).setPos(node.posStart, node.posEnd);

        if(node.varNameTok) {
            context.symbolTable.set(funcName, funcValue);
        }
        
        return res.success(funcValue);
    }

    /**
     * @param {CallNode} node 
     * @param {Context} context 
     */
    visit_CallNode(node, context) {
        let res = new RTResult();
        let args = [];

        let valueToCall = res.register(this.visit(node.nodeToCall, context));
        if(res.error) return res;
        valueToCall = valueToCall.copy().setPos(node.posStart, node.posEnd);

        node.argNodes.forEach(argNode => {
            args.push(res.register(this.visit(argNode, context)));
        });
        if(res.error) return res;

        let returnValue = res.register(valueToCall.execute(this, args));
        if(res.error) return res;
        returnValue = returnValue.copy().setPos(node.posStart, node.posEnd).setContext(context);
        return res.success(returnValue);
    }
}