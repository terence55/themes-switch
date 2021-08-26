const path = require('path');
const fs = require('fs-extra');

function collectFiles(filePath, results, fileFilter, dirFilter) {
  const files = fs.readdirSync(filePath);
  if (!files) {
    console.warn(err);
  } else {
    files.forEach((filename) => {
      const filedir = path.posix.join(filePath, filename);
      const stats = fs.statSync(filedir);
      if (!stats) {
        console.warn(`${filedir}: invalid file stats.`);
      } else {
        const isFile = stats.isFile();
        const isDir = stats.isDirectory();
        if (isFile) {
          if (fileFilter && typeof fileFilter === 'function') {
            if (fileFilter(filedir)) {
              results.push(filedir);
            }
          } else {
            results.push(filedir);
          }
        }
        let digIn = true;
        if (dirFilter && typeof dirFilter === 'function') {
          if (!dirFilter(filedir)) {
            digIn = false;
          }
        }
        if (isDir && digIn) {
          collectFiles(filedir, results, fileFilter, dirFilter);
        }
      }
    });
  }
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  }
  return false;
}

const RULE_SET = 'ruleset';
const BLOCK = 'block';
const DECLARATION = 'declaration';
const VARIABLE = 'variable';
const VALUE = 'value';

function isRuleSet(node) {
  return node.type === RULE_SET;
}

function isBlock(node) {
  return node.type === BLOCK;
}

function isDeclaration(node) {
  return node.type === DECLARATION;
}

function isVariable(node) {
  return node.type === VARIABLE;
}

function isValue(node) {
  return node.type === VALUE;
}

function isEmptyBlock(block) {
  if (!Array.isArray(block)) return true;
  return !block.find(child => [DECLARATION, RULE_SET].includes(child.type));
}

function isVariableRule(node) {
  const valueNode = node.children.find(isValue);
  if (!valueNode) return false;
  return valueNode.children.find(isVariable);
}

function removeExtraDeclaration(tree) {
  const nodes = tree?.children;
  if (!nodes.length) return;
  for (let t = 0; t < nodes.length; t++ ) {
    const node = nodes[t];
    if (isRuleSet(node)) {
      removeExtraDeclaration(node);
      continue;
    }
    if (isBlock(node)) {
      const {children} = node;
      for(let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!isDeclaration(child)) continue;
        if (!isVariableRule(child)) {
          children.splice(i - 1, 3);
          i -= 2;
        }
      }
      if (isEmptyBlock(children)) {
        nodes.splice(t, 1);
        t -= 1;
      }
      children.filter(n => n.type === RULE_SET).forEach(node => removeExtraDeclaration(node));
    }
  }
}

function removeEmptyRule(tree) {
  const nodes = tree?.children;
  if (!nodes?.length) return;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isRuleSet(node)) {
      const blocks = node?.children?.filter(isBlock);
      blocks.forEach(block => {
        block?.children?.filter(isRuleSet).forEach(n => removeEmptyRule(n));
      })
      const isAllEmpty = blocks.filter(isEmptyBlock).every(n => !n);
      if (isAllEmpty) {
        tree.children.splice(i - 1, 2);
        i -= 1;
      }
    }
    removeEmptyRule(node);
  }
}

function simplifyCss(ast) {
  removeExtraDeclaration(ast);
  removeEmptyRule(ast);
}

module.exports = {
  collectFiles,
  randomNum,
  recursiveIssuer,
  simplifyCss
};
