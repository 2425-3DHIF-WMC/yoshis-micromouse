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
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const program = parser.parseProgram();
  const semantic_analyzer = new SemanticAnalyzer();

  semantic_analyzer.analyze(program);

  const compiler = new BytecodeCompiler();
  const bytecode = compiler.compile(program);

  const vm = new VirtualMachine(maze, bytecode);

  res.status(StatusCodes.OK).json(JSON.stringify(vm.run()));
}
);
