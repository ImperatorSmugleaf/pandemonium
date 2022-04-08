/**
 * Semantic analyzer for Pandemonium, base taken
 * with permission from Dr. Toal's notes.
 */

// SEMANTIC ANALYZER
//
// Decorates the AST with semantic information and checks the semantic
// constraints. Decorations include:
//
//     * Creating semantic objects for actual variables, functions, and
//       types (The AST made from parsing only has variable declarations,
//       function declarations, and type declarations; real objects often
//       have to be made during analysis)
//     * Adding a type field to all expressions
//     * Figuring out what identifiers refer to (Each identifier token from
//       the AST will get a new property called "value" that will point to
//       the actual variable, function, or type)
//
// Semantic checks are found in this module. They are functions starting
// with "check". There are a lot of them, to be sure. A lot of them have to
// do with type checking. The semantics of type equivalence and assignability
// are complex and defined here as methods in each AST class for types.
//
// Invoke
//
//     analyze(astRootNode)
//
// to decorate the AST and perform semantic analysis. The function returns
// the root node for convenience in chaining calls.

import {
    Variable,
    Type,
    FunctionType,
    ListType,
    StructType,
    ClassType,
    Function,
    Procedure,
    Token,
    error,
    ProcedureType,
  } from "./core.js"
  import * as stdlib from "./stdlib.js"
  
  /**********************************************
   *  TYPE EQUIVALENCE AND COMPATIBILITY RULES  *
   *********************************************/
  
  Object.assign(Type.prototype, {
    // Equivalence: when are two types the same
    isEquivalentTo(target) {
      return this == target
    },
    // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
    // this is only when two types are equivalent; however, for other kinds
    // of types there may be special rules. For example, in a language with
    // supertypes and subtypes, an object of a subtype would be assignable
    // to a variable constrained to a supertype.
    isAssignableTo(target) {
      return this.isEquivalentTo(target)
    },
  })
  
  Object.assign(ListType.prototype, {
    isEquivalentTo(target) {
      // [T] equivalent to [U] only when T is equivalent to U.
      return (
        target.constructor === ListType && this.baseType.isEquivalentTo(target.baseType)
      )
    },
    isAssignableTo(target) {
      // Arrays are invariant in pantheon
      return this.isEquivalentTo(target)
    },
  })

  Object.assign(StructType.prototype, {
    isEquivalentTo(target) {
      // T is equivalent to U only when all of T's fields & U's fields are equal.
      return(
        target.constructor === StructType &&
        this.fields === target.fields &&
        this.fields.forEach(field => target.fields.some(element => field.isEquivalentTo(element)))
      )
    },

    isAssignableTo(target) {
      return(
        target.constructor === StructType && this.name.isEquivalentTo(target.name)
      )
    }
  })

  Object.assign(ClassType.prototype, {
    // T is equivalent to U if T and U have the same reference.
    
    isAssignableTo(target) {
      return(
        target.constructor === ClassType && this.name.isEquivalentTo(target.name)
      )
    }
  })
  
  Object.assign(FunctionType.prototype, {
    isEquivalentTo(target) {
      return (
        target.constructor === FunctionType &&
        this.returnType.isEquivalentTo(target.returnType) &&
        this.paramTypes.length === target.paramTypes.length &&
        this.paramTypes.every((t, i) => target.paramTypes[i].isEquivalentTo(t))
      )
    },
    isAssignableTo(target) {
      // Functions are covariant on return types, contravariant on parameters.
      return (
        target.constructor === FunctionType &&
        this.returnType.isAssignableTo(target.returnType) &&
        this.paramTypes.length === target.paramTypes.length &&
        this.paramTypes.every((t, i) => target.paramTypes[i].isAssignableTo(t))
      )
    },
  })
  
  /**************************
   *  VALIDATION FUNCTIONS  *
   *************************/
  
  function check(condition, message, entity) {
    if (!condition) error(message, entity)
  }
  
  function checkType(e, types, expectation) {
    check(types.includes(e.type), `Expected ${expectation}`)
  }
  
  function checkNumeric(e) {
    checkType(e, [Type.NUM], "a number")
  }
  
  function checkNumericOrString(e) {
    checkType(e, [Type.NUM, Type.STRING], "a number or string")
  }
  
  function checkBoolean(e) {
    checkType(e, [Type.BOOL], "a boolean")
  }
  
  function checkIsAType(e) {
    check(e instanceof Type, "Type expected", e)
  }
  
  function checkList(e) {
    check(e.type.constructor === ListType, "List expected", e)
  }
  
  function checkHaveSameType(e1, e2) {
    check(e1.type.isEquivalentTo(e2.type), "Operands do not have the same type")
  }
  
  function checkAllHaveSameType(expressions) {
    check(
      expressions.slice(1).every(e => e.type.isEquivalentTo(expressions[0].type)),
      "Not all elements have the same type"
    )
  }
  
  function checkNotRecursive(object) {
    check(
      !object.fields.map(f => f.type).includes(object),
      "Struct and class types must not be recursive"
    )
  }
  
  function checkAssignable(e, { toType: type }) {
    check(
      e.type.isAssignableTo(type),
      `Cannot assign a ${e.type.description} to a ${type.description}`
    )
  }
  
  function checkNotReadOnly(e) {
    const readOnly = e instanceof Token ? e.value.readOnly : e.readOnly
    check(!readOnly, `Cannot assign to constant ${e?.lexeme ?? e.name}`, e)
  }
  
  function checkFieldsAllDistinct(fields) {
    check(
      new Set(fields.map(f => f.name.lexeme)).size === fields.length,
      "Fields must be distinct"
    )
  }
  
  function checkMemberDeclared(field, { in: struct }) {
    check(struct.type.fields.map(f => f.name.lexeme).includes(field), "No such field")
  }
  
  function checkInLoop(context) {
    check(context.inLoop, "Break can only appear in a loop")
  }
  
  function checkInFunction(context) {
    check(context.function, "Return can only appear in a function")
  }
  
  function checkCallable(e) {
    check(
      e.constructor === StructType || 
      e.constructor === ClassType ||
      e.type.constructor == ProcedureType ||
      e.type.constructor == FunctionType,
      "Call of non-function or non-constructor"
    )
  }
  
  function checkReturnable({ expression: e, from: f }) {
    checkAssignable(e, { toType: f.type.returnType })
  }
  
  function checkArgumentsMatch(args, targetTypes) {
    check(
      targetTypes.length === args.length,
      `${targetTypes.length} argument(s) required but ${args.length} passed`
    )
    targetTypes.forEach((type, i) => checkAssignable(args[i], { toType: type }))
  }
  
  function checkFunctionCallArguments(args, calleeType) {
    checkArgumentsMatch(args, calleeType.paramTypes)
  }
  
  function checkConstructorArguments(args, structType) {
    const fieldTypes = structType.fields.map(f => f.type)
    checkArgumentsMatch(args, fieldTypes)
  }
  
  /***************************************
   *  ANALYSIS TAKES PLACE IN A CONTEXT  *
   **************************************/
  
  class Context {
    constructor({ parent = null, locals = new Map(), inLoop = false, subroutine: f = null }) {
      Object.assign(this, { parent, locals, inLoop, subroutine: f })
    }
    sees(name) {
      // Search "outward" through enclosing scopes
      return this.locals.has(name) || this.parent?.sees(name)
    }
    add(name, entity) {
      // Pandemonium does not allow shadowing.
      if (this.sees(name)) error(`Identifier ${name} already declared`)
      this.locals.set(name, entity)
    }
    lookup(name) {
      const entity = this.locals.get(name)
      if (entity) {
        return entity
      } else if (this.parent) {
        return this.parent.lookup(name)
      }
      error(`Identifier ${name} not declared`)
    }
    newChildContext(props) {
      return new Context({ ...this, parent: this, locals: new Map(), ...props })
    }
    analyze(node) {
      return this[node.constructor.name](node)
    }
    Program(p) {
      for(let statement of p.statements){
        this.analyze(statement)
      }
    }
    VariableDeclaration(d) {
      this.analyze(d.initializer)
      this.analyze(d.type)
      checkHaveSameType(d.type, d.initializer)

      d.id.value = new Variable(d.id.lexeme, d.type, d.readOnly)
      this.add(d.id.lexeme, d.id.value)
    }
    TypeDeclaration(d) {
      // Add early to allow recursion
      this.add(d.type.description, d.type)
      this.analyze(d.type.fields)
      checkFieldsAllDistinct(d.type.fields)
      checkNotRecursive(d.type)
    }
    Field(f) {
      this.analyze(f.type)
      if (f.type instanceof Token) f.type = f.type.value
      checkIsAType(f.type)
    }
    FunctionDeclaration(d) {
      this.analyze(d.type)
      d.func.value = new Function(
        d.func.lexeme,
        d.type
      )
      d.func.value.parameters = d.parameters
      checkIsAType(d.func.value.returnType)
      // When entering a function body, we must reset the inLoop setting,
      // because it is possible to declare a function inside a loop!
      const childContext = this.newChildContext({ inLoop: false, subroutine: d.func.value })
      childContext.analyze(d.func.value.parameters)
      d.func.value.type = new FunctionType(
        d.func.value.parameters.map(p => p.type),
        d.func.value.returnType
      )
      // Add before analyzing the body to allow recursion
      this.add(d.func.lexeme, d.func.value)
      childContext.analyze(d.body)
    }
    ProcedureDeclaration(d) {
      d.proc.value = new Procedure(
        d.proc.lexeme
      )
      d.proc.value.parameters = d.parameters
      const childContext = this.newChildContext({ inLoop: false, subroutine: d.proc.value })
      childContext.analyze(d.proc.value.parameters)
      d.proc.value.type = new ProcedureType(
        d.proc.value.parameters.map(p => p.type)
      )
      this.add(d.proc.lexeme, d.proc.value)
      childContext.analyze(d.body)
    }
    Parameter(p) {
      this.analyze(p.type)
      if (p.type instanceof Token) p.type = p.type.value
      checkIsAType(p.type)
      this.add(p.name.lexeme, p)
    }
    ListType(t) {
      this.analyze(t.baseType)
      if (t.baseType instanceof Token) t.baseType = t.baseType.value
    }
    FunctionType(t) {
      this.analyze(t.paramTypes)
      t.paramTypes = t.paramTypes.map(p => (p instanceof Token ? p.value : p))
      this.analyze(t.returnType)
      if (t.returnType instanceof Token) t.returnType = t.returnType.value
    }
    Increment(s) {
      this.analyze(s.variable)
      checkNumeric(s.variable)
    }
    Decrement(s) {
      this.analyze(s.variable)
      checkNumeric(s.variable)
    }
    Assignment(s) {
      this.analyze(s.source)
      this.analyze(s.target)
      checkAssignable(s.source, { toType: s.target.type })
      checkNotReadOnly(s.target)
    }
    BreakStatement(s) {
      checkInLoop(this)
    }
    ReturnStatement(s) {
      checkInFunction(this)
      this.analyze(s.expression)
      checkReturnable({ expression: s.expression, from: this.subroutine })
    }
    ConditionalStatement(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext().analyze(s.consequent)
      if (s.alternate !== null) {
        this.analyze(s.alternate)
      }
    }
    WhileStatement(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext({ inLoop: true }).analyze(s.body)
    }
    IncrementalForStatement(s) {
      this.analyze(s.test.left)
      checkBoolean(s.test.left)
      this.analyze(s.test.right)
      checkBoolean(s.test.right)

      this.analyze(s.increment)
      checkNumeric(s.increment)

      this.analyze(s.declaration.initializer)
      checkNumeric(s.declaration.initializer.type)
      s.iterator = new Variable(s.declaration.variable.lexeme, s.declaration.initializer.type, s.declaration.readOnly)
      const bodyContext = this.newChildContext({ inLoop: true })
      bodyContext.add(s.iterator.name, s.iterator)
      bodyContext.analyze(s.body)
    }
    ElementwiseForStatement(s) {
      this.analyze(s.source)
      checkList(s.source)

      const bodyContext = this.newChildContext({ inLoop: true })
      s.iterator = new Variable(s.iterator.lexeme, s.source.type.baseType, true)
      bodyContext.add(s.iterator.name, s.iterator)

      this.analyze(s.productionDec)
      
      bodyContext.analyze(s.body)
    }
    Conditional(e) {
      this.analyze(e.test)
      checkBoolean(e.test)
      this.analyze(e.consequent)
      this.analyze(e.alternate)
      checkHaveSameType(e.consequent, e.alternate)
      e.type = e.consequent.type
    }
    BinaryExpression(e) {
      this.analyze(e.left)
      this.analyze(e.right)
      if (["^", "-", "*", "/", "//", "%", "+"].includes(e.op.lexeme)) {
        checkNumeric(e.left)
        checkHaveSameType(e.left, e.right)
        e.type = e.left.type
      } else if (["<", "<=", ">", ">="].includes(e.op.lexeme)) {
        checkNumeric(e.left)
        checkHaveSameType(e.left, e.right)
        e.type = Type.BOOL
      } else if (["==", "!=", "is"].includes(e.op.lexeme)) {
        checkHaveSameType(e.left, e.right)
        e.type = Type.BOOL
      } else if (["or", "and"].includes(e.op.lexeme)) {
        checkBoolean(e.left)
        checkBoolean(e.right)
        e.type = Type.BOOL
      } else if (["C=", "C<"].includes(e.op.lexeme)) {
        checkList(e.right)
        checkList(e.left)
        e.type = Type.BOOL
      } else if (["in"].includes(e.op.lexeme)) {
        checkList(e.right)
        checkHaveSameType(e.left, e.right.baseType)
        e.type = Type.BOOL
      }
    }
    UnaryExpression(e) {
      this.analyze(e.operand)
      if (["-", "++", "--"].includes(e.op.lexeme)) {
        checkNumeric(e.operand)
        e.type = e.operand.type
      } else if (e.op.lexeme === "!") {
        checkBoolean(e.operand)
        e.type = Type.BOOL
      }
    }
    SubscriptExpression(e) {
      this.analyze(e.array)
      e.type = e.array.type.baseType
      this.analyze(e.index)
      checkInteger(e.index)
    }
    ArrayExpression(a) {
      this.analyze(a.elements)
      checkAllHaveSameType(a.elements)
      a.type = new ArrayType(a.elements[0].type)
    }
    EmptyArray(e) {
      this.analyze(e.baseType)
      e.type = new ArrayType(e.baseType?.value ?? e.baseType)
    }
    MemberExpression(e) {
      this.analyze(e.object)
      checkMemberDeclared(e.field.lexeme, { in: e.object })
      e.field = e.object.type.fields.find(f => f.name.lexeme === e.field.lexeme)
      e.type = e.field.type
    }
    FunctionCall(c) {
      this.analyze(c.callee)
      const callee = c.callee?.value ?? c.callee
      checkCallable(callee)
      this.analyze(c.args)
      if (callee.constructor === StructType || callee.constructor === ClassType) {
        checkConstructorArguments(c.args, callee)
        c.type = callee
      } else {
        checkFunctionCallArguments(c.args, callee.type)
        c.type = callee.type.returnType
      }
    }
    ProcedureCall(c) {
      this.analyze(c.callee)
      const callee = c.callee?.value ?? c.callee
      checkCallable(callee)
      this.analyze(c.args)
      if (callee.constructor === StructType || callee.constructor === ClassType) {
        checkConstructorArguments(c.args, callee)
        c.type = callee
      } else {
        checkFunctionCallArguments(c.args, callee.type)
        c.type = callee.type.returnType
      }
    }
    Token(t) {
      // For ids being used, not defined
      if (t.category === "id") {
        t.value = this.lookup(t.lexeme)
        t.type = t.value.type
      }
      if (t.category === "num") [t.value, t.type] = [Number(t.lexeme), Type.NUM]
      if (t.category === "string") [t.value, t.type] = [t.lexeme, Type.STRING]
      if (t.category === "bool") [t.value, t.type] = [t.lexeme === "true", Type.BOOL]
      if (t.category === "sym") {
        switch(t.lexeme) {
          case "num":
            t.type = Type.NUM
            break;

          case "string":
            t.type = Type.STRING
            break;

          case "bool":
            t.type = Type.BOOL
            break;
        }
      }
    }
    List(a) {
      a.forEach(item => this.analyze(item))
    }
  }
  
  export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.fundamentum)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
  }  