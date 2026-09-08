const { BigNumber, checkForValidValue } = require("./helper");

const tokenize = (expression) => {
  const regex = /\s*([A-Za-z_]\w*\s*\([^)]*\)|[A-Za-z_]\w*|-?\d+\.?\d*|==|!=|<=|>=|&&|\|\||\.|\^|[+\-*/<>()=?:!]|'[^']*')\s*/g;
  return expression.match(regex).map(token => token.trim());
};

const categorizeTokens = (tokens) => {
  const operators = ['==', '!=', '<=', '>=', '&&', '||', '+', '-', '*', '/', '^', '<', '>', '=', '(', ')', '?', ':', '!', '.'];
  return tokens.map(token => {
    if (operators.includes(token)) {
      return { type: 'operator', value: token };
    } else if (/^-?\d+\.?\d*$/.test(token)) {
      return { type: 'operand', value: new BigNumber(token) };
    } else if (/^[A-Za-z_]\w*\s*\([^)]*\)$/.test(token)) {
      return { type: 'function', value: token };
    } else if (/^[A-Za-z_]\w*$/.test(token)) {
      return { type: 'operand', value: token };
    } else if (/^'[^']*'$/.test(token)) {
      return { type: 'operand', value: token.slice(1, -1) }; // Remove the quotes
    } else {
      throw new Error(`Unexpected token: ${token}`);
    }
  });
};

const parseTokens = (tokens, expression) => {
  let index = 0;

  const parsePrimary = () => {
    if (index >= tokens.length) throw new Error('Unexpected end of expression');
    const token = tokens[index++];
    if (token.type === 'operand') return token;
    if (token.type === 'function') return parseFunction(token);
    if (token.value === '(') {
      const expr = parseExpression(expression);
      if (index >= tokens.length || tokens[index++].value !== ')') {
        throw new Error('Expected closing parenthesis');
      }
      return expr;
    }
    if (token.value === '!') {
      const operand = parsePrimary();
      return { type: 'OperatorNode', op: '!', args: [operand] };
    }
    throw new Error(`Unexpected token: ${token.value}`);
  };

  const parseFunction = (token) => {
    const match = token.value.match(/^([A-Za-z_]\w*)\s*\(([^)]*)\)$/);
    if (!match) throw new Error(`Invalid function token: ${token.value}`);
    const functionName = match[1];
    const args = match[2] ? match[2].split(',').map(arg => parseTokens(categorizeTokens(tokenize(arg.trim())), expression)) : [];
    return { type: 'FunctionNode', name: functionName, args: args };
  };

  const parseOperator = (left, minPrecedence) => {
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.value === ')') break;
      const precedence = getPrecedence(token.value);
      if (precedence < minPrecedence) break;
      index++;
      let right = parsePrimary();
      while (index < tokens.length && getPrecedence(tokens[index].value) > precedence) {
        right = parseOperator(right, precedence + 1);
      }
      left = { type: 'OperatorNode', op: token.value, args: [left, right] };
    }
    return left;
  };

  const parseExpression = (expression) => {
    let left = parsePrimary();
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.value === ')') break;
      if (token.value === ':') break;
      const precedence = getPrecedence(token.value);
      if (precedence === 8) { // Handle ternary operator
        index++;
        const middle = parseExpression(expression);
        if (index >= tokens.length || tokens[index].value !== ':') {
          console.error('Expected colon in ternary operator, found:', tokens[index]);
          return middle; // Return middle if ':' is not found
        }
        index++;
        const right = parseExpression(expression);
        left = { type: 'OperatorNode', op: '?', args: [left, middle, right] };
      } else {
        left = parseOperator(left, 0);
      }
    }
    return left;
  };

  return parseExpression(expression);
};

const getPrecedence = (op) => {
  switch (op) {
    case '||': return 1;
    case '&&': return 2;
    case '==': case '!=': case '<': case '>': case '<=': case '>=': return 3;
    case '+': case '-': return 4;
    case '*': case '/': return 5;
    case '^': return 6;
    case '!': return 7;
    case '?': return 8;
    default: return 0;
  }
};

