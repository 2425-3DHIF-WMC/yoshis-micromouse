import express from "express";
import { StatusCodes } from "http-status-codes";
import { Lexer } from "../compiler/lexer";
import { Parser } from "../compiler/parser";
import { SemanticAnalyzer } from "../compiler/semantic";
import { BytecodeCompiler } from "../compiler/compiler";
import { VirtualMachine } from "../compiler/vm";

export const compilerRouter = express.Router();

compilerRouter.post('/execute', async (req, res) => {
  const code: string = req.body.code;

  const maze: number[][] = req.body.maze;
  const lexer = new Lexer(code);
  let tokens;

  try {
    tokens = lexer.tokenize();
  } catch (e) {
    if (e instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).send("Lexer error: " + e.message);
    }
    return;
  }

  const parser = new Parser(tokens);

  let program;

  try {
    program = parser.parseProgram();
  } catch (e) {
    if (e instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).send("Parser error: " + e.message);
    }
    return;
  }

  const semantic_analyzer = new SemanticAnalyzer();

  try {
    semantic_analyzer.analyze(program)
  } catch (e) {
    if (e instanceof Error) {

      res.status(StatusCodes.BAD_REQUEST).send("Semantic Analysis Error: " + e.message);
    }
    return;
  }

  const compiler = new BytecodeCompiler();

  let bytecode;

  try {
    bytecode = compiler.compile(program);
  } catch (e) {
    if (e instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).send("Compiler Error: " + e.message);
    }
    return;
  }

  const vm = new VirtualMachine(maze, bytecode);
  let result;

  try {
    result = vm.run();
  } catch (e) {
    if (e instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).send("Runtime Error: " + e.message);
    }
    return;
  }


  res.status(StatusCodes.OK).json(JSON.stringify(result));
}
);
