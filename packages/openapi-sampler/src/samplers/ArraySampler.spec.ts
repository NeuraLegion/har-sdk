import { DefaultTraverse } from '../traverse';
import { ArraySampler } from './ArraySampler';
import { NumberSampler } from './NumberSampler';
import { ObjectSampler } from './ObjectSampler';
import { StringSampler } from './StringSampler';
import { Sampler } from './Sampler';
import { BooleanSampler } from './BooleanSampler';
import { NullSampler } from './NullSampler';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';

describe('Array sampler', async () => {
  let sampler: Sampler;

  before(() => {
    const traverse: DefaultTraverse = new DefaultTraverse();

    sampler = new ArraySampler(traverse);

    const SAMPLER_MAP = new Map<string, Sampler>();
    SAMPLER_MAP.set('array', sampler);
    SAMPLER_MAP.set('boolean', new BooleanSampler());
    SAMPLER_MAP.set('null', new NullSampler());
    SAMPLER_MAP.set('integer', new NumberSampler());
    SAMPLER_MAP.set('number', new NumberSampler());
    SAMPLER_MAP.set('object', new ObjectSampler(traverse));
    SAMPLER_MAP.set('string', new StringSampler());

    traverse.samplers = SAMPLER_MAP;
  });

  it('Should return empty array by default', () => {
    const res = sampler.sample({});

    expect(res).to.deep.equal([]);
  });

  it('Should return elements of correct type', () => {
    const res = sampler.sample({ items: { type: 'number' } });

    expect(typeof res[0]).to.equal('number');
  });

  it('Should return correct number of elements based on minItems', () => {
    const res = sampler.sample({ items: { type: 'number' }, minItems: 3 });

    expect(typeof res[0]).to.equal('number');
    expect(typeof res[1]).to.equal('number');
    expect(typeof res[2]).to.equal('number');
  });

  it('Should correcly sample tuples', () => {
    const res = sampler.sample({
      items: [{ type: 'number' }, { type: 'string' }, {}]
    });

    // eslint-disable-next-line @typescript-eslint/typedef
    const [integerValue, stringValue, unknownValue] = res;

    expect(typeof integerValue).to.equal('number');
    expect(typeof stringValue).to.equal('string');
    expect(unknownValue).to.equal(null);
  });
});
