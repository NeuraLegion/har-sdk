import { VariableError } from './VariableError';

export class NoSuchVariable extends VariableError {
  constructor(variableName: string, jsonPointer?: string) {
    super(`Undefined variable: \`${variableName}\``, variableName, jsonPointer);
  }
}