const evaluateNode = (node, variables) => {
  switch (node.type) {
    case 'operand':
      let value = ['true', 'false'].includes(node.value) ? (node.value === 'true') : !isNaN(parseFloat(node.value)) ? new BigNumber(node.value) : node.value;
      if(value === 'undefined') return undefined;
      if(value === 'null') return null;
      if (typeof node.value === 'string' && variables[node.value] !== undefined) {
        value = variables[node.value];
        if(['true', 'false'].includes(value)) value = value === 'true';
      }
      if (typeof value !== 'boolean' && !isNaN(parseFloat(value))) {
        value = new BigNumber(checkForValidValue(value));
      }
      return value;
    case 'FunctionNode':
      const func = typeof window == 'object' ? window[node.name] : global[node.name];
      if (typeof func !== 'function') {
        const funcName = node.name;
        const args = node.args.map(arg => evaluateNode(arg, variables));
        const object = args[1] ?? args[0]; // The left operand (e.g., FlowCapacityUOM)

        // Handle string and array methods
        if (typeof object === 'string') {
          // console.log('object >>> ',object)
            switch (funcName) {
                case 'includes':
                    return object.includes(args[0]);
                case 'toUpperCase':
                    return object.toUpperCase();
                case 'toLowerCase':
                    return object.toLowerCase();
                case 'startsWith':
                    return object.startsWith(args[0]);
                case 'endsWith':
                    return object.endsWith(args[0]);
                default:
                    throw new Error(`Unsupported method: ${funcName}`);
            }
        }
        throw new Error(`Unsupported object type for method: ${funcName}`);
      }
      const args = node.args.map(arg => evaluateNode(arg, variables));
      return func(...args);
    case 'OperatorNode':
      if (node.op === '!') {
        const operand = evaluateNode(node.args[0], variables);
        if (operand instanceof BigNumber) {
          return operand.isZero();
        }
        return !operand;
      }
      if (node.op === '.') {
        const left = evaluateNode(node.args[0], variables); // Left operand (e.g., FlowCapacityUOM)
        const right = node.args[1]; // Right function (e.g., includes)
        if (typeof left === 'string') {
          right.args.push(node.args[0]);
          return evaluateNode(right, { ...variables, [node.args[0].value]: left });
        }
        throw new Error(`Unsupported dot operator usage`);
      }
      const left = evaluateNode(node.args[0], variables);
      if (node.op === ':') {
        const right = evaluateNode(node.args[1], variables);
        return (left || ['', 0].includes(left)) ? left : right;
      }
      const right = node.args[1] ? evaluateNode(node.args[1], variables) : undefined;
      switch (node.op) {
        case '+': return left.plus ? left.plus(right) : left + right;
        case '-': return left.minus ? left.minus(right) : left - right;
        case '*': return left.times ? BigNumber(checkForValidValue(left.times(right))) : left * right;
        case '/': return left.div ? BigNumber(checkForValidValue(left.div(right))) : left / right;
        case '^': return left.pow ? left.pow(right) : Math.pow(left, right);
        case '==': return left.eq ? left.eq(right) : left === right;
        case '!=': return left.eq ? !left.eq(right) : left !== right;
        case '<': return left.lt ? left.lt(right) : left < right;
        case '<=': return left.lte ? left.lte(right) : left <= right;
        case '>': return left.gt ? left.gt(right) : left > right;
        case '>=': return left.gte ? left.gte(right) : left >= right;
        case '&&': return left && right;
        case '||': return left || right;
        case '?':
          return left ? evaluateNode(node.args[1], variables) : evaluateNode(node.args[2], variables);
        default: throw new Error(`Unsupported operator: ${node.op}`);
      }
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
};

const evaluateExpression = (expression, variables) => {
  const tokens = tokenize(expression);
  const categorizedTokens = categorizeTokens(tokens);
  const parsedExpression = parseTokens(categorizedTokens,expression);
  const result = evaluateNode(parsedExpression, variables);
  // console.log({expression, result, variables, res: (typeof result == 'number' || result instanceof BigNumber) ? checkForValidValue(result) : result});
  return (typeof result == 'number' || result instanceof BigNumber) ? checkForValidValue(result) : result;
};

module.exports = {
  evaluateExpression
};