import { ParametersParser } from '../ParametersParser';
import { SpecTreeNodeParam, SpecTreeLocationParam } from '../../models';
import jsonPointer from 'json-pointer';

export abstract class BaseOasParameterObjectsParser<D, P>
  implements ParametersParser
{
  protected constructor(private readonly doc: D) {}

  protected abstract parseParameter(
    pointer: string,
    parameter: P
  ): SpecTreeLocationParam;

  public parse(pointer: string): SpecTreeNodeParam[] {
    const parameters: P[] = jsonPointer.has(this.doc, pointer)
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    return parameters?.map(
      (parameter: P, idx: number): SpecTreeLocationParam =>
        this.parseParameter(`${pointer}/${idx}`, parameter)
    );
  }
}
